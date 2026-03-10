# ─────────────────────────────────────────────────────
#  src/resume.py  —  Resume Text Extraction
#
#  POST /extract-resume
#  Body: { filePath: str, fileType: str }
#
#  Reads the uploaded resume file from the local
#  uploads/resumes/ folder and extracts all readable
#  text from it, ignoring images and formatting.
#
#  Supports: .pdf  .docx  .doc
# ─────────────────────────────────────────────────────

import os
import pdfplumber
from docx import Document as DocxDocument
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


# ── REQUEST MODEL ────────────────────────────────────────
class ResumeRequest(BaseModel):
    filePath: str   # absolute path on disk e.g. C:/...uploads/resumes/abc.pdf
    fileType: str   # ".pdf", ".docx", or ".doc"


# ── ENDPOINT ─────────────────────────────────────────────
@router.post("/extract-resume")
def extract_resume(req: ResumeRequest):
    """
    Extract plain text from a PDF or DOCX resume file.
    Returns the raw text for use in Round 2 question generation.
    """
    if not os.path.exists(req.filePath):
        raise HTTPException(status_code=404, detail=f"File not found: {req.filePath}")

    file_type = req.fileType.lower()

    try:
        if file_type == ".pdf":
            text = extract_from_pdf(req.filePath)
        elif file_type in [".docx", ".doc"]:
            text = extract_from_docx(req.filePath)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")

        # Clean up the text — remove excessive whitespace
        text = clean_text(text)

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract any text from the file. It may be image-only.")

        print(f"[Resume] Extracted {len(text)} characters from {os.path.basename(req.filePath)}")
        return {"text": text, "charCount": len(text)}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Resume] Extraction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract resume text: {str(e)}")


# ── PDF EXTRACTION ───────────────────────────────────────
def extract_from_pdf(file_path: str) -> str:
    """Extract text from all pages of a PDF using pdfplumber."""
    text_parts = []

    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n".join(text_parts)


# ── DOCX EXTRACTION ──────────────────────────────────────
def extract_from_docx(file_path: str) -> str:
    """Extract text from all paragraphs of a DOCX file."""
    doc = DocxDocument(file_path)
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(paragraphs)


# ── TEXT CLEANER ─────────────────────────────────────────
def clean_text(text: str) -> str:
    """Remove excessive blank lines and leading/trailing whitespace."""
    lines = text.splitlines()
    cleaned = []
    prev_blank = False

    for line in lines:
        stripped = line.strip()
        if stripped:
            cleaned.append(stripped)
            prev_blank = False
        elif not prev_blank:
            cleaned.append("")   # allow one blank line max
            prev_blank = True

    return "\n".join(cleaned).strip()
