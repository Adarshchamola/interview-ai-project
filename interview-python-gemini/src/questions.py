# ─────────────────────────────────────────────────────
#  src/questions.py  —  Interview Question Generator
#  Uses Google Gemini (free)
# ─────────────────────────────────────────────────────

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.gemini_client import generate

router = APIRouter()

class QuestionRequest(BaseModel):
    domain: str
    round: int
    resumeText: Optional[str] = None

@router.post("/generate-questions")
def generate_questions(req: QuestionRequest):
    if req.round == 1:
        prompt = build_round1_prompt(req.domain)
    else:
        if not req.resumeText or not req.resumeText.strip():
            print("[Questions] No resume text, falling back to domain questions")
            prompt = build_round1_prompt(req.domain)
        else:
            prompt = build_round2_prompt(req.domain, req.resumeText)

    try:
        raw = generate(prompt, temperature=0.7, max_tokens=1500)
        questions = parse_questions(raw)
        print(f"[Questions] Generated {len(questions)} questions — Round {req.round} ({req.domain})")
        return {"questions": questions, "round": req.round}
    except Exception as e:
        print(f"[Questions] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

def build_round1_prompt(domain: str) -> str:
    import random
    angles = [
        "Focus on theoretical concepts and explain-the-why questions.",
        "Focus on practical coding and implementation questions.",
        "Focus on scenario-based and problem-solving questions.",
        "Focus on edge cases, debugging, and common mistakes.",
        "Focus on system design and architectural decisions.",
        "Focus on optimization, performance, and tradeoffs.",
    ]
    angle = random.choice(angles)
    seed = random.randint(1000, 9999)

    return f"""You are a senior technical interviewer (session #{seed}). Generate exactly 5 UNIQUE technical interview questions for the domain: "{domain}".

Angle for this session: {angle}

Requirements:
- Each question must be completely different from typical interview questions
- Vary difficulty: 2 medium, 2 hard, 1 very hard
- Each answerable verbally in 60-90 seconds
- Include a detailed expected answer outline for each

Respond ONLY with this exact JSON. No explanation, no markdown, no code fences:
{{
  "questions": [
    {{
      "text": "The interview question here?",
      "expectedAnswer": "Key points: 1. First point 2. Second point 3. Third point"
    }}
  ]
}}"""

def build_round2_prompt(domain: str, resume_text: str) -> str:
    import random
    angles = [
        "Focus on the technical challenges and problems faced in their projects.",
        "Focus on architectural decisions and why they chose specific technologies.",
        "Focus on what they would do differently and lessons learned.",
        "Focus on scalability, performance, and optimization of their projects.",
        "Focus on testing, debugging, and code quality in their work.",
        "Focus on teamwork, collaboration, and their specific contributions.",
    ]
    angle = random.choice(angles)
    seed = random.randint(1000, 9999)
    truncated = resume_text[:3000] if len(resume_text) > 3000 else resume_text

    return f"""You are a senior technical interviewer (session #{seed}). Here is the candidate's resume:

--- RESUME ---
{truncated}
--- END RESUME ---

Generate exactly 5 UNIQUE personalized interview questions based on this resume for a {domain} role.

Angle for this session: {angle}

Requirements:
- Reference specific projects, technologies, and experiences from the resume
- Each question must feel fresh and different from standard interview questions
- Ask about {angle.lower()}
- Each answerable verbally in 90-120 seconds
- Include a detailed expected answer outline

Respond ONLY with this exact JSON. No explanation, no markdown, no code fences:
{{
  "questions": [
    {{
      "text": "The personalized question here?",
      "expectedAnswer": "Key points: 1. First point 2. Second point"
    }}
  ]
}}"""

def parse_questions(raw: str) -> list:
    try:
        clean = raw.strip()
        if "```" in clean:
            parts = clean.split("```")
            clean = parts[1] if len(parts) > 1 else parts[0]
            if clean.startswith("json"):
                clean = clean[4:]
        data = json.loads(clean.strip())
        questions = data.get("questions", [])
        if not questions:
            raise ValueError("Empty questions array")
        return [{"text": q["text"], "expectedAnswer": q["expectedAnswer"]} for q in questions]
    except Exception as e:
        print(f"[Questions] Parse error: {e}\nRaw: {raw[:300]}")
        raise HTTPException(status_code=500, detail="Failed to parse questions from Gemini response.")
