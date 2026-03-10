import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
_model = None

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        print(f"[Whisper] Loading '{WHISPER_MODEL_SIZE}' model...")
        _model = WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
        print("[Whisper] Model ready.")
    return _model

class TranscribeRequest(BaseModel):
    audioPath: str

@router.post("/transcribe")
def transcribe(req: TranscribeRequest):
    if not os.path.exists(req.audioPath):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {req.audioPath}")
    try:
        model = get_model()
        segments, _ = model.transcribe(req.audioPath, language="en")
        transcript = " ".join([seg.text for seg in segments]).strip()
        print(f"[Whisper] Transcribed {len(transcript.split())} words")
        return {"transcript": transcript, "wordCount": len(transcript.split())}
    except Exception as e:
        print(f"[Whisper] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")