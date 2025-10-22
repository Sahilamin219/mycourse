import os
from typing import List, Dict
import json

def analyze_debate_performance(transcripts: List[Dict[str, str]]) -> Dict:
    """
    Analyze debate performance based on transcripts.
    This uses rule-based analysis. For production, integrate with OpenAI API or similar.
    """

    user_transcripts = [t for t in transcripts if t['speaker'] == 'user']
    partner_transcripts = [t for t in transcripts if t['speaker'] == 'partner']

    if not user_transcripts:
        return {
            'overall_score': 0,
            'communication_score': 0,
            'argumentation_score': 0,
            'clarity_score': 0,
            'strengths': ['No data available'],
            'weaknesses': ['Complete the debate to get analysis'],
            'key_insights': 'Unable to analyze - no transcripts recorded'
        }

    total_words = sum(len(t['text'].split()) for t in user_transcripts)
    avg_words_per_response = total_words / len(user_transcripts) if user_transcripts else 0

    communication_score = min(100, int((len(user_transcripts) / max(len(partner_transcripts), 1)) * 80))

    question_words = ['what', 'why', 'how', 'when', 'where', 'who', 'which']
    questions_asked = sum(
        1 for t in user_transcripts
        if any(word in t['text'].lower() for word in question_words) and '?' in t['text']
    )
    argumentation_score = min(100, int((questions_asked * 10) + (avg_words_per_response * 2)))

    short_responses = sum(1 for t in user_transcripts if len(t['text'].split()) < 5)
    clarity_score = max(0, 100 - (short_responses * 10))

    overall_score = int((communication_score + argumentation_score + clarity_score) / 3)

    strengths = []
    if len(user_transcripts) > 5:
        strengths.append("Active participation in the debate")
    if avg_words_per_response > 15:
        strengths.append("Detailed and thoughtful responses")
    if questions_asked > 2:
        strengths.append("Good use of questions to engage")
    if clarity_score > 70:
        strengths.append("Clear and coherent communication")

    weaknesses = []
    if len(user_transcripts) < 5:
        weaknesses.append("Limited participation - try to engage more")
    if avg_words_per_response < 10:
        weaknesses.append("Responses are too brief - elaborate more")
    if questions_asked < 2:
        weaknesses.append("Ask more questions to drive the conversation")
    if clarity_score < 50:
        weaknesses.append("Work on providing more complete responses")

    if not strengths:
        strengths = ["Keep practicing to develop your strengths"]
    if not weaknesses:
        weaknesses = ["Great performance overall!"]

    key_insights = f"""
Based on your debate performance:
- You participated {len(user_transcripts)} times with an average of {avg_words_per_response:.1f} words per response
- {'Strong' if communication_score > 70 else 'Moderate'} engagement level
- {'Good' if questions_asked > 2 else 'Limited'} use of questions to engage
- {'Clear' if clarity_score > 70 else 'Could improve'} communication style

Keep practicing to improve your debate and communication skills!
""".strip()

    return {
        'overall_score': overall_score,
        'communication_score': communication_score,
        'argumentation_score': argumentation_score,
        'clarity_score': clarity_score,
        'strengths': strengths,
        'weaknesses': weaknesses,
        'key_insights': key_insights
    }


async def generate_ai_analysis(session_id: str, user_id: str, transcripts: List[Dict]) -> Dict:
    """
    Generate AI analysis for a debate session.
    For production: Replace with OpenAI API integration.
    """

    analysis = analyze_debate_performance(transcripts)

    return {
        'session_id': session_id,
        'user_id': user_id,
        **analysis
    }
