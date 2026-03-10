// ─────────────────────────────────────────────────────
//  src/routes/resume.js  —  Resume Upload (Local Storage)
//
//  POST /api/resume/upload
//
//  Files are saved to: uploads/resumes/ on your computer.
//  No cloud service is used.
// ─────────────────────────────────────────────────────

const express = require("express");
const path = require("path");
const prisma = require("../config/db");
const { resumeUpload, getFileSizeKB } = require("../config/storage");
const { resumeQueue } = require("../queues");

const router = express.Router();

// ── UPLOAD RESUME ────────────────────────────────────────
// POST /api/resume/upload
// Form data fields: sessionId (text), resume (file)
router.post("/upload", resumeUpload.single("resume"), async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Verify the session belongs to this user
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: "Session not found or access denied." });
    }

    // Save the local file path to the database
    // e.g. "uploads/resumes/userId_1234567890.pdf"
    const relativePath = path.relative(
      path.join(__dirname, "../../"),
      req.file.path
    ).replace(/\\/g, "/"); // normalize Windows backslashes

    await prisma.session.update({
      where: { id: sessionId },
      data: { resumePath: relativePath },
    });

    // Dispatch background job to extract text from the resume.
    // This runs while the user is answering Round 1 questions.
    await resumeQueue.add("parse-resume", {
      sessionId,
      filePath: req.file.path, // absolute path for Python to read
      fileType: path.extname(req.file.originalname).toLowerCase(),
    });

    const sizeKB = getFileSizeKB(req.file.path);

    res.json({
      message: "Resume uploaded and queued for parsing.",
      fileName: req.file.originalname,
      savedAs: relativePath,
      sizeKB,
      sessionId,
    });
  } catch (err) {
    console.error("Resume upload error:", err);

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: `File too large. Maximum allowed size is ${process.env.MAX_RESUME_SIZE_MB || 5}MB.`,
      });
    }

    res.status(500).json({ error: err.message || "Upload failed." });
  }
});

module.exports = router;
