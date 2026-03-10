// ─────────────────────────────────────────────────────
//  src/routes/session.js  —  Session Management
//
//  POST /api/session/start          →  create new session
//  GET  /api/session/user/history   →  past sessions
//  GET  /api/session/:id            →  get session status
//  POST /api/session/:id/next       →  transition state
//  GET  /api/session/:id/questions  →  get questions for a round
// ─────────────────────────────────────────────────────

const express = require("express");
const prisma = require("../config/db");
const { transitionState } = require("../state/machine");

const router = express.Router();

// ── START SESSION ────────────────────────────────────────
router.post("/start", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ error: "Domain is required." });
    }

    const session = await prisma.session.create({
      data: { userId: req.user.id, domain, state: "IDLE" },
    });

    res.status(201).json({
      message: "Session created.",
      sessionId: session.id,
      state: session.state,
    });
  } catch (err) {
    console.error("Start session error:", err);
    res.status(500).json({ error: "Could not create session." });
  }
});

// ── SESSION HISTORY ──────────────────────────────────────
// NOTE: This route must come BEFORE /:id to avoid
// "history" being treated as a session ID
router.get("/user/history", async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { startTime: "desc" },
      include: {
        report: {
          select: {
            finalScore: true,
            technicalScore: true,
            eyeContactScore: true,
            vocalScore: true,
          },
        },
      },
    });
    res.json({ sessions });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Could not fetch history." });
  }
});

// ── GET SESSION ──────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: { answer: true },
          orderBy: [{ round: "asc" }, { questionIndex: "asc" }],
        },
      },
    });

    if (!session) return res.status(404).json({ error: "Session not found." });
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const answered = session.questions.filter(q => q.answer).length;

    res.json({
      id: session.id,
      domain: session.domain,
      state: session.state,
      startTime: session.startTime,
      endTime: session.endTime,
      totalQuestions: session.questions.length,
      answeredQuestions: answered,
    });
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ error: "Could not fetch session." });
  }
});

// ── TRANSITION STATE ─────────────────────────────────────
router.post("/:id/next", async (req, res) => {
  try {
    const { newState } = req.body;
    if (!newState) return res.status(400).json({ error: "newState is required." });

    const updated = await transitionState(req.params.id, newState);
    res.json({ state: updated.state });
  } catch (err) {
    console.error("Transition error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ── GET QUESTIONS ────────────────────────────────────────
router.get("/:id/questions", async (req, res) => {
  try {
    const round = parseInt(req.query.round) || 1;

    const questions = await prisma.question.findMany({
      where: { sessionId: req.params.id, round },
      orderBy: { questionIndex: "asc" },
      select: {
        id: true,
        round: true,
        questionIndex: true,
        questionText: true,
        // expectedAnswer is NOT sent to the client
      },
    });

    res.json({ round, questions });
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ error: "Could not fetch questions." });
  }
});

module.exports = router;
