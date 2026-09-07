from pathlib import Path
from dotenv import load_dotenv
import os


PROJECT_ROOT = Path(__file__).resolve().parents[3]

load_dotenv(PROJECT_ROOT / ".env")

SALARY_MODEL_PATH = (
    PROJECT_ROOT
    / "artifacts"
    / "salary"
    / "salary_model_bundle_v1.joblib"
)

SKILL_BENCHMARK_PATH = (
    PROJECT_ROOT
    / "artifacts"
    / "skills"
    / "skill_benchmark_bundle_v1.joblib"
)

TECHNOLOGY_RECOMMENDER_PATH = (
    PROJECT_ROOT
    / "artifacts"
    / "recommender"
    / "technology_recommender_bundle_v1.joblib"
)

LLM_MODEL_ID = os.getenv("LLM_MODEL_ID")
LLM_API_KEY = os.getenv("LLM_API_KEY") or None
LLM_API_BASE = os.getenv("LLM_API_BASE") or None
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
