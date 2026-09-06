from typing import Literal

from pydantic import BaseModel, Field


class SkillBenchmarkRequest(BaseModel):
    country: str = Field(min_length=2)

    education_level: Literal[
        "Undergraduate",
        "Master",
        "PhD",
        "NoHigherEd",
        "Other",
    ]

    years_code_pro: int = Field(
        ge=0,
        le=50,
    )

    technologies: list[str]


class SkillBenchmarkResponse(BaseModel):
    actual_skills: int
    expected_skills: int
    skill_gap: int

    lower_benchmark: int
    upper_benchmark: int

    position: Literal[
        "below_benchmark",
        "within_benchmark",
        "above_benchmark",
    ]

    cohort_size: int

    benchmark_level: Literal[
        "country_education_experience",
        "education_experience",
        "experience",
    ]

    experience_band: Literal[
        "0-1",
        "2-4",
        "5-9",
        "10-14",
        "15+",
    ]

    benchmark_version: str