# CodePath AI

A personal career mentoring platform for software developers.

## Problem

Software developers often struggle to understand their market position based on their own background. It can be difficult to estimate a realistic salary range, compare their skills with similar developers, identify missing competencies, and decide which technologies to learn next.

Generic career advice is often too broad. A developer with a specific country, education level, amount of experience, and technology stack needs guidance that reflects profiles similar to their own.

## Solution

CodePath AI analyzes a developer's country, education, coding experience, professional experience, and known technologies. It uses machine learning models and developer profile data to provide career insights.

CodePath AI can:

- Estimate a salary range based on similar developer profiles.
- Compare a user's skill level with developers who have similar experience and background.
- Estimate the number of missing skills in the user's profile.
- Identify complementary technologies from similar and higher-salary developer profiles.
- Provide data-informed technology recommendations.
- Send the machine learning results to an AI agent.
- Generate a personalized learning order, portfolio project idea, and 30/60/90-day career plan.

The platform helps answer four key questions:

1. How much could I earn?
2. Where do I stand compared with similar developers?
3. Which technologies should I learn next?
4. In what order and through which projects should I learn them?

## User Inputs

- Country
- Education level
- Total coding experience
- Professional coding experience
- Technologies currently used or known
- Current salary (optional)
- Weekly learning time available

## Outputs

After analyzing the user profile, CodePath AI provides:

- Estimated salary range
- Skill benchmark result compared with similar developers
- Estimated number of missing skills
- Recommended complementary technologies
- Suggested learning priorities
- Portfolio project recommendation
- Personalized 30/60/90-day career plan

## Important Limitations

- The system does not calculate a user's probability of getting hired.
- Salary estimates are not guarantees of actual salary offers.
- Skill recommendations do not prove that learning a technology will directly cause higher earnings.
- Sensitive personal attributes are not used in prediction models.
- The AI agent cannot modify, replace, or invent the numerical results produced by the machine learning models. It only interprets model outputs and turns them into clear, personalized career guidance.

## Technology Stack

| Layer            | Technology         |
|------------------|---------------------|
| Frontend         | React, JavaScript (Vite) |
| Backend          | FastAPI, Python     |
| Machine Learning | scikit-learn, pandas, numpy |
| Database         | PostgreSQL          |
| AI Agent         | LLM API             |
| Infrastructure   | Docker              |

## Project Structure

```
codepath_ai/
├── backend/          # FastAPI service (in progress)
├── frontend/         # React + Vite web app
├── ml/
│   └── notebooks/    # Model exploration and training notebooks
├── data/
│   ├── raw/          # Source datasets (e.g. Stack Overflow survey data)
│   └── processed/    # Cleaned/feature-engineered datasets
├── docs/             # Project documentation
├── artifacts/        # Trained model artifacts / exports
└── requirements.txt  # Python dependencies
```



## Status

This project is under active development. The frontend scaffold and dataset are in place; the backend API, ML pipeline, and AI agent integration are being built out.
