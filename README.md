# CodePath AI

Evidence-grounded career mentoring for software developers.

CodePath AI turns a developer profile (country, education, experience, tech stack)
into four concrete answers:

1. **How much could I earn?** — a salary estimate from similar developer profiles.
2. **Where do I stand?** — a skill benchmark against developers with a comparable background.
3. **What should I learn next?** — complementary technologies ranked from similar and higher-earning profiles.
4. **In what order?** — a personalized 30/60/90-day roadmap written by an AI mentor.

Three machine-learning models produce the numbers. An LLM agent reads those numbers
as **authoritative evidence** and turns them into a plan — it is not allowed to
change, recalculate, or invent any value. If the mentor step fails, the API still
returns the ML results with `mentor_status: "unavailable"`.

---

## Architecture

```
  React + Vite            FastAPI  ·  POST /api/v1/career/analyze
   (frontend)  ───────▶    served at / from frontend/dist in production
                                        │
                        ┌───────────────┴───────────────┐
                        │         career_service        │
                        │  runs the 3 ML models, then   │
                        │  the mentor agent on their     │
                        │  combined output               │
                        └───┬───────────┬───────────┬────┘
                            │           │           │
                   salary_service  skill_service  recommender_service
                   (salary bundle) (skill bundle) (recommender bundle)
                            │           │           │
                            └───────────┴───────────┘
                                        │  evidence dict
                                        ▼
                             career_agent (smolagents)
                         ToolCallingAgent + LiteLLM model
                     · get_career_evidence tool (authoritative)
                     · strict JSON instructions
                     · final_answer_check: recommended_technologies
                       must match the recommender output exactly
                                        │
                                        ▼
                                 MentorReport JSON
```

---

## Tech stack

| Layer            | Technology                                             |
|------------------|-------------------------------------------------------|
| Frontend         | React 19, Vite, vanilla CSS, EN/TR i18n               |
| Backend          | FastAPI, Pydantic v2, Uvicorn                         |
| Machine learning | scikit-learn, pandas, numpy, joblib                   |
| AI mentor        | smolagents `ToolCallingAgent` + LiteLLM (any provider)|
| Data             | Stack Overflow Developer Survey (2025 + prior years)  |
| Packaging        | Multi-stage Docker image, docker-compose              |

---

## Project structure

```
codepath_ai/
├── backend/
│   └── app/
│       ├── main.py               # FastAPI app, CORS, routers, static frontend mount
│       ├── api/routes/           # salary, skill, recommender, career endpoints
│       ├── schemas/              # Pydantic request/response models
│       ├── services/             # model loading + business logic
│       ├── agents/               # AI career mentor (smolagents)
│       │   ├── career_agent.py   # agent assembly + payload validation
│       │   ├── tools.py          # CareerEvidenceTool
│       │   ├── prompts.py        # mentor instructions / JSON contract
│       │   └── model_factory.py  # LiteLLM model from env config
│       └── core/config.py        # artifact paths + LLM settings, loads .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # single-page workspace
│   │   ├── i18n.js               # English / Turkish strings
│   │   └── App.css
│   └── dist/                     # production build (served by the backend)
├── ml/notebooks/
│   ├── 00_build_combined_dataset.ipynb   # merge 2025 survey with prior years
│   ├── 01_data_audit.ipynb
│   ├── 02_salary_model_baseline.ipynb
│   ├── 03_skill_benchmark_model.ipynb
│   └── 04_technology_recommender.ipynb
├── artifacts/                    # trained model bundles (committed)
│   ├── salary/salary_model_bundle_v2.joblib
│   ├── skills/skill_benchmark_bundle_v2.joblib
│   └── recommender/technology_recommender_bundle_v2.joblib
├── data/
│   ├── raw/                      # survey CSVs (gitignored — download separately)
│   └── processed/               # stackoverflow_combined.csv (gitignored)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Quick start with Docker

Builds the frontend and runs the API as a single container that serves both the
UI and the API on port 8000.

```bash
cp .env.example .env      # fill in LLM settings, or leave placeholders for ML-only mode
docker compose up --build
```

- App (UI + API): http://localhost:8000
- Interactive docs: http://localhost:8000/docs

`.env` is required by `docker-compose.yml`. Without a working `LLM_MODEL_ID` the
app still runs; `/career/analyze` returns the ML results with
`mentor_status: "unavailable"`.

---

## Local development

### Prerequisites

- Python 3.11+
- Node.js 20+
- An LLM endpoint reachable through LiteLLM (OpenAI, Anthropic, a local server, etc.)
  for the mentor feature. The ML endpoints work without it.

### 1. Backend

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # then fill in your LLM settings
```

Run the API from the repository root:

```bash
uvicorn backend.app.main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

The v2 model bundles in `artifacts/` are committed, so the ML endpoints work on a
fresh clone with no training step. If `frontend/dist/` exists it is served at `/`;
otherwise `/` is just the API.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on http://localhost:5173 (allow-listed in the backend CORS config). In dev
the frontend calls `http://127.0.0.1:8000`; in a production build it calls the
same origin it is served from.

---

## Configuration

### Backend (`.env` at repo root)

| Variable          | Required       | Description                                                            |
|-------------------|----------------|----------------------------------------------------------------------|
| `LLM_MODEL_ID`    | for the mentor | LiteLLM model id, e.g. `openai/gpt-4o-mini`, `anthropic/claude-sonnet-4` |
| `LLM_API_KEY`     | usually        | API key for the provider                                              |
| `LLM_API_BASE`    | optional       | Custom base URL (self-hosted / proxy / gateway)                       |
| `LLM_TEMPERATURE` | optional       | Sampling temperature (default `0.2`)                                  |

### Frontend

| Variable            | Default (dev)             | Description                                            |
|---------------------|---------------------------|------------------------------------------------------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000`   | Backend origin. Empty in production builds (same origin). |

---

## API reference

All routes are prefixed with `/api/v1`.

### `POST /career/analyze` — full analysis + mentor report

Request:

```json
{
  "country": "Turkey",
  "education_level": "Undergraduate",
  "years_code": 4,
  "years_code_pro": 1,
  "technologies": ["Python", "FastAPI", "React.js", "Docker"],
  "current_salary": null,
  "weekly_learning_hours": 8,
  "language": "en"
}
```

- `education_level`: `Undergraduate` · `Master` · `PhD` · `NoHigherEd` · `Other`
- `years_code`, `years_code_pro`: 0–50; `years_code_pro` must not exceed `years_code`
- `current_salary`: optional, `>= 0`
- `weekly_learning_hours`: 1–80 (default `7`)
- `language`: `en` · `tr` (report language, default `tr`)

Response (abridged):

```json
{
  "salary": {
    "predicted_salary": 0, "lower_salary": 0, "upper_salary": 0,
    "currency": "USD", "model_version": "..."
  },
  "skills": {
    "actual_skills": 0, "expected_skills": 0, "skill_gap": 0,
    "lower_benchmark": 0, "upper_benchmark": 0,
    "position": "within_benchmark",
    "cohort_size": 0,
    "benchmark_level": "country_education_experience",
    "experience_band": "2-4",
    "benchmark_version": "..."
  },
  "recommendations": {
    "recommendations": [
      { "technology": "PostgreSQL", "similarity_score": 0,
        "salary_score": 0, "final_score": 0 }
    ],
    "recognized_technologies": ["..."],
    "ignored_technologies": [],
    "model_version": "..."
  },
  "mentor_status": "completed",
  "mentor_report": {
    "summary": "...",
    "strengths": ["..."],
    "risks": ["..."],
    "recommended_technologies": ["..."],
    "salary_strategy": ["..."],
    "roadmap_30_days": { "title": "...", "objective": "...", "actions": ["..."], "deliverable": "..." },
    "roadmap_60_days": { "...": "..." },
    "roadmap_90_days": { "...": "..." }
  },
  "mentor_message": null,
  "mentor_model": "openai/gpt-4o-mini"
}
```

When `mentor_status` is `"unavailable"`, `mentor_report` is `null` and
`mentor_message` explains why.

- `skills.position`: `below_benchmark` · `within_benchmark` · `above_benchmark`
- `skills.benchmark_level` falls back from `country_education_experience` →
  `education_experience` → `experience` depending on cohort size
- `skills.experience_band`: `0-1` · `2-4` · `5-9` · `10-14` · `15+`

### Individual model endpoints

| Method & path                        | Purpose                                                                           |
|--------------------------------------|---------------------------------------------------------------------------------|
| `POST /salary/predict`               | Salary estimate only                                                             |
| `POST /skills/analyze`               | Skill benchmark / gap only (`country`, `education_level`, `years_code_pro`, `technologies`) |
| `POST /recommendations/technologies` | Technology recommendations only (`top_n`: 1–10, default 5)                        |
| `GET  /recommendations/catalog`      | Technologies the recommender understands (used by the frontend combobox)         |

---

## Machine learning models

`00_build_combined_dataset.ipynb` normalizes the 2025 Stack Overflow Developer
Survey (education level, employment, experience, salary, merged technology list)
and merges it with the earlier-years export into
`data/processed/stackoverflow_combined.csv`. The three model notebooks train on
that combined file and export versioned joblib bundles to `artifacts/`:

| Notebook                          | Bundle                                                | Output                                              |
|-----------------------------------|------------------------------------------------------|---------------------------------------------------|
| `02_salary_model_baseline.ipynb`  | `salary/salary_model_bundle_v2.joblib`               | Salary point estimate + range                     |
| `03_skill_benchmark_model.ipynb`  | `skills/skill_benchmark_bundle_v2.joblib`            | Expected skill count for a cohort, gap, position  |
| `04_technology_recommender.ipynb` | `recommender/technology_recommender_bundle_v2.joblib`| Technology similarity + salary-weighted ranking   |

The recommender notebook loads the trained salary bundle to compute
salary-weighted technology scores, so run the notebooks in order.

To re-train: place the Stack Overflow survey CSVs in `data/raw/` (gitignored),
run `00`, then `02`–`04`.

---

## How the AI mentor stays grounded

- The agent must call `get_career_evidence` before answering; the tool returns the
  ML output as JSON and its results are treated as trusted data, not instructions.
- The system prompt forbids modifying, recalculating, or fabricating salary
  figures, benchmarks, gaps, scores, or model versions, and forbids inventing a
  target role, employer, certification, or hiring probability.
- `recommended_technologies` must equal the recommender output exactly — the
  `final_answer_check` (`validate_mentor_payload`) rejects the report otherwise
  and the run fails closed.
- The report is returned as strict JSON validated against the `MentorReport`
  Pydantic model. The agent runs with `max_steps=4`.

---

## Limitations

- Salary figures are model-based estimates, not offers or guarantees.
- The system does not estimate the probability of being hired.
- A technology recommendation does not prove that learning it causes higher pay.
- Sensitive personal attributes are not used as model features.
- The AI mentor only interprets model output; it cannot override the numbers.
