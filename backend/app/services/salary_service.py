import joblib
import pandas as pd

from ..core.config import SALARY_MODEL_PATH
from ..schemas.salary import (
    SalaryPredictionRequest,
    SalaryPredictionResponse,
)


if not SALARY_MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Salary model artifact was not found: {SALARY_MODEL_PATH}"
    )

salary_model_bundle = joblib.load(SALARY_MODEL_PATH)

def predict_salary(
    request: SalaryPredictionRequest
) -> SalaryPredictionResponse:
    cleaned_technologies = []

    for technology in request.technologies:
        technology = technology.strip()

        if technology:
            cleaned_technologies.append(technology)

    unique_technologies = {
        technology.casefold()
        for technology in cleaned_technologies
    }

    computer_skills = len(unique_technologies)

    profile_dict = {
        "Country": request.country.strip(),
        "EdLevel": request.education_level,
        "YearsCode": request.years_code,
        "YearsCodePro": request.years_code_pro,
        "ComputerSkills": computer_skills,
    }

    profile_df = pd.DataFrame(profile_dict, index=[0])

    profile_df = profile_df[
        salary_model_bundle["features"]
    ]

    predicted_salary = float(
        salary_model_bundle["point_model"]
        .predict(profile_df)[0]
    )

    lower_salary = float(
        salary_model_bundle["lower_model"]
        .predict(profile_df)[0]
    )

    upper_salary = float(
        salary_model_bundle["upper_model"]
        .predict(profile_df)[0]
    )

    return SalaryPredictionResponse(
        predicted_salary=round(predicted_salary, 2),
        lower_salary=round(lower_salary, 2),
        upper_salary=round(upper_salary, 2),
        currency="USD",
        model_version=salary_model_bundle["model_version"],
    )