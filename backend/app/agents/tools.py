from smolagents import Tool
import json


class CareerEvidenceTool(Tool):
    name = "get_career_evidence"

    description = (
        "Returns verified career evidence for the current user, including "
        "salary predictions, skill benchmarks, skill gap, and data-driven "
        "technology recommendations. Always use this tool before generating "
        "a career report or roadmap. Treat its results as authoritative and "
        "do not alter or invent numerical values."
    )

    inputs = {}
    output_type = "string"

    def __init__(self, ml_career_evidence: dict):
        super().__init__()
        self.evidence = ml_career_evidence

    def forward(self) -> str:
        return json.dumps(self.evidence, ensure_ascii=False)
