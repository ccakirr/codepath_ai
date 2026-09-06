from fastapi import APIRouter
from ...services.salary_service import predict_salary
from ...schemas.salary import SalaryPredictionResponse, SalaryPredictionRequest

router = APIRouter(prefix="/salary", tags=["salary"])

@router.post(path= "/predict", response_model= SalaryPredictionResponse)
def predict_salary_endpoint(
    request: SalaryPredictionRequest
    ) -> SalaryPredictionResponse:
    return predict_salary(request)
