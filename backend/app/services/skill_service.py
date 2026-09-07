import joblib

from ..core.config import SKILL_BENCHMARK_PATH


if not SKILL_BENCHMARK_PATH.is_file():
    raise FileNotFoundError(
        f"Skill benchmark artifact was not found: {SKILL_BENCHMARK_PATH}"
    )

skill_benchmark_bundle = joblib.load(
    SKILL_BENCHMARK_PATH
)

detailed_benchmark = skill_benchmark_bundle[
    "detailed_benchmark"
]

education_benchmark = skill_benchmark_bundle[
    "education_benchmark"
]

experience_benchmark = skill_benchmark_bundle[
    "experience_benchmark"
]


def get_experience_band(years_code_pro: int) -> str:
    if years_code_pro <= 1:
        return "0-1"
    elif years_code_pro <= 4:
        return "2-4"
    elif years_code_pro <= 9:
        return "5-9"
    elif years_code_pro <= 14:
        return "10-14"
    else:
        return "15+"


def get_skill_benchmark(
    country: str,
    education_level: str,
    years_code_pro: int,
) -> dict:
    experience_band = get_experience_band(
        years_code_pro
    )

    detailed_match = detailed_benchmark.loc[
        (detailed_benchmark["Country"] == country.strip())
        & (detailed_benchmark["EdLevel"] == education_level)
        & (
            detailed_benchmark["ExperienceBand"]
            == experience_band
        )
    ]

    if not detailed_match.empty:
        benchmark = detailed_match.iloc[0]
        benchmark_level = "country_education_experience"

    else:
        education_match = education_benchmark.loc[
            (education_benchmark["EdLevel"] == education_level)
            & (
                education_benchmark["ExperienceBand"]
                == experience_band
            )
        ]

        if not education_match.empty:
            benchmark = education_match.iloc[0]
            benchmark_level = "education_experience"

        else:
            experience_match = experience_benchmark.loc[
                experience_benchmark["ExperienceBand"]
                == experience_band
            ]

            benchmark = experience_match.iloc[0]
            benchmark_level = "experience"

    return {
        "benchmark_level": benchmark_level,
        "experience_band": experience_band,
        "cohort_size": int(benchmark["cohort_size"]),
        "expected_skills": int(
            round(benchmark["expected_skills"])
        ),
        "lower_benchmark": int(
            round(benchmark["lower_benchmark"])
        ),
        "upper_benchmark": int(
            round(benchmark["upper_benchmark"])
        ),
        "benchmark_version": skill_benchmark_bundle["version"],
    }


def analyze_skill_gap(
    country: str,
    education_level: str,
    years_code_pro: int,
    technologies: list[str],
) -> dict:
    cleaned_technologies = []

    for technology in technologies:
        technology = technology.strip()

        if technology:
            cleaned_technologies.append(technology)

    unique_technologies = {
        technology.casefold()
        for technology in cleaned_technologies
    }

    actual_skills = len(unique_technologies)

    result = get_skill_benchmark(
        country=country,
        education_level=education_level,
        years_code_pro=years_code_pro,
    )

    if actual_skills < result["lower_benchmark"]:
        position = "below_benchmark"
    elif actual_skills > result["upper_benchmark"]:
        position = "above_benchmark"
    else:
        position = "within_benchmark"

    result["actual_skills"] = actual_skills
    result["skill_gap"] = max(
        result["expected_skills"] - actual_skills,
        0,
    )
    result["position"] = position

    return result
