// ─────────────────────────────────────────────────────
//  src/socket/index.js  —  Socket.IO Real-time Server
// ─────────────────────────────────────────────────────

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const prisma = require("../config/db");
const { transitionState } = require("../state/machine");

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const TIMEOUT = 60000;

// Tracks { round, qIndex, questions[] } per session in memory
const sessionProgress = new Map();

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── JWT AUTH MIDDLEWARE ────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required."));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.user.name} connected`);

    // ── JOIN SESSION ───────────────────────────────────
    socket.on("join_session", async ({ sessionId }) => {
      try {
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.userId !== socket.user.id) {
          return socket.emit("error", { message: "Session not found or access denied." });
        }
        socket.join(sessionId);
        socket.sessionId = sessionId;
        socket.emit("session_state", { state: session.state, sessionId });
        console.log(`[Socket] ${socket.user.name} joined session ${sessionId}`);
      } catch {
        socket.emit("error", { message: "Could not join session." });
      }
    });

    // ── START ROUND 1 ──────────────────────────────────
    socket.on("start_round_1", async ({ sessionId }) => {
      try {
        await transitionState(sessionId, "ROUND_1_ACTIVE");

        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          select: { domain: true },
        });

        // Generate 5 domain questions via Python/Groq
        const qRes = await axios.post(`${PYTHON_URL}/generate-questions`, {
          domain: session.domain,
          round: 1,
          resumeText: null,
        }, { timeout: TIMEOUT });

        // Force exactly 5 questions
        const questions = (qRes.data.questions || []).slice(0, 5);
        while (questions.length < 5) {
          questions.push({
            text: `Explain a key concept in ${session.domain} and its practical applications.`,
            expectedAnswer: "Should cover the concept definition, use cases, and real-world examples.",
          });
        }

        const savedQuestions = await Promise.all(
          questions.map((q, i) =>
            prisma.question.create({
              data: {
                sessionId,
                round: 1,
                questionIndex: i + 1,
                questionText: q.text,
                expectedAnswer: q.expectedAnswer,
              },
            })
          )
        );

        sessionProgress.set(sessionId, { round: 1, qIndex: 0, questions: savedQuestions });

        io.to(sessionId).emit("session_state", { state: "ROUND_1_ACTIVE", sessionId });
        socket.emit("question", buildQuestionPayload(savedQuestions[0], 1, 1, 90));

        console.log(`[Socket] Round 1 started for session ${sessionId} — ${savedQuestions.length} questions`);
      } catch (err) {
        console.error("[Socket] start_round_1 error:", err.message);
        socket.emit("error", { message: "Could not start Round 1. Please try again." });
      }
    });

    // ── EYE CONTACT UPDATE ─────────────────────────────
    socket.on("submit_eye_contact", async ({ questionId, eyeContactPct }) => {
      try {
        await prisma.answer.upsert({
          where: { questionId },
          update: { eyeContactPct },
          create: { questionId, eyeContactPct },
        });
      } catch (err) {
        console.error("[Socket] Eye contact error:", err.message);
      }
    });

    // ── NEXT QUESTION ──────────────────────────────────
    socket.on("request_next_q", async ({ sessionId }) => {
  try {
    const progress = sessionProgress.get(sessionId);
    if (!progress) return socket.emit("error", { message: "Session progress not found." });

    const nextIndex = progress.qIndex + 1;

    if (nextIndex < progress.questions.length) {
      progress.qIndex = nextIndex;
      sessionProgress.set(sessionId, progress);
      const timeLimit = progress.round === 1 ? 90 : 120;
      socket.emit("question", buildQuestionPayload(
        progress.questions[nextIndex], progress.round, nextIndex + 1, timeLimit
      ));
    } else if (progress.round === 1) {
      await handleRound1Complete(socket, io, sessionId);
    } else {
      // Round 2 finished — force PROCESSING regardless of current state
      console.log(`[Socket] Round 2 complete for ${sessionId}, forcing PROCESSING`);
      sessionProgress.delete(sessionId);

      // Update DB directly instead of using transitionState to avoid state errors
      await prisma.session.update({
        where: { id: sessionId },
        data: { state: "PROCESSING" },
      });

      io.to(sessionId).emit("session_state", { state: "PROCESSING", sessionId });
    }
  } catch (err) {
    console.error("[Socket] request_next_q error:", err.message);
    // Even on error — force the client to move to processing
    io.to(sessionId).emit("session_state", { state: "PROCESSING", sessionId });
  }
});

    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.user?.name} disconnected`);
    });
  });

  global.io = io;
  return io;
}

// ── ROUND 1 COMPLETE → START ROUND 2 ────────────────────
async function handleRound1Complete(socket, io, sessionId) {
  await transitionState(sessionId, "TRANSITION");
  io.to(sessionId).emit("session_state", {
    state: "TRANSITION",
    message: "Round 1 complete! Preparing your personalised Round 2 questions...",
  });

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { domain: true, resumeText: true },
  });

  // Generate 5 resume-based questions
  const qRes = await axios.post(`${PYTHON_URL}/generate-questions`, {
    domain: session.domain,
    round: 2,
    resumeText: session.resumeText || "",
  }, { timeout: TIMEOUT });

  // Force exactly 5 questions
  const r2questions = (qRes.data.questions || []).slice(0, 5);
  while (r2questions.length < 5) {
    r2questions.push({
      text: `Walk me through a challenging problem you solved related to ${session.domain}.`,
      expectedAnswer: "Should cover problem identification, approach, solution, and outcome.",
    });
  }

  const savedR2Questions = await Promise.all(
    r2questions.map((q, i) =>
      prisma.question.create({
        data: {
          sessionId,
          round: 2,
          questionIndex: i + 1,
          questionText: q.text,
          expectedAnswer: q.expectedAnswer,
        },
      })
    )
  );

  sessionProgress.set(sessionId, { round: 2, qIndex: 0, questions: savedR2Questions });

  await transitionState(sessionId, "ROUND_2_ACTIVE");
  io.to(sessionId).emit("session_state", { state: "ROUND_2_ACTIVE", sessionId });
  io.to(sessionId).emit("round_2_ready");

  socket.emit("question", buildQuestionPayload(savedR2Questions[0], 2, 1, 120));
  console.log(`[Socket] Round 2 started for session ${sessionId} — ${savedR2Questions.length} questions`);
}

// ── BUILD QUESTION PAYLOAD ───────────────────────────────
function buildQuestionPayload(question, round, index, timeLimit) {
  return {
    id: question.id,
    round,
    index,
    total: 5,
    text: question.questionText,
    timeLimit,
  };
}

module.exports = { initSocketServer };