import joblib

from ..core.config import TECHNOLOGY_RECOMMENDER_PATH


if not TECHNOLOGY_RECOMMENDER_PATH.is_file():
    raise FileNotFoundError(
        "Technology recommender artifact was not found: "
        f"{TECHNOLOGY_RECOMMENDER_PATH}"
    )


recommender_bundle = joblib.load(
    TECHNOLOGY_RECOMMENDER_PATH
)

technology_similarity_matrix = recommender_bundle[
    "technology_similarity_matrix"
]

technology_salary_scores = recommender_bundle[
    "technology_salary_scores"
]

supported_technologies = recommender_bundle[
    "supported_technologies"
]

technology_name_lookup = {
    technology.casefold(): technology
    for technology in supported_technologies
}


def recommend_technologies(
    technologies: list[str],
    top_n: int = 5,
) -> dict:
    recognized_technologies = []
    ignored_technologies = []

    for technology in technologies:
        cleaned_technology = technology.strip()

        if not cleaned_technology:
            continue

        canonical_name = technology_name_lookup.get(
            cleaned_technology.casefold()
        )

        if canonical_name is None:
            ignored_technologies.append(
                cleaned_technology
            )
        elif canonical_name not in recognized_technologies:
            recognized_technologies.append(
                canonical_name
            )

    if not recognized_technologies:
        raise ValueError(
            "None of the provided technologies are supported."
        )

    similarity_scores = (
        technology_similarity_matrix[
            recognized_technologies
        ]
        .mean(axis=1)
        .drop(
            index=recognized_technologies,
            errors="ignore",
        )
    )

    recommendation_scores = (
        similarity_scores
        .rename("similarity_score")
        .to_frame()
        .join(
            technology_salary_scores.rename(
                "salary_score"
            ),
            how="left",
        )
    )

    recommendation_scores["salary_score"] = (
        recommendation_scores["salary_score"]
        .fillna(0.5)
    )

    similarity_weight = recommender_bundle[
        "similarity_weight"
    ]

    salary_weight = recommender_bundle[
        "salary_weight"
    ]

    recommendation_scores["final_score"] = (
        recommendation_scores["similarity_score"]
        * similarity_weight
        + recommendation_scores["salary_score"]
        * salary_weight
    )

    recommendations = (
        recommendation_scores
        .sort_values(
            "final_score",
            ascending=False,
        )
        .head(top_n)
        .round(4)
    )

    recommendations.index.name = "technology"

    return {
        "recommendations": (
            recommendations
            .reset_index()
            .to_dict(orient="records")
        ),
        "recognized_technologies": recognized_technologies,
        "ignored_technologies": ignored_technologies,
        "model_version": recommender_bundle[
            "model_version"
        ],
    }