// ─────────────────────────────────────────────────────
//  src/index.js  —  Server Entry Point
// ─────────────────────────────────────────────────────

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const { ensureUploadDirs } = require("./config/storage");
const { initSocketServer } = require("./socket");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/session");
const resumeRoutes = require("./routes/resume");
const audioRoutes = require("./routes/audio");
const reportRoutes = require("./routes/report");
const { authenticateToken } = require("./middleware/auth");

// Create upload folders on startup (uploads/resumes & uploads/audio)
ensureUploadDirs();

const app = express();
const httpServer = http.createServer(app);

// ── MIDDLEWARE ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files so the frontend can access them
// e.g. GET http://localhost:5000/uploads/audio/abc.webm
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── ROUTES ──────────────────────────────────────────────
app.use("/api/auth",    authRoutes);                          // public
app.use("/api/session", authenticateToken, sessionRoutes);   // protected
app.use("/api/resume",  authenticateToken, resumeRoutes);    // protected
app.use("/api/audio",   authenticateToken, audioRoutes);     // protected
app.use("/api/report",  authenticateToken, reportRoutes);    // protected

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── SOCKET.IO ───────────────────────────────────────────
initSocketServer(httpServer);

// ── START ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n✅ Server running  → http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready → ws://localhost:${PORT}`);
  console.log(`📁 Files saved to  → ${path.join(__dirname, "../uploads")}`);
  console.log(`🌍 Frontend origin → ${process.env.CLIENT_URL}\n`);
});

module.exports = app;
