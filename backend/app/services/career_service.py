from ..schemas.career import CareerAnalysisRequest, CareerAnalysisResponse
from .salary_service import predict_salary
from .skill_service import analyze_skill_gap
from .recommender_service import recommend_technologies
from ..agents.career_agent import generate_mentor_report
from ..core.config import LLM_MODEL_ID
import logging


logger = logging.getLogger(__name__)


def build_career_evidence(request: CareerAnalysisRequest):
    salary_results = predict_salary(request).model_dump()
    skill_result = analyze_skill_gap(
        request.country,
        request.education_level,
        request.years_code_pro,
        request.technologies
    )
    skill_gap = skill_result["skill_gap"]
    recommended_technologies = recommend_technologies(
        request.technologies,
        skill_gap
    )

    return {
        "salary": salary_results,
        "skills": skill_result,
        "recommendations": recommended_technologies
    }


def analyze_career(request: CareerAnalysisRequest) -> CareerAnalysisResponse:
    evidence = build_career_evidence(request)

    try:
        mentor_report = generate_mentor_report(request, evidence)
        return CareerAnalysisResponse(
            **evidence,
            mentor_status="completed",
            mentor_report=mentor_report,
            mentor_model=LLM_MODEL_ID,
        )
    except Exception:
        logger.exception("Career mentor generation failed.")
        return CareerAnalysisResponse(
            **evidence,
            mentor_status="unavailable",
            mentor_message=(
                "AI mentor is temporarily unavailable. "
                "Core ML results are still available."
            ),
            mentor_model=LLM_MODEL_ID
        )
