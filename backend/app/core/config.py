from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]

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