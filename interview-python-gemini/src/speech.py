# ─────────────────────────────────────────────────────
#  src/speech.py  —  Speech Metric Analyzer
#
#  POST /analyze-speech
#  Body: { audioPath, transcript }
#
#  Computes three metrics:
#    1. WPM           — words per minute spoken
#    2. fillerCount   — number of filler words used
#    3. silenceRatio  — % of audio that was silence
#
#  Uses librosa for audio analysis and NLTK for
#  filler word detection.
# ─────────────────────────────────────────────────────

import os
import re
import librosa
import numpy as np
import nltk
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Download NLTK data on first run (only happens once)
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", quiet=True)


# ── FILLER WORDS LIST ────────────────────────────────────
# Add or remove words as needed for your use case
FILLER_WORDS = {
    "um", "uh", "umm", "uhh",
    "like", "basically", "actually", "literally",
    "you know", "i mean", "sort of", "kind of",
    "right", "okay so", "so basically", "anyway",
    "hmm", "er", "errr",
}


# ── REQUEST MODEL ────────────────────────────────────────
class SpeechRequest(BaseModel):
    audioPath: str    # absolute path to the .webm audio file
    transcript: str   # text transcript from Whisper


# ── ENDPOINT ─────────────────────────────────────────────
@router.post("/analyze-speech")
def analyze_speech(req: SpeechRequest):
    """
    Analyze speech metrics from an audio file and its transcript.
    Returns WPM, filler word count, and silence ratio.
    """
    if not os.path.exists(req.audioPath):
        raise HTTPException(status_code=404, detail=f"Audio file not found: {req.audioPath}")

    try:
        # Load audio with librosa
        # librosa automatically converts to mono and resamples to 22050 Hz
        audio, sample_rate = librosa.load(req.audioPath, sr=None, mono=True)
        duration_seconds = librosa.get_duration(y=audio, sr=sample_rate)

        if duration_seconds < 1:
            return {"wpm": 0, "fillerCount": 0, "silenceRatio": 100.0}

        # ── METRIC 1: Words Per Minute ─────────────────
        wpm = calculate_wpm(req.transcript, duration_seconds)

        # ── METRIC 2: Filler Word Count ────────────────
        filler_count = count_filler_words(req.transcript)

        # ── METRIC 3: Silence Ratio ────────────────────
        silence_ratio = calculate_silence_ratio(audio, sample_rate)

        print(
            f"[Speech] WPM: {wpm:.1f} | "
            f"Fillers: {filler_count} | "
            f"Silence: {silence_ratio:.1f}% | "
            f"Duration: {duration_seconds:.1f}s"
        )

        return {
            "wpm": round(wpm, 1),
            "fillerCount": filler_count,
            "silenceRatio": round(silence_ratio, 1),
            "durationSeconds": round(duration_seconds, 1),
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Speech] Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Speech analysis failed: {str(e)}")


# ── WORDS PER MINUTE ─────────────────────────────────────
def calculate_wpm(transcript: str, duration_seconds: float) -> float:
    """
    Calculate speaking rate in words per minute.
    Counts only actual words (ignores punctuation).
    """
    if not transcript or not transcript.strip():
        return 0.0

    # Remove punctuation and count words
    clean = re.sub(r"[^\w\s]", "", transcript.lower())
    words = [w for w in clean.split() if w]
    word_count = len(words)

    duration_minutes = duration_seconds / 60
    if duration_minutes < 0.01:
        return 0.0

    return word_count / duration_minutes


# ── FILLER WORD COUNT ────────────────────────────────────
def count_filler_words(transcript: str) -> int:
    """
    Count how many filler words/phrases appear in the transcript.
    Case-insensitive. Counts each occurrence.
    """
    if not transcript:
        return 0

    text = transcript.lower()
    total = 0

    for filler in FILLER_WORDS:
        # Use word boundary matching for single words
        if " " in filler:
            # Multi-word phrase — simple substring count
            total += text.count(filler)
        else:
            # Single word — match whole word only
            matches = re.findall(r"\b" + re.escape(filler) + r"\b", text)
            total += len(matches)

    return total


# ── SILENCE RATIO ────────────────────────────────────────
def calculate_silence_ratio(audio: np.ndarray, sample_rate: int) -> float:
    """
    Calculate the percentage of the audio that is silence.

    Uses librosa's RMS energy to detect frames that are below
    a silence threshold. Returns a value 0-100 (%).

    A ratio under 20% is considered good (candidate was speaking
    most of the time with natural pauses).
    """
    # Compute RMS energy for each frame
    # hop_length=512 means one RMS value every ~23ms at 22050Hz
    rms = librosa.feature.rms(y=audio, hop_length=512)[0]

    if len(rms) == 0:
        return 0.0

    # Silence threshold: frames below 2% of the max RMS are silent
    threshold = 0.02 * np.max(rms)
    silent_frames = np.sum(rms < threshold)
    total_frames = len(rms)

    silence_ratio = (silent_frames / total_frames) * 100
    return float(silence_ratio)
