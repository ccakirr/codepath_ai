from fastapi import APIRouter, HTTPException

from ...schemas.recommender import (
    TechnologyCatalogResponse,
    TechnologyRecommendationRequest,
    TechnologyRecommendationResponse,
)
from ...services.recommender_service import (
    get_supported_technologies,
    recommend_technologies,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)


@router.get(
    "/catalog",
    response_model=TechnologyCatalogResponse,
)
def get_technology_catalog_endpoint() -> TechnologyCatalogResponse:
    return TechnologyCatalogResponse(
        **get_supported_technologies()
    )


@router.post(
    "/technologies",
    response_model=TechnologyRecommendationResponse,
)
def recommend_technologies_endpoint(
    request: TechnologyRecommendationRequest,
) -> TechnologyRecommendationResponse:
    try:
        result = recommend_technologies(
            technologies=request.technologies,
            top_n=request.top_n,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    return TechnologyRecommendationResponse(**result)
