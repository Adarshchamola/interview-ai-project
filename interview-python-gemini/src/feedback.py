# ─────────────────────────────────────────────────────
#  src/feedback.py  —  Written Feedback Generator
#  Uses Google Gemini (free)
# ─────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from src.gemini_client import generate

router = APIRouter()

class QuestionResult(BaseModel):
    text: str
    transcript: Optional[str] = None
    score: Optional[float] = None
    note: Optional[str] = None
    round: int

class FeedbackRequest(BaseModel):
    domain: str
    questions: List[QuestionResult]
    avgEyeContact: float
    avgWpm: float
    totalFillers: int

@router.post("/generate-feedback")
def generate_feedback(req: FeedbackRequest):
    prompt = build_feedback_prompt(req)
    try:
        feedback = generate(prompt, temperature=0.6, max_tokens=800)
        print(f"[Feedback] Generated {len(feedback)} character feedback report")
        return {"feedback": feedback}
    except Exception as e:
        print(f"[Feedback] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")

def build_feedback_prompt(req: FeedbackRequest) -> str:
    qa_summary = ""
    for i, q in enumerate(req.questions):
        score = q.score if q.score is not None else "N/A"
        note = q.note or "No note."
        round_label = "Round 1 (Domain)" if q.round == 1 else "Round 2 (Resume)"
        qa_summary += f"\nQ{i+1} [{round_label}]: {q.text}\nScore: {score}/10 — {note}\n"

    wpm_note = (
        "speaking too slowly" if req.avgWpm < 100
        else "speaking too fast" if req.avgWpm > 180
        else "speaking at a good pace"
    )
    eye_note = (
        "excellent eye contact" if req.avgEyeContact >= 80
        else "moderate eye contact" if req.avgEyeContact >= 60
        else "poor eye contact, suggesting low confidence"
    )

    return f"""You are an expert technical interview coach. Write a complete performance feedback
report for a candidate who just completed a mock technical interview for "{req.domain}".

SESSION METRICS:
- Average Eye Contact: {req.avgEyeContact:.1f}% ({eye_note})
- Average Speaking Rate: {req.avgWpm:.0f} WPM ({wpm_note})
- Total Filler Words: {req.totalFillers} (target is under 10)

QUESTION-BY-QUESTION RESULTS:
{qa_summary}

Write a feedback report with exactly these four sections as plain paragraphs (no bullet points, no headers):

1. Overall Assessment — Summarize overall performance honestly in 2-3 sentences.
2. Strengths — 2-3 specific things done well, referencing specific questions.
3. Areas to Improve — 2-3 specific weaknesses with actionable advice, referencing specific questions.
4. Next Steps — 2-3 concrete recommendations for what to study or practice.

Keep the entire response under 400 words. Be direct and coach-like. No bullet points, no markdown."""
