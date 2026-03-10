const axios = require("axios");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const TIMEOUT = 60000; // 60 seconds timeout for all AI calls

const resumeQueue = {
  add: async (name, data) => {
    setImmediate(async () => {
      try {
        const response = await axios.post(`${PYTHON_URL}/extract-resume`, {
          filePath: data.filePath,
          fileType: data.fileType,
        }, { timeout: TIMEOUT });

        await prisma.session.update({
          where: { id: data.sessionId },
          data: { resumeText: response.data.text },
        });

        console.log(`[Resume] Parsed ${response.data.charCount} chars`);
      } catch (err) {
        console.error(`[Resume] Parse failed:`, err.message);
      }
    });
  }
};

const gradingQueue = {
  add: async (name, data) => {
    setImmediate(async () => {
      try {
        const question = await prisma.question.findUnique({
          where: { id: data.questionId },
          select: { questionText: true, expectedAnswer: true },
        });

        // Step 1 — Transcribe audio
        let transcript = "";
        try {
          const transcriptRes = await axios.post(`${PYTHON_URL}/transcribe`, {
            audioPath: data.audioPath,
          }, { timeout: TIMEOUT });
          transcript = transcriptRes.data.transcript || transcript;
          console.log(`[Whisper] Transcribed ${transcriptRes.data.wordCount} words`);
        } catch (err) {
          console.error(`[Whisper] Failed, using placeholder:`, err.message);
        }

        // Step 2 — Grade answer
        let score = 5, note = "Grading unavailable.";
        try {
          const gradingRes = await axios.post(`${PYTHON_URL}/grade-answer`, {
            questionText: question.questionText,
            expectedAnswer: question.expectedAnswer,
            transcript,
          }, { timeout: TIMEOUT });
          score = gradingRes.data.score;
          note = gradingRes.data.note;
          console.log(`[Grading] Q ${data.questionId} → ${score}/10`);
        } catch (err) {
          console.error(`[Grading] Failed:`, err.message);
        }

        // Step 3 — Analyze speech
        let wpm = 0, fillerCount = 0, silenceRatio = 0;
        try {
          const speechRes = await axios.post(`${PYTHON_URL}/analyze-speech`, {
            audioPath: data.audioPath,
            transcript,
          }, { timeout: TIMEOUT });
          wpm = speechRes.data.wpm;
          fillerCount = speechRes.data.fillerCount;
          silenceRatio = speechRes.data.silenceRatio;
        } catch (err) {
          console.error(`[Speech] Failed:`, err.message);
        }

        // Save all results
        await prisma.answer.update({
          where: { questionId: data.questionId },
          data: { transcript, technicalScore: score, graderNote: note, wpm, fillerCount, silenceRatio },
        });

        // Check if all questions are graded
        const total = await prisma.question.count({ where: { sessionId: data.sessionId } });
        const gradedCount = await prisma.answer.count({
          where: { question: { sessionId: data.sessionId }, technicalScore: { not: null } }
        });

        console.log(`[Grading] Progress: ${gradedCount}/${total}`);

        if (gradedCount >= total) {
          console.log(`[Grading] All done, generating report for ${data.sessionId}...`);
          await generateReport(data.sessionId);
        }

      } catch (err) {
        console.error(`[Grading] Fatal error for question ${data.questionId}:`, err.message);
      }
    });
  }
};

async function generateReport(sessionId) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { questions: { include: { answer: true } } }
    });

    // Generate written feedback
    let writtenFeedback = "Interview complete. Great effort!";
    try {
      const feedbackRes = await axios.post(`${PYTHON_URL}/generate-feedback`, {
        domain: session.domain,
        questions: session.questions.map(q => ({
          text: q.questionText,
          transcript: q.answer?.transcript,
          score: q.answer?.technicalScore,
          note: q.answer?.graderNote,
          round: q.round,
        })),
        avgEyeContact: avg(session.questions.map(q => q.answer?.eyeContactPct).filter(Boolean)),
        avgWpm: avg(session.questions.map(q => q.answer?.wpm).filter(Boolean)),
        totalFillers: session.questions.reduce((s, q) => s + (q.answer?.fillerCount || 0), 0),
      }, { timeout: 60000 });

      writtenFeedback = feedbackRes.data.feedback || writtenFeedback;
      console.log(`[Feedback] Generated successfully`);
    } catch (err) {
      console.error(`[Feedback] Failed, using fallback:`, err.message);
    }

    // Mark session as PROCESSING
    await prisma.session.update({
      where: { id: sessionId },
      data: { state: "PROCESSING" },
    });

    // Generate internal JWT token for the report endpoint
    const internalToken = jwt.sign(
      { id: "internal", email: "internal@system", name: "System" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    // Hit the report generation endpoint
    await axios.post(
      `http://localhost:${process.env.PORT || 5000}/api/report/${sessionId}/generate`,
      { writtenFeedback },
      {
        headers: { authorization: `Bearer ${internalToken}` },
        timeout: 15000,
      }
    );

    console.log(`[Report] Generated successfully for session ${sessionId}`);

  } catch (err) {
    console.error(`[Report] Generation failed for ${sessionId}:`, err.message);
  }
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = { resumeQueue, gradingQueue };