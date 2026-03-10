// ─────────────────────────────────────────────────────
//  src/state/machine.js  —  Interview State Machine
//
//  Enforces the legal transitions between session states.
//  No state can be skipped or reversed.
// ─────────────────────────────────────────────────────

const prisma = require("../config/db");

const TRANSITIONS = {
  IDLE:           ["ROUND_1_ACTIVE"],
  ROUND_1_ACTIVE: ["TRANSITION"],
  TRANSITION:     ["ROUND_2_ACTIVE"],
  ROUND_2_ACTIVE: ["PROCESSING"],
  PROCESSING:     ["COMPLETE"],
  COMPLETE:       [],
};

async function transitionState(sessionId, newState) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { state: true },
  });

  if (!session) throw new Error(`Session ${sessionId} not found.`);

  const allowed = TRANSITIONS[session.state] || [];
  if (!allowed.includes(newState)) {
    throw new Error(
      `Invalid transition: ${session.state} → ${newState}. Allowed: ${allowed.join(", ") || "none"}`
    );
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      state: newState,
      ...(newState === "COMPLETE" ? { endTime: new Date() } : {}),
    },
  });

  console.log(`[StateMachine] ${sessionId}: ${session.state} → ${newState}`);
  return updated;
}

async function getState(sessionId) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, domain: true, userId: true },
  });
  if (!session) throw new Error(`Session ${sessionId} not found.`);
  return session;
}

module.exports = { transitionState, getState, TRANSITIONS };
