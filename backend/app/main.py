from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from pathlib import Path

from .api.routes.salary import router as salary_router
from .api.routes.skill import router as skill_router
from .api.routes.recommender import router as recommender_router
from .api.routes.career import router as career_router


app = FastAPI(
    title="CodePath AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    salary_router,
    prefix="/api/v1",
)

app.include_router(
    skill_router,
    prefix="/api/v1"
)

app.include_router(
    recommender_router,
    prefix="/api/v1"
)

app.include_router(
    career_router,
    prefix="/api/v1"
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


FRONTEND_DIST = (
    Path(__file__).resolve().parents[2]
    / "frontend"
    / "dist"
)

if FRONTEND_DIST.exists():
    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIST, html=True),
        name="frontend",
    )
