import os
import secrets
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

import db
import stats
from models import SessionIn, check_refs
from refs import load_refs

DB_PATH = os.getenv("DB_PATH", str(Path(__file__).with_name("margmitra.db")))
REFS = load_refs()
conn = None


@asynccontextmanager
async def lifespan(app):
    global conn
    conn = db.connect(DB_PATH)
    yield
    conn.close()


app = FastAPI(title="MargMitra API", version="0.3.0", lifespan=lifespan)

# Comma-separated frontend URLs allowed to call this API (set to your Vercel URL when deployed).
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins if o.strip()],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "X-Delete-Token", "X-Officer-Key"],
)

# very small in-memory rate limit for POST /sessions: 20 per minute per client
_hits: dict[str, deque] = defaultdict(deque)


def _rate_limit(request: Request, limit: int = 20, window: int = 60):
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "x")).split(",")[0].strip()
    now, q = time.monotonic(), _hits[ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Too many requests. Please wait a minute.")
    q.append(now)


@app.get("/")
def root():
    return {"service": "margmitra-api", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    """Tiny check so the frontend can tell if the backend is awake."""
    return {"status": "ok", "service": "margmitra-api"}


@app.post("/sessions", status_code=201)
def create_session(body: SessionIn, request: Request):
    """Save ONE anonymous snapshot (only if the student consented). No name, phone or free text is accepted."""
    _rate_limit(request)
    problems = check_refs(body, REFS)
    if problems:
        raise HTTPException(422, problems)
    sid, token = db.create_session(conn, body)
    return {"id": sid, "delete_token": token,
            "note": "Keep delete_token. It is the only way to delete this record later."}


@app.delete("/sessions/{sid}", status_code=204)
def delete_session(sid: str, x_delete_token: str = Header(default="")):
    if not db.delete_session(conn, sid, x_delete_token):
        raise HTTPException(404, "Not found or wrong token")
    return Response(status_code=204)


@app.get("/officer/stats")
def officer_stats(district: str | None = Query(default=None, max_length=40),
                  x_officer_key: str = Header(default="")):
    """Aggregates only. Needs the OFFICER_KEY environment variable to be set on the server."""
    key = os.getenv("OFFICER_KEY", "")
    if not key:
        raise HTTPException(503, "Officer access is not configured on this server")
    if not secrets.compare_digest(x_officer_key.encode(), key.encode()):
        raise HTTPException(401, "Invalid officer key")
    if district and district not in REFS["districts"]:
        raise HTTPException(422, "unknown district")
    min_group = int(os.getenv("MIN_GROUP", "5") or 5)
    return stats.aggregate(conn, district, min_group)
