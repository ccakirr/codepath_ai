from pydantic import BaseModel, Field


class TechnologyRecommendationRequest(BaseModel):
    technologies: list[str] = Field(min_length=1)

    top_n: int = Field(
        default=5,
        ge=1,
        le=10,
    )


class TechnologyRecommendationItem(BaseModel):
    technology: str
    similarity_score: float
    salary_score: float
    final_score: float


class TechnologyRecommendationResponse(BaseModel):
    recommendations: list[TechnologyRecommendationItem]

    recognized_technologies: list[str]
    ignored_technologies: list[str]

    model_version: str


class TechnologyCatalogResponse(BaseModel):
    technologies: list[str]
    count: int
    model_version: str
