# ─────────────────────────────────────────────────────
#  src/whisper.py  —  Audio Transcription
#  Runs locally on your PC — completely free
# ─────────────────────────────────────────────────────

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        print(f"[Whisper] Loading '{WHISPER_MODEL_SIZE}' model...")
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
        print(f"[Whisper] Model ready.")
    return _whisper_model

class TranscribeRequest(BaseModel):
    audioPath: str

@router.post("/transcribe")
def transcribe(req: TranscribeRequest):
    if not os.path.exists(req.audioPath):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {req.audioPath}")
    try:
        model = get_whisper_model()
        result = model.transcribe(req.audioPath, language="en", fp16=False)
        transcript = result["text"].strip()
        word_count = len(transcript.split())
        print(f"[Whisper] Transcribed {word_count} words from {os.path.basename(req.audioPath)}")
        return {"transcript": transcript, "wordCount": word_count}
    except Exception as e:
        print(f"[Whisper] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
