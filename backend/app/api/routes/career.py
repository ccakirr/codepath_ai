from fastapi import APIRouter

from ...schemas.career import CareerAnalysisResponse, CareerAnalysisRequest
from ...services.career_service import analyze_career


router = APIRouter(
    prefix="/career",
    tags=["career"]
)


@router.post(
        "/analyze",
        response_model=CareerAnalysisResponse
)
def analyze(
    request: CareerAnalysisRequest
) -> CareerAnalysisResponse:
    return analyze_career(request=request)
