# ─────────────────────────────────────────────────────
#  main.py  —  Python AI Microservice Entry Point
#
#  Runs a FastAPI server on http://localhost:8000
#  The Node.js backend calls these endpoints.
#
#  6 endpoints:
#    POST /extract-resume      ← parse PDF/DOCX → text
#    POST /generate-questions  ← LLM → interview questions
#    POST /transcribe          ← Whisper → transcript
#    POST /grade-answer        ← LLM → score + note
#    POST /analyze-speech      ← librosa → WPM, fillers, silence
#    POST /generate-feedback   ← LLM → written feedback report
# ─────────────────────────────────────────────────────

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.resume    import router as resume_router
from src.questions import router as questions_router
from src.whisper   import router as whisper_router
from src.grading   import router as grading_router
from src.speech    import router as speech_router
from src.feedback  import router as feedback_router

app = FastAPI(
    title="Interview AI — Python Microservices",
    description="AI processing layer: resume parsing, question generation, transcription, grading, speech analysis, feedback generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # only the Node.js backend
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ── REGISTER ROUTERS ────────────────────────────────────
app.include_router(resume_router)
app.include_router(questions_router)
app.include_router(whisper_router)
app.include_router(grading_router)
app.include_router(speech_router)
app.include_router(feedback_router)

# ── HEALTH CHECK ────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "interview-ai-python"}
