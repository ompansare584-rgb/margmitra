import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MargMitra API", version="0.1.0")

# Comma-separated list of frontend URLs that may call this API.
# Local default is the Vite dev server. When deployed, set ALLOWED_ORIGINS
# to your Vercel URL, for example: https://margmitra.vercel.app
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "margmitra-api", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    """Tiny check so the frontend can tell if the backend is awake."""
    return {"status": "ok", "service": "margmitra-api"}
