// ─────────────────────────────────────────────────────
//  src/config/storage.js  —  Local File Storage Helper
//
//  All file saving happens here. No cloud services.
//  Files are stored in the /uploads folder inside
//  your project directory.
//
//  Folder structure:
//    interview-backend/
//    └── uploads/
//        ├── resumes/   ← PDF and DOCX resumes
//        └── audio/     ← recorded answer .webm files
// ─────────────────────────────────────────────────────

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── ENSURE UPLOAD FOLDERS EXIST ─────────────────────────
// Creates the folders automatically if they don't exist yet.
// This runs once when the server starts.
function ensureUploadDirs() {
  const dirs = [
    path.join(__dirname, "../../uploads/resumes"),
    path.join(__dirname, "../../uploads/audio"),
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[Storage] Created directory: ${dir}`);
    }
  });
}

// ── RESUME STORAGE ───────────────────────────────────────
// Saves uploaded resumes to: uploads/resumes/
// Filename format: userId_timestamp.pdf
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/resumes");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Only allow PDF and DOCX files for resumes
const resumeFileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".docx", ".doc"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed for resumes."), false);
  }
};

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_RESUME_SIZE_MB) || 5) * 1024 * 1024,
  },
});

// ── AUDIO STORAGE ────────────────────────────────────────
// Saves recorded audio to: uploads/audio/
// Filename format: sessionId_questionId_timestamp.webm
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/audio");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { sessionId, questionId } = req.body;
    const filename = `${sessionId}_${questionId}_${Date.now()}.webm`;
    cb(null, filename);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: (parseInt(process.env.MAX_AUDIO_SIZE_MB) || 50) * 1024 * 1024,
  },
});

// ── DELETE A FILE ────────────────────────────────────────
// Safely deletes a local file. Used for cleanup if needed.
function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Storage] Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error(`[Storage] Could not delete file ${filePath}:`, err.message);
  }
}

// ── GET FILE SIZE ────────────────────────────────────────
function getFileSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

module.exports = {
  ensureUploadDirs,
  resumeUpload,
  audioUpload,
  deleteFile,
  getFileSizeKB,
};
