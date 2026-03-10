// ─────────────────────────────────────────────────────
//  src/routes/report.js  —  Report Generation & Retrieval
//
//  GET  /api/report/:sessionId           →  fetch report
//  POST /api/report/:sessionId/generate  →  run scoring + save
// ─────────────────────────────────────────────────────

const express = require("express");
const prisma = require("../config/db");

const router = express.Router();

// ── GET REPORT ───────────────────────────────────────────
router.get("/:sessionId", async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.sessionId },
      include: {
        report: true,
        questions: {
          include: { answer: true },
          orderBy: [{ round: "asc" }, { questionIndex: "asc" }],
        },
      },
    });

    if (!session) return res.status(404).json({ error: "Session not found." });
    if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

    if (session.state !== "COMPLETE") {
      return res.status(202).json({ error: "Report not ready yet.", state: session.state });
    }

    const questions = session.questions.map(q => ({
      id: q.id,
      round: q.round,
      index: q.questionIndex,
      text: q.questionText,
      transcript: q.answer?.transcript || null,
      technicalScore: q.answer?.technicalScore || null,
      graderNote: q.answer?.graderNote || null,
      eyeContactPct: q.answer?.eyeContactPct || null,
      wpm: q.answer?.wpm || null,
      fillerCount: q.answer?.fillerCount || null,
    }));

    res.json({
      session: {
        id: session.id,
        domain: session.domain,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      report: session.report,
      questions,
    });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ error: "Could not fetch report." });
  }
});

// ── GENERATE REPORT ──────────────────────────────────────
// Called internally by the grading queue once all 10 answers
// have been processed by the Python service.
router.post("/:sessionId/generate", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { writtenFeedback } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { questions: { include: { answer: true } } },
    });

    if (!session) return res.status(404).json({ error: "Session not found." });

    const answers = session.questions.map(q => q.answer).filter(Boolean);

    // ── SCORING FORMULA ─────────────────────────────────
    //
    // TECHNICAL SCORE → 70 points
    // Average of all per-question scores (0–10), scaled to 70
    const techScores = answers.map(a => a.technicalScore || 0);
    const avgTech = techScores.reduce((a, b) => a + b, 0) / (techScores.length || 1);
    const technicalPoints = (avgTech / 10) * 70;

    // EYE CONTACT SCORE → 15 points
    // Average eye contact % across all questions, scaled to 15
    const eyePcts = answers.map(a => a.eyeContactPct || 0);
    const avgEye = eyePcts.reduce((a, b) => a + b, 0) / (eyePcts.length || 1);
    const eyePoints = (avgEye / 100) * 15;

    // VOCAL CONFIDENCE SCORE → 15 points (3 sub-scores of 5 each)

    // Sub-score 1: WPM (ideal 120–160 WPM = full 5 points)
    const wpms = answers.map(a => a.wpm).filter(Boolean);
    const avgWpm = wpms.length > 0 ? wpms.reduce((a, b) => a + b, 0) / wpms.length : 0;
    let wpmScore = 0;
    if (avgWpm >= 120 && avgWpm <= 160) {
      wpmScore = 5;
    } else if (avgWpm > 0) {
      const deviation = avgWpm < 120 ? 120 - avgWpm : avgWpm - 160;
      wpmScore = Math.max(0, 5 - deviation * 0.05);
    }

    // Sub-score 2: Filler words (0 fillers = 5 pts, −0.25 per filler)
    const totalFillers = answers.reduce((sum, a) => sum + (a.fillerCount || 0), 0);
    const fillerScore = Math.max(0, 5 - totalFillers * 0.25);

    // Sub-score 3: Silence ratio (< 20% = 5 pts, −0.25 per % above 20)
    const silences = answers.map(a => a.silenceRatio).filter(v => v != null);
    const avgSilence = silences.length > 0
      ? silences.reduce((a, b) => a + b, 0) / silences.length : 0;
    const silenceScore = avgSilence <= 20
      ? 5 : Math.max(0, 5 - (avgSilence - 20) * 0.25);

    const vocalPoints = wpmScore + fillerScore + silenceScore;

    // FINAL SCORE
    const finalScore = Math.round(technicalPoints + eyePoints + vocalPoints);

    // Save to reports table
    const report = await prisma.report.create({
      data: {
        sessionId,
        finalScore,
        technicalScore: parseFloat(technicalPoints.toFixed(1)),
        eyeContactScore: parseFloat(eyePoints.toFixed(1)),
        vocalScore: parseFloat(vocalPoints.toFixed(1)),
        avgWpm: avgWpm ? parseFloat(avgWpm.toFixed(1)) : null,
        totalFillers,
        avgSilence: avgSilence ? parseFloat(avgSilence.toFixed(1)) : null,
        writtenFeedback: writtenFeedback || "Feedback generation in progress.",
      },
    });

    // Mark session COMPLETE
    await prisma.session.update({
      where: { id: sessionId },
      data: { state: "COMPLETE", endTime: new Date() },
    });

    // Notify all WebSocket clients in this session room
    if (global.io) {
      global.io.to(sessionId).emit("report_ready", { sessionId });
    }

    res.json({ message: "Report generated successfully.", report });
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ error: "Could not generate report." });
  }
});

module.exports = router;
