"""Tiny SQLite store. NOTE: Render free-tier disk is ephemeral - data is lost on restart/redeploy.
For durable data point DB_PATH at a persistent disk, or move to Neon/Supabase (Phase 7)."""
import hashlib
import hmac
import json
import secrets
import sqlite3
from datetime import datetime, timezone

SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  district TEXT NOT NULL,
  education TEXT NOT NULL,
  age_band TEXT NOT NULL,
  language TEXT NOT NULL,
  top_career_id TEXT NOT NULL,
  fit INTEGER NOT NULL,
  skill_gaps TEXT NOT NULL,
  interests TEXT NOT NULL
);
"""


def connect(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(conn, s) -> tuple[str, str]:
    """Store one anonymous snapshot. Returns (id, delete_token). Token is shown once; only its hash is kept."""
    sid, token = secrets.token_urlsafe(9), secrets.token_urlsafe(24)
    conn.execute(
        "INSERT INTO sessions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (sid, _hash(token), datetime.now(timezone.utc).isoformat(timespec="seconds"), s.district, s.education,
         s.age_band, s.language, s.top_career_id, s.fit, json.dumps(s.skill_gaps), json.dumps(s.interests)),
    )
    conn.commit()
    return sid, token


def delete_session(conn, sid: str, token: str) -> bool:
    row = conn.execute("SELECT token_hash FROM sessions WHERE id=?", (sid,)).fetchone()
    if not row or not hmac.compare_digest(row["token_hash"], _hash(token or "")):
        return False
    conn.execute("DELETE FROM sessions WHERE id=?", (sid,))
    conn.commit()
    return True
