from pydantic import Field, BaseModel
from typing import Literal
from .salary import SalaryPredictionRequest, SalaryPredictionResponse
from .skill import SkillBenchmarkResponse
from .recommender import TechnologyRecommendationResponse


class CareerAnalysisRequest(SalaryPredictionRequest):
    current_salary: float | None = Field(
        default=None,
        ge=0
    )
    weekly_learning_hours: int = Field(
        default=7,
        ge=1,
        le=80
    )
    language: Literal["tr", "en"] = Field(
        default="tr"
    )


class RoadmapPhase(BaseModel):
    title: str
    objective: str
    actions: list[str] = Field(min_length=1)
    deliverable: str


class MentorReport(BaseModel):
    summary: str
    strengths: list[str] = Field(min_length=1)
    risks: list[str]
    recommended_technologies: list[str]
    salary_strategy: list[str] = Field(min_length=1)
    roadmap_30_days: RoadmapPhase
    roadmap_60_days: RoadmapPhase
    roadmap_90_days: RoadmapPhase


class CareerAnalysisResponse(BaseModel):
    salary: SalaryPredictionResponse
    skills: SkillBenchmarkResponse
    recommendations: TechnologyRecommendationResponse
    mentor_status: Literal["completed", "unavailable"]
    mentor_report: MentorReport | None = None
    mentor_message: str | None = None
    mentor_model: str | None = None
