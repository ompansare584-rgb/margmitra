"""Small data store. Local default: SQLite file. In production set DATABASE_URL (Neon/Supabase Postgres)
so data survives restarts (Render's free disk is wiped on restart/redeploy).
The Postgres path is written but was NOT run in the build sandbox: test it once after deploying."""
import hashlib
import hmac
import json
import secrets
import sqlite3
import threading
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
)"""


class Store:
    """One shared connection guarded by a lock (the API serves requests from several threads).
    Postgres hosts such as Neon close idle connections, so a dropped connection is reopened once and the call retried."""

    def __init__(self, target: str):
        self._target = target
        self._pg = target.startswith(("postgres://", "postgresql://"))
        self._lock = threading.Lock()
        self._conn = self._open()
        self.write(SCHEMA)

    def _open(self):
        if self._pg:
            import psycopg
            from psycopg.rows import dict_row

            # prepare_threshold=None: works with pooled (pgbouncer) Neon/Supabase URLs
            return psycopg.connect(self._target, row_factory=dict_row, prepare_threshold=None)
        conn = sqlite3.connect(self._target, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _sql(self, sql):
        return sql.replace("?", "%s") if self._pg else sql

    def _run(self, sql, args, commit):
        for attempt in (1, 2):
            try:
                if self._pg and self._conn.closed:
                    self._conn = self._open()
                cur = self._conn.execute(self._sql(sql), args)
                rows = None if commit else cur.fetchall()
                if commit:
                    self._conn.commit()
                    return cur.rowcount
                return rows
            except Exception as exc:
                try:
                    self._conn.rollback()
                except Exception:
                    pass
                if self._pg and attempt == 1 and exc.__class__.__module__.startswith("psycopg") and \
                        exc.__class__.__name__ in ("OperationalError", "InterfaceError"):
                    self._conn = self._open()  # connection was dropped: reopen and retry once
                    continue
                raise

    def query(self, sql, args=()):
        with self._lock:
            return self._run(sql, args, commit=False)

    def write(self, sql, args=()) -> int:
        with self._lock:
            return self._run(sql, args, commit=True)

    def close(self):
        self._conn.close()


def connect(target: str) -> Store:
    """target = a Postgres URL (postgresql://...) or a path to a SQLite file."""
    return Store(target)


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(store: Store, s) -> tuple[str, str]:
    """Store one anonymous snapshot. Returns (id, delete_token). Token is shown once; only its hash is kept."""
    sid, token = secrets.token_urlsafe(9), secrets.token_urlsafe(24)
    store.write(
        "INSERT INTO sessions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (sid, _hash(token), datetime.now(timezone.utc).isoformat(timespec="seconds"), s.district, s.education,
         s.age_band, s.language, s.top_career_id, s.fit, json.dumps(s.skill_gaps), json.dumps(s.interests)),
    )
    return sid, token


def delete_session(store: Store, sid: str, token: str) -> bool:
    rows = store.query("SELECT token_hash FROM sessions WHERE id=?", (sid,))
    if not rows or not hmac.compare_digest(rows[0]["token_hash"], _hash(token or "")):
        return False
    store.write("DELETE FROM sessions WHERE id=?", (sid,))
    return True
