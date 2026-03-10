# Interview AI — Python Microservices
### 100% Free | Gemini API + Local Whisper | No Credit Card Needed

---

## What This Service Does

| Endpoint | Task | Technology | Cost |
|----------|------|------------|------|
| `POST /extract-resume` | PDF/DOCX → text | pdfplumber | Free |
| `POST /generate-questions` | Generate questions | Gemini API | Free |
| `POST /transcribe` | Audio → transcript | Whisper (local) | Free |
| `POST /grade-answer` | Score answer 0-10 | Gemini API | Free |
| `POST /analyze-speech` | WPM, fillers, silence | librosa | Free |
| `POST /generate-feedback` | Written feedback | Gemini API | Free |

---

## Step 1 — Get Your Free Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key — it looks like `AIzaSy...`

No credit card. No billing. Completely free.

---

## Step 2 — Install Python

Download Python 3.10 or 3.11 from https://www.python.org/downloads/

During installation:
- ✅ Check **"Add Python to PATH"** (very important!)
- Click Install Now

Verify:
```bash
python --version
```

---

## Step 3 — Set Up the Project

```bash
cd interview-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Installation takes 3-5 minutes the first time.

---

## Step 4 — Add Your API Key

```bash
copy .env.example .env
```

Open `.env` and paste your Gemini key:
```
GEMINI_API_KEY="AIzaSy-your-key-here"
```

---

## Step 5 — Start the Service

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete.
```

---

## Running All 3 Services Together

Open 3 terminals in VS Code (Ctrl + Shift + `):

```
Terminal 1 — Frontend
  cd interview-ai
  npm run dev                          → http://localhost:5173

Terminal 2 — Backend
  cd interview-backend-v2
  npm run dev                          → http://localhost:5000

Terminal 3 — Python AI
  cd interview-python
  venv\Scripts\activate
  uvicorn main:app --reload --port 8000  → http://localhost:8000
```

---

## Project Structure
```
interview-python/
├── main.py                ← FastAPI entry point
├── src/
│   ├── gemini_client.py   ← Shared Gemini API wrapper
│   ├── resume.py          ← PDF/DOCX text extraction
│   ├── questions.py       ← Question generation (Gemini)
│   ├── whisper.py         ← Audio transcription (local)
│   ├── grading.py         ← Answer grading (Gemini)
│   ├── speech.py          ← WPM, fillers, silence
│   └── feedback.py        ← Written feedback (Gemini)
├── requirements.txt
├── .env.example
└── README.md
```
