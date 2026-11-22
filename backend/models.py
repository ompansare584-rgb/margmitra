"""Request models. Deliberately has NO name, phone, email, Aadhaar, address or free text."""
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Education = Literal["class10", "iti", "class12", "diploma", "degree"]


class SessionIn(BaseModel):
    model_config = {"extra": "forbid"}  # reject unexpected fields (e.g. someone sending a phone number)

    district: str = Field(min_length=1, max_length=40)       # district id, e.g. "pune"
    education: Education
    age_band: Literal["under18", "18plus"]
    consent: bool                                              # student agreed to anonymous sharing
    parental_consent: bool = False                             # required when under18 (DPDP Act)
    language: Literal["mr", "en"] = "mr"
    top_career_id: str = Field(min_length=1, max_length=60)
    fit: int = Field(ge=0, le=100)
    skill_gaps: list[str] = Field(default_factory=list, max_length=15)
    interests: list[str] = Field(default_factory=list, max_length=6)

    @model_validator(mode="after")
    def _consent_rules(self):
        if not self.consent:
            raise ValueError("consent must be true to share anonymous data")
        if self.age_band == "under18" and not self.parental_consent:
            raise ValueError("parental_consent is required for under-18 students")
        return self


def check_refs(s: SessionIn, refs: dict) -> list[str]:
    """Return a list of problems (empty = OK). Ids must exist in the dataset."""
    bad = []
    if s.district not in refs["districts"]:
        bad.append(f"unknown district: {s.district}")
    if s.top_career_id not in refs["careers"]:
        bad.append(f"unknown career: {s.top_career_id}")
    bad += [f"unknown skill: {x}" for x in s.skill_gaps if x not in refs["skills"]]
    bad += [f"unknown interest: {x}" for x in s.interests if x not in refs["interest_tags"]]
    return bad
