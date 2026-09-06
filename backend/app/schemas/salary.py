from pydantic import BaseModel, Field, model_validator
from typing import Literal


class SalaryPredictionRequest(BaseModel):
    country: str = Field(min_length=2)
    education_level: Literal[
        "Undergraduate",
        "Master",
        "PhD",
        "NoHigherEd",
        "Other"
    ]
    years_code: int = Field(ge=0, le=50)
    years_code_pro: int = Field(ge=0, le=50)
    technologies: list[str]

    @model_validator(mode="after")
    def validate_experience(self):
        if self.years_code_pro > self.years_code:
            raise ValueError(
                "Professional coding experience cannot exceed total coding experience."
            )

        return self


class SalaryPredictionResponse(BaseModel):
    predicted_salary: float
    lower_salary: float
    upper_salary: float
    currency: str = "USD"
    model_version: str
