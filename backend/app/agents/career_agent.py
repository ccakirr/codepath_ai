from smolagents import ToolCallingAgent
from .tools import CareerEvidenceTool
from .model_factory import create_llm_model
from .prompts import CAREER_MENTOR_INSTRUCTIONS
from ..schemas.career import CareerAnalysisRequest, MentorReport


def create_career_agent(evidence: dict) -> ToolCallingAgent:
    evidence_tool = CareerEvidenceTool(evidence)
    model = create_llm_model()

    return ToolCallingAgent(
        tools=[evidence_tool],
        model=model,
        final_answer_checks=[
            build_mentor_answer_check(evidence=evidence)
        ],
        instructions=CAREER_MENTOR_INSTRUCTIONS,
        max_steps=4
    )


def build_mentor_answer_check(evidence: dict):
    def check_mentor_answer(final_answer, memory, agent):
        validate_mentor_payload(final_answer, evidence)
        return True

    return check_mentor_answer


def validate_mentor_payload(
    payload,
    evidence: dict,
) -> MentorReport:
    if isinstance(payload, str):
        report = MentorReport.model_validate_json(payload)
    else:
        report = MentorReport.model_validate(payload)

    expected_technologies = [
        recommendation["technology"]
        for recommendation in evidence["recommendations"]["recommendations"]
    ]

    if report.recommended_technologies != expected_technologies:
        raise ValueError(
            "Mentor report technologies do not match model recommendations."
        )

    return report


def generate_mentor_report(
        request: CareerAnalysisRequest,
        evidence: dict
) -> MentorReport:
    agent = create_career_agent(evidence)

    if request.current_salary is None:
        current_salary_text = "not provided"
    else:
        current_salary_text = request.current_salary

    task = f"""
        Report language: {request.language}
        Weekly learning hours: {request.weekly_learning_hours}
        Current salary: {current_salary_text}
        You must call "get_career_evidence" tool and generate JSON report
        like instructions.
    """

    agent_result = agent.run(task=task)

    return validate_mentor_payload(agent_result, evidence)
