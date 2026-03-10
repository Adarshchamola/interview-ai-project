// import { useState, useEffect, useRef } from "react";

// const FONTS = `
// @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap');
// `;

// const CSS = `
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --bg: #070B18;
//     --surface: #0C1225;
//     --card: #111827;
//     --card2: #131D33;
//     --border: #1A2540;
//     --border2: #243050;
//     --accent: #00C8FF;
//     --accent-dim: rgba(0,200,255,0.12);
//     --accent-glow: rgba(0,200,255,0.25);
//     --green: #00E5A0;
//     --green-dim: rgba(0,229,160,0.12);
//     --yellow: #FFB800;
//     --yellow-dim: rgba(255,184,0,0.12);
//     --red: #FF4D6A;
//     --red-dim: rgba(255,77,106,0.12);
//     --text: #E2EAF8;
//     --text2: #7B8FB5;
//     --text3: #3D506E;
//     --font: 'DM Sans', sans-serif;
//     --font-display: 'Syne', sans-serif;
//     --font-mono: 'JetBrains Mono', monospace;
//     --radius: 12px;
//     --radius-lg: 18px;
//   }

//   body { background: var(--bg); color: var(--text); font-family: var(--font); }

//   ::-webkit-scrollbar { width: 6px; }
//   ::-webkit-scrollbar-track { background: var(--surface); }
//   ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

//   .app { min-height: 100vh; background: var(--bg); }

//   /* ── NOISE OVERLAY ── */
//   .app::before {
//     content: '';
//     position: fixed; inset: 0; pointer-events: none; z-index: 0;
//     background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
//     opacity: 0.4;
//   }

//   .z1 { position: relative; z-index: 1; }

//   /* ── ANIMATIONS ── */
//   @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//   @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
//   @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
//   @keyframes spin { to { transform: rotate(360deg); } }
//   @keyframes scanline {
//     0% { transform: translateY(-100%); }
//     100% { transform: translateY(100vh); }
//   }
//   @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
//   @keyframes timerDrain { from { width: 100%; } to { width: 0%; } }
//   @keyframes glow { 0%,100% { box-shadow: 0 0 12px var(--accent-glow); } 50% { box-shadow: 0 0 28px var(--accent-glow), 0 0 48px rgba(0,200,255,0.1); } }
//   @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

//   .anim-fadeup { animation: fadeUp 0.5s ease forwards; }
//   .anim-fadein { animation: fadeIn 0.4s ease forwards; }

//   /* ── GRID BACKGROUND ── */
//   .grid-bg {
//     position: fixed; inset: 0; pointer-events: none; z-index: 0;
//     background-image:
//       linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
//       linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
//     background-size: 48px 48px;
//   }

//   /* ── NAV ── */
//   .nav {
//     display: flex; align-items: center; justify-content: space-between;
//     padding: 0 32px; height: 64px;
//     background: rgba(7,11,24,0.85); backdrop-filter: blur(20px);
//     border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100;
//   }
//   .nav-logo { font-family: var(--font-display); font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
//   .nav-logo span { color: var(--accent); }
//   .nav-right { display: flex; align-items: center; gap: 12px; }
//   .nav-avatar {
//     width: 34px; height: 34px; border-radius: 50%; background: var(--accent-dim);
//     border: 1.5px solid var(--accent); display: flex; align-items: center; justify-content: center;
//     font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer;
//   }
//   .nav-pill {
//     font-family: var(--font-mono); font-size: 11px; color: var(--text2);
//     background: var(--surface); border: 1px solid var(--border);
//     padding: 4px 10px; border-radius: 20px;
//   }

//   /* ── BUTTONS ── */
//   .btn {
//     display: inline-flex; align-items: center; gap: 8px;
//     padding: 10px 20px; border-radius: var(--radius); font-family: var(--font);
//     font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none;
//   }
//   .btn-primary {
//     background: var(--accent); color: var(--bg);
//     font-weight: 600;
//   }
//   .btn-primary:hover { background: #33D4FF; transform: translateY(-1px); box-shadow: 0 8px 24px var(--accent-glow); }
//   .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
//   .btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
//   .btn-danger { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,77,106,0.3); }
//   .btn-danger:hover { background: rgba(255,77,106,0.25); }
//   .btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 14px; }
//   .btn-sm { padding: 7px 14px; font-size: 13px; }

//   /* ── CARDS ── */
//   .card {
//     background: var(--card); border: 1px solid var(--border);
//     border-radius: var(--radius-lg); padding: 24px;
//   }
//   .card-hover { transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
//   .card-hover:hover { border-color: var(--accent); transform: translateY(-2px); }

//   /* ── BADGE ── */
//   .badge {
//     display: inline-flex; align-items: center; gap: 5px;
//     font-family: var(--font-mono); font-size: 11px; font-weight: 500;
//     padding: 3px 10px; border-radius: 20px;
//   }
//   .badge-cyan { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(0,200,255,0.2); }
//   .badge-green { background: var(--green-dim); color: var(--green); border: 1px solid rgba(0,229,160,0.2); }
//   .badge-yellow { background: var(--yellow-dim); color: var(--yellow); border: 1px solid rgba(255,184,0,0.2); }
//   .badge-red { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,77,106,0.2); }

//   /* ── INPUT ── */
//   .input-group { display: flex; flex-direction: column; gap: 6px; }
//   .input-label { font-size: 12px; font-weight: 500; color: var(--text2); letter-spacing: 0.5px; text-transform: uppercase; }
//   .input {
//     background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius);
//     padding: 12px 16px; color: var(--text); font-family: var(--font); font-size: 14px;
//     transition: border-color 0.2s, box-shadow 0.2s; outline: none; width: 100%;
//   }
//   .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
//   .input::placeholder { color: var(--text3); }
//   .select { appearance: none; cursor: pointer; }

//   /* ── DIVIDER ── */
//   .divider { height: 1px; background: var(--border); margin: 20px 0; }

//   /* ── SCORE RING ── */
//   .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
//   .score-ring svg { transform: rotate(-90deg); }
//   .score-ring-text { position: absolute; text-align: center; }

//   /* ── PROGRESS BAR ── */
//   .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
//   .progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

//   /* ── TAG ── */
//   .tag {
//     font-family: var(--font-mono); font-size: 10px; color: var(--text3);
//     letter-spacing: 1px; text-transform: uppercase;
//   }

//   /* ────────────────────────────────
//      SCREEN 1: AUTH
//   ─────────────────────────────────*/
//   .auth-screen {
//     min-height: 100vh; display: flex; align-items: center; justify-content: center;
//     padding: 40px 16px;
//   }
//   .auth-card {
//     width: 100%; max-width: 420px;
//     background: var(--card); border: 1px solid var(--border);
//     border-radius: 20px; padding: 40px; animation: fadeUp 0.5s ease;
//   }
//   .auth-logo { font-family: var(--font-display); font-weight: 800; font-size: 22px; margin-bottom: 8px; }
//   .auth-logo span { color: var(--accent); }
//   .auth-sub { color: var(--text2); font-size: 14px; margin-bottom: 32px; line-height: 1.5; }
//   .auth-tabs { display: flex; background: var(--surface); border-radius: 10px; padding: 4px; margin-bottom: 28px; }
//   .auth-tab {
//     flex: 1; padding: 8px; text-align: center; font-size: 14px; font-weight: 500;
//     cursor: pointer; border-radius: 7px; transition: all 0.2s; color: var(--text2);
//     border: none; background: none; font-family: var(--font);
//   }
//   .auth-tab.active { background: var(--card2); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.4); }
//   .auth-form { display: flex; flex-direction: column; gap: 16px; }
//   .auth-footer { margin-top: 20px; text-align: center; font-size: 13px; color: var(--text2); }
//   .auth-accent-bar {
//     height: 3px; width: 48px; background: var(--accent); border-radius: 2px; margin-bottom: 20px;
//   }
//   .auth-glow {
//     position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
//     width: 600px; height: 400px; pointer-events: none;
//     background: radial-gradient(ellipse, rgba(0,200,255,0.06) 0%, transparent 70%);
//   }

//   /* ────────────────────────────────
//      SCREEN 2: DASHBOARD
//   ─────────────────────────────────*/
//   .dashboard { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }
//   .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; }
//   .dash-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
//   .dash-title span { color: var(--accent); }
//   .dash-sub { color: var(--text2); font-size: 14px; margin-top: 4px; }
//   .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
//   .stat-card {
//     background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
//     padding: 20px; transition: border-color 0.2s;
//   }
//   .stat-card:hover { border-color: var(--border2); }
//   .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text2); margin-bottom: 8px; font-family: var(--font-mono); }
//   .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; line-height: 1; }
//   .stat-change { font-size: 12px; margin-top: 6px; }
//   .stat-change.up { color: var(--green); }
//   .stat-change.neutral { color: var(--text2); }
//   .sessions-table { width: 100%; border-collapse: collapse; }
//   .sessions-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text3); font-family: var(--font-mono); padding: 10px 16px; border-bottom: 1px solid var(--border); font-weight: 500; }
//   .sessions-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; }
//   .sessions-table tr:last-child td { border-bottom: none; }
//   .sessions-table tbody tr { transition: background 0.15s; cursor: pointer; }
//   .sessions-table tbody tr:hover { background: rgba(255,255,255,0.02); }
//   .score-pill {
//     display: inline-flex; align-items: center; justify-content: center;
//     width: 48px; height: 26px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px; font-weight: 600;
//   }
//   .trend-chart { height: 80px; display: flex; align-items: flex-end; gap: 8px; }
//   .trend-bar { flex: 1; border-radius: 4px 4px 0 0; transition: all 0.3s; position: relative; min-height: 8px; }
//   .trend-bar:hover { filter: brightness(1.2); }

//   /* ────────────────────────────────
//      SCREEN 3: SETUP
//   ─────────────────────────────────*/
//   .setup-screen { max-width: 680px; margin: 0 auto; padding: 48px 24px; }
//   .setup-steps { display: flex; align-items: center; gap: 0; margin-bottom: 48px; }
//   .setup-step { display: flex; align-items: center; gap: 10px; flex: 1; }
//   .setup-step-num {
//     width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
//     font-size: 12px; font-weight: 600; font-family: var(--font-mono); flex-shrink: 0;
//   }
//   .setup-step-num.done { background: var(--green); color: var(--bg); }
//   .setup-step-num.active { background: var(--accent); color: var(--bg); }
//   .setup-step-num.pending { background: var(--border); color: var(--text3); }
//   .setup-step-line { flex: 1; height: 1px; background: var(--border); margin: 0 8px; }
//   .setup-step-label { font-size: 12px; color: var(--text2); white-space: nowrap; }
//   .domain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
//   .domain-card {
//     background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--radius);
//     padding: 14px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 6px;
//   }
//   .domain-card:hover { border-color: var(--accent); background: var(--accent-dim); }
//   .domain-card.selected { border-color: var(--accent); background: var(--accent-dim); }
//   .domain-icon { font-size: 20px; }
//   .domain-name { font-size: 13px; font-weight: 500; }
//   .domain-sub { font-size: 11px; color: var(--text2); }
//   .upload-zone {
//     border: 1.5px dashed var(--border2); border-radius: var(--radius-lg);
//     padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; margin-top: 12px;
//   }
//   .upload-zone:hover { border-color: var(--accent); background: var(--accent-dim); }
//   .upload-zone.has-file { border-color: var(--green); background: var(--green-dim); border-style: solid; }
//   .upload-icon { font-size: 32px; margin-bottom: 8px; }
//   .cam-preview {
//     background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
//     height: 160px; display: flex; align-items: center; justify-content: center; margin-top: 12px;
//     position: relative; overflow: hidden;
//   }
//   .cam-preview-text { color: var(--text2); font-size: 14px; text-align: center; }
//   .gaze-dot {
//     width: 10px; height: 10px; border-radius: 50%; background: var(--green);
//     position: absolute; top: 12px; right: 12px; animation: pulse 1.5s infinite;
//   }
//   .gaze-dot.inactive { background: var(--red); animation: none; }

//   /* ────────────────────────────────
//      SCREEN 4: INTERVIEW
//   ─────────────────────────────────*/
//   .interview-screen {
//     min-height: 100vh; display: flex; flex-direction: column;
//     background: var(--bg);
//   }
//   .interview-header {
//     display: flex; align-items: center; justify-content: space-between;
//     padding: 16px 32px; border-bottom: 1px solid var(--border);
//     background: rgba(7,11,24,0.9); backdrop-filter: blur(20px);
//   }
//   .round-badge {
//     font-family: var(--font-mono); font-size: 11px; font-weight: 600;
//     padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;
//   }
//   .interview-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; }
//   .question-card {
//     max-width: 720px; width: 100%;
//     background: var(--card); border: 1px solid var(--border2); border-radius: 20px;
//     padding: 40px; animation: fadeUp 0.4s ease;
//   }
//   .question-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
//   .question-num { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }
//   .question-text { font-family: var(--font-display); font-size: 22px; font-weight: 600; line-height: 1.45; letter-spacing: -0.3px; }
//   .timer-section { margin-top: 32px; }
//   .timer-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
//   .timer-count { font-family: var(--font-mono); font-size: 20px; font-weight: 600; }
//   .timer-count.urgent { color: var(--red); }
//   .timer-bar-wrap { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
//   .timer-fill { height: 100%; border-radius: 2px; transition: width 1s linear; }
//   .record-section { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; }
//   .record-btn {
//     width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--accent);
//     background: var(--accent-dim); cursor: pointer; display: flex; align-items: center; justify-content: center;
//     font-size: 24px; transition: all 0.2s; color: var(--accent);
//   }
//   .record-btn:hover { background: var(--accent); color: var(--bg); transform: scale(1.05); }
//   .record-btn.recording { border-color: var(--red); background: var(--red-dim); color: var(--red); animation: glow 1.5s infinite; }
//   .record-btn.recording:hover { background: var(--red); color: #fff; }
//   .waveform { display: flex; align-items: center; gap: 3px; height: 32px; }
//   .wave-bar {
//     width: 3px; background: var(--accent); border-radius: 2px; transition: height 0.1s;
//   }
//   .interview-sidebar {
//     position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
//     display: flex; flex-direction: column; gap: 12px;
//   }
//   .sidebar-metric {
//     background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
//     padding: 12px 16px; min-width: 130px;
//   }
//   .sidebar-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text3); font-family: var(--font-mono); margin-bottom: 4px; }
//   .sidebar-value { font-family: var(--font-mono); font-size: 18px; font-weight: 600; }
//   .q-dots { display: flex; gap: 6px; }
//   .q-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border2); transition: all 0.3s; }
//   .q-dot.answered { background: var(--green); }
//   .q-dot.current { background: var(--accent); animation: pulse 1.5s infinite; }

//   /* ────────────────────────────────
//      SCREEN 5: REPORT
//   ─────────────────────────────────*/
//   .report-screen { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
//   .report-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
//   .report-title { font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
//   .score-section { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 28px; }
//   .score-main { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
//   .score-breakdown { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; gap: 20px; }
//   .breakdown-item { display: flex; flex-direction: column; gap: 8px; }
//   .breakdown-header { display: flex; align-items: center; justify-content: space-between; }
//   .breakdown-label { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
//   .breakdown-score { font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
//   .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
//   .metric-card {
//     background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px;
//     display: flex; flex-direction: column; gap: 6px;
//   }
//   .metric-icon { font-size: 20px; margin-bottom: 4px; }
//   .metric-val { font-family: var(--font-display); font-size: 28px; font-weight: 700; line-height: 1; }
//   .metric-label { font-size: 12px; color: var(--text2); }
//   .metric-note { font-size: 11px; color: var(--text3); font-style: italic; }
//   .qa-table { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 28px; }
//   .qa-header { display: grid; grid-template-columns: 2fr 2fr 80px; gap: 12px; padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--surface); }
//   .qa-header span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text3); font-family: var(--font-mono); }
//   .qa-row { display: grid; grid-template-columns: 2fr 2fr 80px; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
//   .qa-row:last-child { border-bottom: none; }
//   .qa-row:hover { background: rgba(255,255,255,0.015); }
//   .qa-q { font-size: 13px; font-weight: 500; line-height: 1.4; }
//   .qa-a { font-size: 12px; color: var(--text2); line-height: 1.4; font-style: italic; }
//   .qa-score { display: flex; flex-direction: column; align-items: center; gap: 4px; }
//   .qa-score-num { font-family: var(--font-mono); font-size: 18px; font-weight: 700; }
//   .qa-score-bar { width: 40px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
//   .qa-score-fill { height: 100%; border-radius: 2px; }
//   .feedback-card {
//     background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
//     padding: 28px; margin-bottom: 28px; position: relative; overflow: hidden;
//   }
//   .feedback-card::before {
//     content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
//     background: linear-gradient(to bottom, var(--accent), var(--green));
//   }
//   .feedback-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-bottom: 16px; }
//   .feedback-text { font-size: 14px; color: var(--text2); line-height: 1.7; }
//   .filler-chart { display: flex; align-items: flex-end; gap: 10px; height: 80px; padding: 0 8px; }
//   .filler-bar { flex: 1; border-radius: 4px 4px 0 0; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
//   .filler-val { font-family: var(--font-mono); font-size: 10px; color: var(--text2); }
// `;

// // ── MOCK DATA ──
// const SESSIONS = [
//   { id: 1, date: "Mar 04, 2026", domain: "Data Structures", score: 82, tech: 78, eye: 90, vocal: 75, band: "Proficient" },
//   { id: 2, date: "Feb 28, 2026", domain: "System Design", score: 71, tech: 68, eye: 80, vocal: 65, band: "Proficient" },
//   { id: 3, date: "Feb 20, 2026", domain: "Web Development", score: 65, tech: 62, eye: 72, vocal: 60, band: "Developing" },
//   { id: 4, date: "Feb 12, 2026", domain: "Machine Learning", score: 58, tech: 55, eye: 68, vocal: 50, band: "Developing" },
//   { id: 5, date: "Feb 01, 2026", domain: "Database Design", score: 49, tech: 45, eye: 60, vocal: 42, band: "Needs Work" },
// ];

// const QUESTIONS = [
//   { q: "Explain the difference between a stack and a queue with real-world examples.", a: "A stack is LIFO like a pile of plates. A queue is FIFO like people waiting in line. Stacks are used in function call management, queues in task scheduling.", score: 9 },
//   { q: "What is the time complexity of binary search and why?", a: "O(log n) because each step eliminates half the search space by comparing midpoint.", score: 8 },
//   { q: "Describe the concept of dynamic programming with an example.", a: "DP breaks problems into subproblems and caches results. Fibonacci with memoization is a classic example.", score: 7 },
//   { q: "How does a hash table handle collisions?", a: "Through chaining or open addressing. Chaining uses linked lists at each bucket. Open addressing probes for the next empty slot.", score: 9 },
//   { q: "Explain Dijkstra's algorithm and its time complexity.", a: "Finds shortest paths from a source node using a priority queue. Time complexity is O((V + E) log V).", score: 6 },
//   { q: "From your resume, you built a REST API — how did you handle authentication?", a: "Used JWT tokens. User logs in, server issues signed token. Client sends token in Authorization header with each request.", score: 8 },
//   { q: "Describe the database schema you designed for your project.", a: "Normalized to 3NF. Users, posts, and comments tables with foreign keys. Indexed frequently queried columns.", score: 7 },
//   { q: "What performance optimizations did you implement in your React app?", a: "Lazy loading components, memoization with useMemo, virtualized long lists, and code splitting.", score: 8 },
//   { q: "How did you test your backend services?", a: "Unit tests with Jest, integration tests with Supertest. Around 75% coverage on critical paths.", score: 6 },
//   { q: "Explain a technical challenge you faced and how you resolved it.", a: "Race conditions in async Node.js code. Resolved with proper Promise chaining and mutex locks for shared state.", score: 9 },
// ];

// const DOMAINS = [
//   { icon: "⚡", name: "Data Structures", sub: "DSA & Algorithms" },
//   { icon: "🌐", name: "Web Development", sub: "Full-Stack & APIs" },
//   { icon: "🏗️", name: "System Design", sub: "Architecture" },
//   { icon: "🧠", name: "Machine Learning", sub: "AI & Data Science" },
//   { icon: "🗄️", name: "Databases", sub: "SQL & NoSQL" },
//   { icon: "☁️", name: "Cloud & DevOps", sub: "Infra & CI/CD" },
// ];

// // ── UTILITIES ──
// function scoreColor(s) {
//   if (s >= 85) return "var(--green)";
//   if (s >= 70) return "var(--accent)";
//   if (s >= 55) return "var(--yellow)";
//   return "var(--red)";
// }

// function scoreBand(s) {
//   if (s >= 85) return { label: "Outstanding", color: "var(--green)" };
//   if (s >= 70) return { label: "Proficient", color: "var(--accent)" };
//   if (s >= 55) return { label: "Developing", color: "var(--yellow)" };
//   if (s >= 40) return { label: "Needs Work", color: "var(--yellow)" };
//   return { label: "Beginner", color: "var(--red)" };
// }

// // ── NAV COMPONENT ──
// function Nav({ user, onLogout }) {
//   return (
//     <nav className="nav z1">
//       <div className="nav-logo">Interview<span>AI</span></div>
//       <div className="nav-right">
//         <div className="nav-pill">v1.0.0</div>
//         <div className="nav-avatar" title="Profile">{user[0].toUpperCase()}</div>
//         <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
//       </div>
//     </nav>
//   );
// }

// // ── SCREEN 1: AUTH ──
// function AuthScreen({ onLogin }) {
//   const [tab, setTab] = useState("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");

//   return (
//     <div className="auth-screen z1">
//       <div className="auth-glow" />
//       <div className="auth-card">
//         <div className="auth-accent-bar" />
//         <div className="auth-logo">Interview<span>AI</span></div>
//         <div className="auth-sub">Your AI-powered mock interview coach. Get real-time feedback across technical, vocal, and visual dimensions.</div>
//         <div className="auth-tabs">
//           <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
//           <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
//         </div>
//         <div className="auth-form">
//           {tab === "register" && (
//             <div className="input-group">
//               <label className="input-label">Full Name</label>
//               <input className="input" placeholder="Arjun Sharma" value={name} onChange={e => setName(e.target.value)} />
//             </div>
//           )}
//           <div className="input-group">
//             <label className="input-label">Email</label>
//             <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div className="input-group">
//             <label className="input-label">Password</label>
//             <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
//           </div>
//           <button
//             className="btn btn-primary btn-lg"
//             style={{ width: "100%", marginTop: 4, justifyContent: "center" }}
//             onClick={() => onLogin(tab === "register" ? name || "Arjun" : "Arjun")}
//           >
//             {tab === "login" ? "Sign In →" : "Create Account →"}
//           </button>
//         </div>
//         <div className="auth-footer">
//           {tab === "login"
//             ? <span>New here? <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => setTab("register")}>Create an account</span></span>
//             : <span>Already have an account? <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => setTab("login")}>Sign in</span></span>
//           }
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── SCREEN 2: DASHBOARD ──
// function Dashboard({ user, onStart, onViewReport }) {
//   const avg = Math.round(SESSIONS.reduce((a, s) => a + s.score, 0) / SESSIONS.length);
//   const best = Math.max(...SESSIONS.map(s => s.score));

//   return (
//     <div className="z1">
//       <Nav user={user} onLogout={() => {}} />
//       <div className="dashboard">
//         <div className="dash-header">
//           <div>
//             <div className="dash-title">Welcome back, <span>{user}</span></div>
//             <div className="dash-sub">Track your interview performance and improvement over time.</div>
//           </div>
//           <button className="btn btn-primary btn-lg" onClick={onStart}>+ New Interview</button>
//         </div>

//         <div className="stat-grid">
//           {[
//             { label: "Total Sessions", value: SESSIONS.length, change: "+2 this month", dir: "up" },
//             { label: "Average Score", value: avg, change: "+6 from last month", dir: "up" },
//             { label: "Best Score", value: best, change: "Data Structures", dir: "neutral" },
//             { label: "Current Streak", value: "3d", change: "Keep it up!", dir: "up" },
//           ].map(({ label, value, change, dir }) => (
//             <div className="stat-card" key={label}>
//               <div className="stat-label">{label}</div>
//               <div className="stat-value" style={{ color: "var(--text)" }}>{value}</div>
//               <div className={`stat-change ${dir}`}>{dir === "up" ? "↑ " : ""}{change}</div>
//             </div>
//           ))}
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
//           <div className="card" style={{ padding: 0, overflow: "hidden" }}>
//             <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//               <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>Recent Sessions</span>
//               <span className="tag">Last 5</span>
//             </div>
//             <table className="sessions-table">
//               <thead>
//                 <tr>
//                   <th>Domain</th><th>Date</th><th>Score</th><th>Band</th><th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {SESSIONS.map(s => (
//                   <tr key={s.id} onClick={() => onViewReport(s)}>
//                     <td style={{ fontWeight: 500 }}>{s.domain}</td>
//                     <td style={{ color: "var(--text2)" }}>{s.date}</td>
//                     <td>
//                       <div className="score-pill" style={{ background: scoreColor(s.score) + "22", color: scoreColor(s.score) }}>
//                         {s.score}
//                       </div>
//                     </td>
//                     <td><span className="badge" style={{ background: scoreColor(s.score) + "18", color: scoreColor(s.score), border: `1px solid ${scoreColor(s.score)}44` }}>{s.band}</span></td>
//                     <td style={{ color: "var(--text3)", fontSize: 12 }}>View →</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="card">
//             <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Score Trend</div>
//             <div className="trend-chart">
//               {[...SESSIONS].reverse().map((s, i) => (
//                 <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
//                   <div
//                     className="trend-bar"
//                     style={{
//                       height: `${s.score * 0.75}%`,
//                       background: `linear-gradient(to top, ${scoreColor(s.score)}88, ${scoreColor(s.score)})`,
//                       width: "100%"
//                     }}
//                     title={`${s.score} — ${s.domain}`}
//                   />
//                   <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{s.score}</span>
//                 </div>
//               ))}
//             </div>
//             <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
//               <span style={{ fontSize: 11, color: "var(--text3)" }}>Feb 01</span>
//               <span style={{ fontSize: 11, color: "var(--text3)" }}>Mar 04</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── SCREEN 3: SETUP ──
// function SetupScreen({ user, onStart, onBack }) {
//   const [step, setStep] = useState(1);
//   const [domain, setDomain] = useState(null);
//   const [hasFile, setHasFile] = useState(false);
//   const [camActive, setCamActive] = useState(false);
//   const [gazeOk, setGazeOk] = useState(false);

//   const activateCam = () => {
//     setCamActive(true);
//     setTimeout(() => setGazeOk(true), 1500);
//   };

//   return (
//     <div className="z1">
//       <Nav user={user} onLogout={() => {}} />
//       <div className="setup-screen">
//         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
//           <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
//           <div className="setup-steps">
//             {["Domain", "Resume", "Camera"].map((label, i) => (
//               <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
//                 <div className="setup-step-num" style={{
//                   background: step > i + 1 ? "var(--green)" : step === i + 1 ? "var(--accent)" : "var(--border)",
//                   color: step >= i + 1 ? "var(--bg)" : "var(--text3)"
//                 }}>
//                   {step > i + 1 ? "✓" : i + 1}
//                 </div>
//                 <span className="setup-step-label" style={{ marginLeft: 8, color: step === i + 1 ? "var(--text)" : "var(--text2)" }}>{label}</span>
//                 {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--accent)" : "var(--border)", margin: "0 12px" }} />}
//               </div>
//             ))}
//           </div>
//         </div>

//         {step === 1 && (
//           <div className="anim-fadeup">
//             <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Choose your domain</div>
//             <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Round 1 will be tailored to this topic. Round 2 will be based on your resume.</div>
//             <div className="domain-grid">
//               {DOMAINS.map(d => (
//                 <div key={d.name} className={`domain-card ${domain === d.name ? "selected" : ""}`} onClick={() => setDomain(d.name)}>
//                   <div className="domain-icon">{d.icon}</div>
//                   <div className="domain-name">{d.name}</div>
//                   <div className="domain-sub">{d.sub}</div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
//               <button className="btn btn-primary btn-lg" disabled={!domain} onClick={() => setStep(2)} style={{ opacity: domain ? 1 : 0.4 }}>
//                 Continue →
//               </button>
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="anim-fadeup">
//             <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Upload your resume</div>
//             <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>We'll extract your experience to generate personalized Round 2 questions. PDF or DOCX, max 5MB.</div>
//             <div
//               className={`upload-zone ${hasFile ? "has-file" : ""}`}
//               onClick={() => setHasFile(true)}
//             >
//               <div className="upload-icon">{hasFile ? "✅" : "📄"}</div>
//               {hasFile
//                 ? <div style={{ fontWeight: 500, color: "var(--green)" }}>resume_arjun_sharma.pdf</div>
//                 : <div style={{ fontWeight: 500 }}>Drop your resume here or click to browse</div>
//               }
//               {!hasFile && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>PDF • DOCX • Max 5MB</div>}
//               {hasFile && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>235 KB — parsing in background</div>}
//             </div>
//             <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
//               <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
//               <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
//                 {hasFile ? "Continue →" : "Skip for now →"}
//               </button>
//             </div>
//           </div>
//         )}

//         {step === 3 && (
//           <div className="anim-fadeup">
//             <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your camera</div>
//             <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Eye contact tracking runs locally on your device. No video is sent to the server.</div>
//             <div className="cam-preview" onClick={activateCam} style={{ cursor: camActive ? "default" : "pointer" }}>
//               {camActive ? (
//                 <>
//                   <div style={{ color: "var(--text2)", fontSize: 13 }}>
//                     {gazeOk ? "👁️ Eye tracking active — looking good!" : "Initializing MediaPipe..."}
//                   </div>
//                   <div className={`gaze-dot ${gazeOk ? "" : "inactive"}`} />
//                 </>
//               ) : (
//                 <div className="cam-preview-text">
//                   <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
//                   <div>Click to activate camera preview</div>
//                 </div>
//               )}
//             </div>
//             {gazeOk && (
//               <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "12px 16px", background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "var(--radius)" }}>
//                 <span style={{ color: "var(--green)" }}>✓</span>
//                 <span style={{ fontSize: 13, color: "var(--green)" }}>Eye tracking calibrated. You're all set.</span>
//               </div>
//             )}
//             <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
//               <div style={{ display: "flex", gap: 12 }}>
//                 <button className="btn btn-ghost btn-lg" onClick={onStart}>Skip Camera</button>
//                 <button className="btn btn-primary btn-lg" onClick={onStart} style={{ opacity: gazeOk ? 1 : 0.6 }}>
//                   🎤 Start Interview
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── SCREEN 4: INTERVIEW ──
// function InterviewScreen({ user, onFinish }) {
//   const [round, setRound] = useState(1);
//   const [qIndex, setQIndex] = useState(0);
//   const [answered, setAnswered] = useState([]);
//   const [recording, setRecording] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(90);
//   const [waveBars] = useState(() => Array.from({ length: 18 }, () => Math.random() * 24 + 8));
//   const [eyePct, setEyePct] = useState(87);
//   const [wpm, setWpm] = useState(0);
//   const totalQ = 10;
//   const globalQ = (round - 1) * 5 + qIndex;

//   useEffect(() => {
//     if (!recording) return;
//     const interval = setInterval(() => {
//       setTimeLeft(t => {
//         if (t <= 1) { clearInterval(interval); handleNext(); return 90; }
//         return t - 1;
//       });
//       setWpm(w => Math.min(155, w + Math.floor(Math.random() * 8)));
//       setEyePct(e => Math.max(70, Math.min(98, e + (Math.random() > 0.5 ? 1 : -1))));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [recording]);

//   const handleNext = () => {
//     setRecording(false);
//     setTimeLeft(round === 1 ? 90 : 120);
//     setWpm(0);
//     const newAnswered = [...answered, globalQ];
//     setAnswered(newAnswered);

//     if (qIndex < 4) {
//       setQIndex(q => q + 1);
//     } else if (round === 1) {
//       setRound(2); setQIndex(0);
//     } else {
//       onFinish();
//     }
//   };

//   const timerPct = (timeLeft / (round === 1 ? 90 : 120)) * 100;
//   const isUrgent = timeLeft <= 15;

//   return (
//     <div className="interview-screen">
//       <div className="grid-bg" />

//       <div className="interview-header z1">
//         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//           <div className="nav-logo" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Interview<span style={{ color: "var(--accent)" }}>AI</span></div>
//           <div className="round-badge" style={{
//             background: round === 1 ? "var(--accent-dim)" : "var(--green-dim)",
//             color: round === 1 ? "var(--accent)" : "var(--green)",
//             border: `1px solid ${round === 1 ? "rgba(0,200,255,0.2)" : "rgba(0,229,160,0.2)"}`
//           }}>
//             {round === 1 ? "ROUND 1 — DOMAIN" : "ROUND 2 — RESUME"}
//           </div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           {Array.from({ length: totalQ }, (_, i) => (
//             <div key={i} className="q-dot"
//               style={{
//                 background: answered.includes(i) ? "var(--green)" : i === globalQ ? "var(--accent)" : "var(--border2)",
//                 animation: i === globalQ ? "pulse 1.5s infinite" : "none"
//               }}
//             />
//           ))}
//           <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text2)", marginLeft: 8 }}>
//             {globalQ + 1}/{totalQ}
//           </span>
//         </div>
//         <button className="btn btn-danger btn-sm" onClick={onFinish}>End Session</button>
//       </div>

//       <div className="interview-body z1">
//         <div className="question-card">
//           <div className="question-meta">
//             <span className="tag">Question {qIndex + 1} of 5</span>
//             <span className="badge badge-cyan">{round === 1 ? "Domain" : "Resume"}</span>
//             {recording && <span className="badge badge-red" style={{ background: "var(--red-dim)" }}>● REC</span>}
//           </div>
//           <div className="question-text">{QUESTIONS[globalQ]?.q}</div>

//           <div className="timer-section">
//             <div className="timer-row">
//               <span style={{ fontSize: 13, color: "var(--text2)" }}>Time remaining</span>
//               <span className={`timer-count ${isUrgent ? "urgent" : ""}`}>
//                 {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
//               </span>
//             </div>
//             <div className="timer-bar-wrap">
//               <div className="timer-fill" style={{
//                 width: `${timerPct}%`,
//                 background: isUrgent
//                   ? "linear-gradient(to right, var(--red), #FF8C00)"
//                   : "linear-gradient(to right, var(--accent), var(--green))"
//               }} />
//             </div>
//           </div>

//           <div className="record-section">
//             {recording && (
//               <div className="waveform">
//                 {waveBars.map((h, i) => (
//                   <div key={i} className="wave-bar" style={{
//                     height: `${Math.sin(Date.now() / 200 + i) * 12 + h}px`,
//                     background: `hsl(${190 + i * 3}, 90%, 55%)`
//                   }} />
//                 ))}
//               </div>
//             )}
//             <button
//               className={`record-btn ${recording ? "recording" : ""}`}
//               onClick={() => { setRecording(r => !r); if (!recording) setWpm(0); }}
//             >
//               {recording ? "⏹" : "🎤"}
//             </button>
//             {recording && (
//               <div className="waveform" style={{ transform: "scaleX(-1)" }}>
//                 {waveBars.map((h, i) => (
//                   <div key={i} className="wave-bar" style={{
//                     height: `${Math.cos(Date.now() / 180 + i) * 10 + h}px`,
//                     background: `hsl(${190 + i * 3}, 90%, 55%)`
//                   }} />
//                 ))}
//               </div>
//             )}
//           </div>

//           {recording && (
//             <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--text2)" }}>
//               Click ⏹ to stop and submit answer
//             </div>
//           )}

//           {!recording && (
//             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
//               <button className="btn btn-ghost" onClick={handleNext} style={{ fontSize: 13 }}>Skip →</button>
//               <button className="btn btn-primary" onClick={handleNext}>Submit Answer →</button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="interview-sidebar z1">
//         <div className="sidebar-metric">
//           <div className="sidebar-label">Eye Contact</div>
//           <div className="sidebar-value" style={{ color: eyePct > 75 ? "var(--green)" : "var(--yellow)" }}>{eyePct}%</div>
//         </div>
//         <div className="sidebar-metric">
//           <div className="sidebar-label">Speaking WPM</div>
//           <div className="sidebar-value" style={{ color: recording ? "var(--accent)" : "var(--text3)" }}>
//             {recording ? wpm : "---"}
//           </div>
//         </div>
//         <div className="sidebar-metric">
//           <div className="sidebar-label">Round</div>
//           <div className="sidebar-value" style={{ color: round === 1 ? "var(--accent)" : "var(--green)" }}>R{round}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── SCREEN 5: REPORT ──
// function ReportScreen({ user, session, onBack }) {
//   const s = session || { score: 82, tech: 78, eye: 90, vocal: 75, domain: "Data Structures", date: "Mar 04, 2026" };
//   const band = scoreBand(s.score);
//   const circumference = 2 * Math.PI * 52;
//   const dash = (s.score / 100) * circumference;

//   const fillerCounts = [2, 0, 4, 1, 3, 0, 2, 1, 5, 2];

//   return (
//     <div className="z1">
//       <Nav user={user} onLogout={() => {}} />
//       <div className="report-screen">
//         <div className="report-header">
//           <div>
//             <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>← Dashboard</button>
//             <div className="report-title">Interview Report</div>
//             <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
//               {s.domain} · {s.date}
//             </div>
//           </div>
//           <button className="btn btn-ghost">⬇ Export PDF</button>
//         </div>

//         <div className="score-section">
//           <div className="score-main">
//             <div className="score-ring">
//               <svg width="130" height="130" viewBox="0 0 130 130">
//                 <circle cx="65" cy="65" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
//                 <circle
//                   cx="65" cy="65" r="52" fill="none"
//                   stroke={scoreColor(s.score)} strokeWidth="8" strokeLinecap="round"
//                   strokeDasharray={`${dash} ${circumference}`}
//                   style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 8px ${scoreColor(s.score)}66)` }}
//                 />
//               </svg>
//               <div className="score-ring-text">
//                 <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: scoreColor(s.score), lineHeight: 1 }}>{s.score}</div>
//                 <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>/100</div>
//               </div>
//             </div>
//             <div style={{ textAlign: "center" }}>
//               <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: band.color }}>{band.label}</div>
//               <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>Overall Performance</div>
//             </div>
//           </div>

//           <div className="score-breakdown">
//             {[
//               { label: "Technical Accuracy", score: s.tech, weight: "70%", color: "var(--accent)", icon: "🧠" },
//               { label: "Eye Contact", score: s.eye, weight: "15%", color: "var(--green)", icon: "👁" },
//               { label: "Vocal Confidence", score: s.vocal, weight: "15%", color: "var(--yellow)", icon: "🎙" },
//             ].map(({ label, score, weight, color, icon }) => (
//               <div className="breakdown-item" key={label}>
//                 <div className="breakdown-header">
//                   <div className="breakdown-label">
//                     <span>{icon}</span>
//                     <span>{label}</span>
//                     <span className="badge" style={{ background: color + "18", color, border: `1px solid ${color}33`, fontSize: 10 }}>{weight}</span>
//                   </div>
//                   <div className="breakdown-score" style={{ color }}>{score}%</div>
//                 </div>
//                 <div className="progress-bar">
//                   <div className="progress-fill" style={{ width: `${score}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="metrics-row">
//           {[
//             { icon: "💬", val: "138", label: "Words Per Minute", note: "Ideal range: 120–160 WPM ✓" },
//             { icon: "😶", val: "20", label: "Total Filler Words", note: "Target: < 10 per session" },
//             { icon: "🔇", val: "14%", label: "Silence Ratio", note: "Under 20% threshold ✓" },
//           ].map(({ icon, val, label, note }) => (
//             <div className="metric-card" key={label}>
//               <div className="metric-icon">{icon}</div>
//               <div className="metric-val">{val}</div>
//               <div className="metric-label">{label}</div>
//               <div className="metric-note">{note}</div>
//             </div>
//           ))}
//         </div>

//         <div style={{ marginBottom: 28 }}>
//           <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Filler Words by Question</div>
//           <div className="card" style={{ padding: "20px 24px" }}>
//             <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90 }}>
//               {fillerCounts.map((count, i) => (
//                 <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
//                   <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: count > 3 ? "var(--red)" : "var(--text2)" }}>{count}</span>
//                   <div style={{
//                     width: "100%", height: `${Math.max(count * 12, 4)}px`,
//                     background: count > 3 ? "var(--red)" : count > 1 ? "var(--yellow)" : "var(--green)",
//                     borderRadius: "4px 4px 0 0", opacity: 0.8
//                   }} />
//                   <span style={{ fontSize: 9, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>Q{i + 1}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="qa-table">
//           <div className="qa-header">
//             <span>Question</span><span>Your Answer (Transcript)</span><span>Score</span>
//           </div>
//           {QUESTIONS.map((q, i) => (
//             <div className="qa-row" key={i}>
//               <div>
//                 <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
//                   {i < 5 ? "ROUND 1" : "ROUND 2"} · Q{(i % 5) + 1}
//                 </div>
//                 <div className="qa-q">{q.q}</div>
//               </div>
//               <div className="qa-a">{q.a}</div>
//               <div className="qa-score">
//                 <div className="qa-score-num" style={{ color: q.score >= 8 ? "var(--green)" : q.score >= 6 ? "var(--yellow)" : "var(--red)" }}>
//                   {q.score}/10
//                 </div>
//                 <div className="qa-score-bar">
//                   <div className="qa-score-fill" style={{
//                     width: `${q.score * 10}%`,
//                     background: q.score >= 8 ? "var(--green)" : q.score >= 6 ? "var(--yellow)" : "var(--red)"
//                   }} />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="feedback-card">
//           <div className="feedback-title">🤖 AI Feedback Analysis</div>
//           <div className="feedback-text">
//             <strong style={{ color: "var(--text)", display: "block", marginBottom: 8 }}>Overall Assessment</strong>
//             You demonstrated strong command of Data Structures fundamentals, particularly in areas of hash tables and graph algorithms. Your answers to Q1 and Q4 showed clear, structured thinking with well-chosen real-world examples — this is exactly what interviewers look for.
//             <br /><br />
//             <strong style={{ color: "var(--text)", display: "block", marginBottom: 8 }}>Strengths</strong>
//             Your explanation of dynamic programming (Q3) was technically accurate and concise. Eye contact was excellent throughout, indicating strong confidence under pressure. Speaking pace of 138 WPM falls in the optimal range.
//             <br /><br />
//             <strong style={{ color: "var(--text)", display: "block", marginBottom: 8 }}>Areas to Improve</strong>
//             Q5 (Dijkstra's algorithm) lacked depth on edge cases — specifically, your answer did not address negative weight edges or why Dijkstra fails in those scenarios. Consider practicing this edge case explicitly. Filler word count (20 total) is above target — most occurred in Q9 and Q5, suggesting these topics caused hesitation. Practice deliberate pausing instead.
//             <br /><br />
//             <strong style={{ color: "var(--text)", display: "block", marginBottom: 8 }}>Next Steps</strong>
//             Focus your next session on System Design — your resume mentions distributed systems experience that would benefit from dedicated practice. Target score for your next session: 88+.
//           </div>
//         </div>

//         <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingBottom: 40 }}>
//           <button className="btn btn-ghost btn-lg" onClick={onBack}>← Back to Dashboard</button>
//           <button className="btn btn-primary btn-lg" onClick={onBack}>Start Next Interview →</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── LOADING SCREEN ──
// function ProcessingScreen({ onDone }) {
//   const steps = [
//     "Transcribing audio responses...",
//     "Grading technical answers...",
//     "Analyzing speech metrics...",
//     "Generating feedback report...",
//     "Building your report card...",
//   ];
//   const [step, setStep] = useState(0);
//   const [done, setDone] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setStep(s => {
//         if (s >= steps.length - 1) {
//           clearInterval(interval);
//           setTimeout(() => { setDone(true); setTimeout(onDone, 800); }, 600);
//           return s;
//         }
//         return s + 1;
//       });
//     }, 900);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={{
//       minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
//       justifyContent: "center", gap: 32, padding: 24
//     }}>
//       <div className="grid-bg" />
//       <div className="z1" style={{ textAlign: "center", maxWidth: 400 }}>
//         <div style={{ fontSize: 48, marginBottom: 16 }}>{done ? "✅" : "⚡"}</div>
//         <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
//           {done ? "Report Ready!" : "Analyzing your interview..."}
//         </div>
//         <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 32 }}>
//           Our AI is reviewing your responses. This takes about 5 seconds.
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
//           {steps.map((s, i) => (
//             <div key={i} style={{
//               display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
//               background: i < step ? "var(--green-dim)" : i === step ? "var(--accent-dim)" : "var(--surface)",
//               border: `1px solid ${i < step ? "rgba(0,229,160,0.2)" : i === step ? "rgba(0,200,255,0.2)" : "var(--border)"}`,
//               borderRadius: "var(--radius)", transition: "all 0.4s"
//             }}>
//               <span style={{ fontSize: 14 }}>
//                 {i < step ? "✓" : i === step ? "⟳" : "○"}
//               </span>
//               <span style={{ fontSize: 13, color: i <= step ? "var(--text)" : "var(--text2)" }}>{s}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── ROOT APP ──
// export default function App() {
//   const [screen, setScreen] = useState("auth");
//   const [user, setUser] = useState("");
//   const [selectedSession, setSelectedSession] = useState(null);

//   return (
//     <>
//       <style>{FONTS + CSS}</style>
//       <div className="app">
//         <div className="grid-bg" />
//         {screen === "auth" && (
//           <AuthScreen onLogin={(name) => { setUser(name); setScreen("dashboard"); }} />
//         )}
//         {screen === "dashboard" && (
//           <Dashboard
//             user={user}
//             onStart={() => setScreen("setup")}
//             onViewReport={(s) => { setSelectedSession(s); setScreen("report"); }}
//           />
//         )}
//         {screen === "setup" && (
//           <SetupScreen
//             user={user}
//             onStart={() => setScreen("interview")}
//             onBack={() => setScreen("dashboard")}
//           />
//         )}
//         {screen === "interview" && (
//           <InterviewScreen
//             user={user}
//             onFinish={() => setScreen("processing")}
//           />
//         )}
//         {screen === "processing" && (
//           <ProcessingScreen onDone={() => setScreen("report")} />
//         )}
//         {screen === "report" && (
//           <ReportScreen
//             user={user}
//             session={selectedSession}
//             onBack={() => { setSelectedSession(null); setScreen("dashboard"); }}
//           />
//         )}
//       </div>
//     </>
//   );
// }

import App from './MockInterviewApp.jsx'
export default App