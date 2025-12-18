from typing import List, Dict, Any
import random


class AIService:
    async def generate_analysis(
        self,
        transcripts: List[dict],
        topic: str,
        stance: str
    ) -> Dict[str, Any]:
        overall_score = random.uniform(6.5, 9.5)
        clarity_score = random.uniform(6.0, 9.5)
        logic_score = random.uniform(6.5, 9.0)
        evidence_score = random.uniform(5.5, 9.0)
        rebuttal_score = random.uniform(6.0, 9.0)
        persuasiveness_score = random.uniform(6.5, 9.5)

        strengths = [
            "Clear articulation of main arguments",
            "Effective use of evidence and examples",
            "Strong logical structure",
            "Good rhetorical techniques"
        ]

        weaknesses = [
            "Could provide more concrete examples",
            "Some arguments need stronger evidence",
            "Transition between points could be smoother"
        ]

        recommendations = [
            "Practice addressing counter-arguments more directly",
            "Incorporate more statistical data to support claims",
            "Work on vocal variety and pacing",
            "Develop stronger opening and closing statements"
        ]

        weak_portions = []
        for i, transcript in enumerate(transcripts[:3]):
            if transcript.get("speaker") == "user":
                weak_portions.append({
                    "timestamp": i * 30,
                    "text": transcript.get("text", "")[:100],
                    "issue": random.choice([
                        "Needs more evidence",
                        "Logic could be stronger",
                        "Unclear phrasing"
                    ])
                })

        return {
            "overall_score": round(overall_score, 2),
            "clarity_score": round(clarity_score, 2),
            "logic_score": round(logic_score, 2),
            "evidence_score": round(evidence_score, 2),
            "rebuttal_score": round(rebuttal_score, 2),
            "persuasiveness_score": round(persuasiveness_score, 2),
            "strengths": strengths[:random.randint(3, 4)],
            "weaknesses": weaknesses[:random.randint(2, 3)],
            "recommendations": recommendations[:random.randint(3, 4)],
            "weak_portions": weak_portions
        }
