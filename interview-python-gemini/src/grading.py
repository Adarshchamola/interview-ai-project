# ─────────────────────────────────────────────────────
#  src/grading.py  —  Answer Grading
#  Uses Google Gemini (free)
# ─────────────────────────────────────────────────────

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.gemini_client import generate

router = APIRouter()

class GradingRequest(BaseModel):
    questionText: str
    expectedAnswer: str
    transcript: str

@router.post("/grade-answer")
def grade_answer(req: GradingRequest):
    if not req.transcript or not req.transcript.strip():
        return {"score": 0, "note": "No answer provided."}

    prompt = f"""You are a strict but fair technical interviewer. Grade this interview answer.

QUESTION:
{req.questionText}

EXPECTED ANSWER (key points that should be covered):
{req.expectedAnswer}

CANDIDATE'S ANSWER (transcribed from speech):
{req.transcript}

Grading scale:
- 9-10: Complete, accurate, well-explained with examples
- 7-8:  Mostly correct, covers main points, minor gaps
- 5-6:  Partially correct, misses some key concepts
- 3-4:  Shows basic understanding but significant gaps
- 1-2:  Major misconceptions or very incomplete
- 0:    Completely wrong or no answer

Be lenient about informal speech since this is a spoken answer. Focus on technical correctness.

Respond ONLY with this exact JSON. No explanation, no markdown, no code fences:
{{
  "score": 7,
  "note": "One sentence explaining the score."
}}"""

    try:
        raw = generate(prompt, temperature=0.2, max_tokens=150)
        result = parse_grade(raw)
        print(f"[Grading] Score: {result['score']}/10 — {result['note']}")
        return result
    except Exception as e:
        print(f"[Grading] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")

def parse_grade(raw: str) -> dict:
    try:
        clean = raw.strip()
        if "```" in clean:
            parts = clean.split("```")
            clean = parts[1] if len(parts) > 1 else parts[0]
            if clean.startswith("json"):
                clean = clean[4:]
        data = json.loads(clean.strip())
        score = float(data.get("score", 5))
        score = max(0.0, min(10.0, score))
        note = str(data.get("note", "No justification provided."))
        return {"score": score, "note": note}
    except Exception as e:
        print(f"[Grading] Parse error: {e}")
        return {"score": 5.0, "note": "Could not parse grading response."}
