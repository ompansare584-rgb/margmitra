"""Reference ids (skills, careers, districts, interest tags) written by scripts/build_data.mjs."""
import json
from pathlib import Path

_PATH = Path(__file__).with_name("ref_ids.json")


def load_refs() -> dict:
    data = json.loads(_PATH.read_text(encoding="utf-8"))
    return {k: set(v) for k, v in data.items()}
