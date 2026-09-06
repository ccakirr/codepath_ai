from fastapi import APIRouter

from ...schemas.skill import (
    SkillBenchmarkRequest,
    SkillBenchmarkResponse,
)
from ...services.skill_service import analyze_skill_gap


router = APIRouter(
    prefix="/skills",
    tags=["skills"],
)


@router.post(
    "/analyze",
    response_model=SkillBenchmarkResponse,
)
def analyze_skill_gap_endpoint(
    request: SkillBenchmarkRequest,
) -> SkillBenchmarkResponse:
    result = analyze_skill_gap(
        country=request.country,
        education_level=request.education_level,
        years_code_pro=request.years_code_pro,
        technologies=request.technologies,
    )

    return SkillBenchmarkResponse(**result)