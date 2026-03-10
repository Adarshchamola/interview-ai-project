# Interview AI — Backend Server
### Local Storage Only | No Cloud Services Required

---

## What Gets Stored Where

All files are saved on **your own computer** inside the project folder:

```
interview-backend/
└── uploads/
    ├── resumes/    ← uploaded PDFs saved here
    └── audio/      ← recorded answer audio saved here
```

These folders are created **automatically** when the server starts. You don't need to create them.

---

## Prerequisites

| Tool | Purpose | Download |
|------|---------|----------|
| Node.js v18+ | Run the server | https://nodejs.org |
| PostgreSQL | Database | https://www.postgresql.org/download/windows/ |
| Redis | Background job queue | https://upstash.com (free, no install) |

---

## Setup (Step by Step)

### Step 1 — Install dependencies
```bash
cd interview-backend
npm install
```

### Step 2 — Set up environment variables
```bash
copy .env.example .env
```
Open `.env` and fill in:
- `DATABASE_URL` → your PostgreSQL connection string
- `JWT_SECRET` → any long random string
- `REDIS_HOST` / `REDIS_PORT` → your Redis details

**If using Upstash (free cloud Redis):**
```
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
```

### Step 3 — Set up the database
Make sure PostgreSQL is running, then:
```bash
npm run db:migrate
npm run db:generate
```
This creates all the tables (users, sessions, questions, answers, reports).

### Step 4 — Start the server
```bash
npm run dev
```
You should see:
```
✅ Server running  → http://localhost:5000
📡 WebSocket ready → ws://localhost:5000
📁 Files saved to  → C:\...\interview-backend\uploads
```

---

## API Reference

### Auth (No JWT needed)
```
POST /api/auth/register   body: { name, email, password }
POST /api/auth/login      body: { email, password }
GET  /api/auth/me         header: Authorization: Bearer <token>
```

### Session (JWT required)
```
POST /api/session/start              body: { domain }
GET  /api/session/user/history
GET  /api/session/:id
GET  /api/session/:id/questions?round=1
```

### Resume (JWT required)
```
POST /api/resume/upload    form-data: { sessionId, resume: <file> }
```

### Audio (JWT required)
```
POST /api/audio/submit        form-data: { sessionId, questionId, audio: <file> }
POST /api/audio/eye-contact   body: { questionId, eyeContactPct }
```

### Report (JWT required)
```
GET  /api/report/:sessionId
```

---

## WebSocket Events

```javascript
// Connect from your React frontend
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", {
  auth: { token: "your-jwt-token" }
});

// 1. Join a session room
socket.emit("join_session", { sessionId });

// 2. Start the interview
socket.emit("start_round_1", { sessionId });

// 3. After each answer — send eye contact data
socket.emit("submit_eye_contact", { questionId, eyeContactPct: 87 });

// 4. Request next question
socket.emit("request_next_q", { sessionId });

// Events you receive from server
socket.on("session_state", ({ state }) => { /* update UI */ });
socket.on("question",      ({ id, round, index, text, timeLimit }) => { /* show question */ });
socket.on("round_2_ready", () => { /* show Round 2 transition screen */ });
socket.on("report_ready",  ({ sessionId }) => { /* fetch and show report */ });
socket.on("error",         ({ message }) => { /* show error */ });
```

---

## Project Structure
```
src/
├── index.js          ← Entry point
├── config/
│   ├── db.js         ← Prisma (PostgreSQL)
│   └── storage.js    ← Multer local file storage
├── middleware/
│   └── auth.js       ← JWT verification
├── routes/
│   ├── auth.js       ← Register / Login
│   ├── session.js    ← Session management
│   ├── resume.js     ← Resume upload → uploads/resumes/
│   ├── audio.js      ← Audio upload → uploads/audio/
│   └── report.js     ← Scoring formula + report save
├── socket/
│   └── index.js      ← WebSocket server (real-time questions)
├── state/
│   └── machine.js    ← IDLE→R1→TRANSITION→R2→PROCESSING→COMPLETE
└── queues/
    └── index.js      ← Background jobs (grading, resume parsing)
```
