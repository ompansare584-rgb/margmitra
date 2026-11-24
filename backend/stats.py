"""Officer statistics with small-group suppression. A group smaller than MIN_GROUP is never shown."""
import json
from collections import Counter

HARD_MIN_GROUP = 5  # configuration may raise this, never lower it


def effective_min(requested: int | None) -> int:
    return max(HARD_MIN_GROUP, requested or HARD_MIN_GROUP)


def _keep(counter: Counter, k: int, top: int = 10):
    return [{"key": key, "count": n} for key, n in counter.most_common() if n >= k][:top]


def aggregate(store, district: str | None = None, min_group: int | None = None) -> dict:
    k = effective_min(min_group)
    q, args = "SELECT district, education, top_career_id, fit, skill_gaps FROM sessions", ()
    if district:
        q, args = q + " WHERE district=?", (district,)
    rows = store.query(q, args)
    n = len(rows)
    base = {"min_group": k, "district": district, "source": "student sessions stored by this server"}
    if n < k:
        return {**base, "suppressed": True,
                "message": f"Fewer than {k} students so far. Details are hidden to protect privacy."}
    gaps, careers, edu, dist = Counter(), Counter(), Counter(), Counter()
    for r in rows:
        careers[r["top_career_id"]] += 1
        edu[r["education"]] += 1
        dist[r["district"]] += 1
        gaps.update(set(json.loads(r["skill_gaps"])))
    return {**base, "suppressed": False, "total_students": n,
            "average_fit": round(sum(r["fit"] for r in rows) / n),
            "top_skill_gaps": _keep(gaps, k), "top_careers": _keep(careers, k),
            "by_education": _keep(edu, k, 5), "by_district": _keep(dist, k, 36)}
