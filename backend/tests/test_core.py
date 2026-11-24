import sys, unittest, tempfile, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pydantic import ValidationError
import db, stats
from models import SessionIn, check_refs
from refs import load_refs

REFS = load_refs()

def payload(**kw):
    base = dict(district="pune", education="iti", age_band="18plus", consent=True, language="mr",
                top_career_id="electrician", fit=72, skill_gaps=["wiring", "earthing"], interests=["machines"])
    base.update(kw); return base

class Models(unittest.TestCase):
    def test_valid(self):
        s = SessionIn(**payload()); self.assertEqual(check_refs(s, REFS), [])
    def test_consent_required(self):
        with self.assertRaises(ValidationError): SessionIn(**payload(consent=False))
    def test_under18_needs_parent(self):
        with self.assertRaises(ValidationError): SessionIn(**payload(age_band="under18"))
        SessionIn(**payload(age_band="under18", parental_consent=True))
    def test_rejects_personal_fields(self):
        for extra in ({"name": "Asha"}, {"phone": "9999999999"}, {"aadhaar": "1"}):
            with self.assertRaises(ValidationError): SessionIn(**payload(**extra))
    def test_bad_ids(self):
        self.assertTrue(check_refs(SessionIn(**payload(district="nowhere")), REFS))
        self.assertTrue(check_refs(SessionIn(**payload(top_career_id="pilot")), REFS))
        self.assertTrue(check_refs(SessionIn(**payload(skill_gaps=["flying"])), REFS))
    def test_fit_range(self):
        with self.assertRaises(ValidationError): SessionIn(**payload(fit=101))

class Store(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(); self.conn = db.connect(os.path.join(self.tmp, "t.db"))
    def tearDown(self): self.conn.close()
    def test_create_delete(self):
        sid, tok = db.create_session(self.conn, SessionIn(**payload()))
        self.assertFalse(db.delete_session(self.conn, sid, "wrong"))
        self.assertTrue(db.delete_session(self.conn, sid, tok))
        self.assertFalse(db.delete_session(self.conn, sid, tok))
    def test_token_not_stored_plain(self):
        sid, tok = db.create_session(self.conn, SessionIn(**payload()))
        row = self.conn.query("SELECT * FROM sessions")[0]
        self.assertNotIn(tok, [str(v) for v in tuple(row)])
    def test_stats_suppression(self):
        for _ in range(4): db.create_session(self.conn, SessionIn(**payload()))
        r = stats.aggregate(self.conn); self.assertTrue(r["suppressed"]); self.assertNotIn("total_students", r)
        db.create_session(self.conn, SessionIn(**payload()))
        r = stats.aggregate(self.conn); self.assertFalse(r["suppressed"]); self.assertEqual(r["total_students"], 5)
        self.assertEqual(r["top_skill_gaps"][0]["count"], 5)
    def test_small_groups_hidden_inside_stats(self):
        for _ in range(5): db.create_session(self.conn, SessionIn(**payload()))
        for _ in range(2): db.create_session(self.conn, SessionIn(**payload(top_career_id="welder", district="nashik", skill_gaps=["arc_welding"])))
        r = stats.aggregate(self.conn)
        self.assertEqual([c["key"] for c in r["top_careers"]], ["electrician"])
        self.assertNotIn("arc_welding", [g["key"] for g in r["top_skill_gaps"]])
        self.assertEqual([d["key"] for d in r["by_district"]], ["pune"])
    def test_min_group_cannot_go_below_5(self):
        self.assertEqual(stats.effective_min(1), 5); self.assertEqual(stats.effective_min(10), 10)
        for _ in range(4): db.create_session(self.conn, SessionIn(**payload()))
        self.assertTrue(stats.aggregate(self.conn, min_group=1)["suppressed"])
    def test_district_filter(self):
        for _ in range(5): db.create_session(self.conn, SessionIn(**payload()))
        self.assertTrue(stats.aggregate(self.conn, "nashik")["suppressed"])

try:
    from fastapi.testclient import TestClient
    HAVE = True
except Exception:
    HAVE = False

@unittest.skipUnless(HAVE, "fastapi/httpx not installed: API route tests skipped")
class Routes(unittest.TestCase):
    def test_flow(self):
        os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "r.db"); os.environ["OFFICER_KEY"] = "k1"
        import importlib, main; importlib.reload(main)
        with TestClient(main.app) as c:
            self.assertEqual(c.get("/health").status_code, 200)
            r = c.post("/sessions", json=payload()); self.assertEqual(r.status_code, 201)
            sid, tok = r.json()["id"], r.json()["delete_token"]
            self.assertEqual(c.post("/sessions", json=payload(consent=False)).status_code, 422)
            self.assertEqual(c.post("/sessions", json=payload(district="zzz")).status_code, 422)
            self.assertEqual(c.get("/officer/stats").status_code, 401)
            self.assertEqual(c.get("/officer/stats", headers={"X-Officer-Key": "k1"}).json()["suppressed"], True)
            self.assertEqual(c.delete(f"/sessions/{sid}", headers={"X-Delete-Token": "bad"}).status_code, 404)
            self.assertEqual(c.delete(f"/sessions/{sid}", headers={"X-Delete-Token": tok}).status_code, 204)

if __name__ == "__main__":
    unittest.main()
