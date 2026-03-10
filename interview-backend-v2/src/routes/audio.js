// ─────────────────────────────────────────────────────
//  src/routes/audio.js  —  Audio Submission (Local Storage)
//
//  POST /api/audio/submit       →  save recorded answer
//  POST /api/audio/eye-contact  →  save eye contact %
//
//  Audio files are saved to: uploads/audio/ on your computer.
//  No cloud service is used.
// ─────────────────────────────────────────────────────

const express = require("express");
const path = require("path");
const prisma = require("../config/db");
const { audioUpload, getFileSizeKB } = require("../config/storage");
const { gradingQueue } = require("../queues");

const router = express.Router();

// ── SUBMIT AUDIO ──────────────────────────────────────────
// POST /api/audio/submit
// Form data fields: sessionId, questionId, audio (file)
router.post("/submit", audioUpload.single("audio"), async (req, res) => {
  try {
    const { sessionId, questionId } = req.body;

    if (!sessionId || !questionId) {
      return res.status(400).json({ error: "sessionId and questionId are required." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    // Verify ownership
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { session: true },
    });
    if (!question || question.session.userId !== req.user.id) {
      return res.status(403).json({ error: "Question not found or access denied." });
    }

    // Save the local file path
    const relativePath = path.relative(
      path.join(__dirname, "../../"),
      req.file.path
    ).replace(/\\/g, "/");

    // Create or update the Answer row
    await prisma.answer.upsert({
      where: { questionId },
      update: { audioPath: relativePath },
      create: { questionId, audioPath: relativePath },
    });

    // Dispatch background grading job
    await gradingQueue.add("grade-answer", {
      sessionId,
      questionId,
      audioPath: req.file.path, // absolute path for Python to read
    });

    const sizeKB = getFileSizeKB(req.file.path);

    res.json({
      message: "Audio submitted. Grading queued.",
      questionId,
      savedAs: relativePath,
      sizeKB,
    });
  } catch (err) {
    console.error("Audio submit error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: `Audio file too large. Maximum is ${process.env.MAX_AUDIO_SIZE_MB || 50}MB.`,
      });
    }

    res.status(500).json({ error: "Could not process audio." });
  }
});

// ── SAVE EYE CONTACT ──────────────────────────────────────
// POST /api/audio/eye-contact
// Body: { questionId, eyeContactPct }
// Called from the client after each answer is recorded.
// The eye contact % is computed locally by MediaPipe —
// we just save the number here.
router.post("/eye-contact", async (req, res) => {
  try {
    const { questionId, eyeContactPct } = req.body;

    if (!questionId || eyeContactPct === undefined) {
      return res.status(400).json({ error: "questionId and eyeContactPct are required." });
    }

    await prisma.answer.upsert({
      where: { questionId },
      update: { eyeContactPct: parseFloat(eyeContactPct) },
      create: { questionId, eyeContactPct: parseFloat(eyeContactPct) },
    });

    res.json({ message: "Eye contact saved.", questionId, eyeContactPct });
  } catch (err) {
    console.error("Eye contact error:", err);
    res.status(500).json({ error: "Could not save eye contact data." });
  }
});

module.exports = router;
