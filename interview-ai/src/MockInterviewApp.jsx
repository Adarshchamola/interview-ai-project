import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #070B18; --surface: #0C1225; --card: #111827; --card2: #131D33;
  --border: #1A2540; --border2: #243050;
  --accent: #00C8FF; --accent-dim: rgba(0,200,255,0.12); --accent-glow: rgba(0,200,255,0.25);
  --green: #00E5A0; --green-dim: rgba(0,229,160,0.12);
  --yellow: #FFB800; --yellow-dim: rgba(255,184,0,0.12);
  --red: #FF4D6A; --red-dim: rgba(255,77,106,0.12);
  --text: #E2EAF8; --text2: #7B8FB5; --text3: #3D506E;
  --font: 'DM Sans', sans-serif; --font-display: 'Syne', sans-serif; --font-mono: 'JetBrains Mono', monospace;
  --radius: 12px; --radius-lg: 18px;
}
body { background: var(--bg); color: var(--text); font-family: var(--font); }
::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--surface); } ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
.grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px); background-size: 48px 48px; }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes glow { 0%,100% { box-shadow: 0 0 12px var(--accent-glow); } 50% { box-shadow: 0 0 28px var(--accent-glow), 0 0 48px var(--accent-glow); } }
.anim-fadeup { animation: fadeUp 0.5s ease forwards; }
.z1 { position: relative; z-index: 1; }
.nav { display:flex; align-items:center; justify-content:space-between; padding:0 32px; height:64px; background:rgba(7,11,24,0.9); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
.nav-logo { font-family:var(--font-display); font-weight:800; font-size:18px; }
.nav-logo span { color:var(--accent); }
.nav-right { display:flex; align-items:center; gap:12px; }
.nav-avatar { width:34px; height:34px; border-radius:50%; background:var(--accent-dim); border:1.5px solid var(--accent); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:var(--accent); }
.btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:var(--radius); font-family:var(--font); font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; }
.btn:disabled { opacity:0.5; cursor:not-allowed; }
.btn-primary { background:var(--accent); color:var(--bg); font-weight:600; }
.btn-primary:hover:not(:disabled) { background:#33D4FF; transform:translateY(-1px); box-shadow:0 8px 24px var(--accent-glow); }
.btn-ghost { background:transparent; color:var(--text2); border:1px solid var(--border2); }
.btn-ghost:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); background:var(--accent-dim); }
.btn-danger { background:var(--red-dim); color:var(--red); border:1px solid rgba(255,77,106,0.3); }
.btn-lg { padding:14px 28px; font-size:15px; border-radius:14px; }
.btn-sm { padding:7px 14px; font-size:13px; }
.card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:24px; }
.badge { display:inline-flex; align-items:center; gap:5px; font-family:var(--font-mono); font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; }
.input-group { display:flex; flex-direction:column; gap:6px; }
.input-label { font-size:12px; font-weight:500; color:var(--text2); letter-spacing:0.5px; text-transform:uppercase; }
.input { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius); padding:12px 16px; color:var(--text); font-family:var(--font); font-size:14px; transition:border-color 0.2s, box-shadow 0.2s; outline:none; width:100%; }
.input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-dim); }
.input::placeholder { color:var(--text3); }
.error-box { background:var(--red-dim); border:1px solid rgba(255,77,106,0.3); border-radius:var(--radius); padding:12px 16px; font-size:13px; color:var(--red); }
.progress-bar { height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
.progress-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
`;

const DOMAINS = [
  { icon: "⚡", name: "Data Structures", sub: "DSA & Algorithms" },
  { icon: "🌐", name: "Web Development", sub: "Full-Stack & APIs" },
  { icon: "🏗️", name: "System Design", sub: "Architecture" },
  { icon: "🧠", name: "Machine Learning", sub: "AI & Data Science" },
  { icon: "🗄️", name: "Databases", sub: "SQL & NoSQL" },
  { icon: "☁️", name: "Cloud & DevOps", sub: "Infra & CI/CD" },
];

function scoreColor(s) {
  if (s >= 85) return "var(--green)";
  if (s >= 70) return "var(--accent)";
  if (s >= 55) return "var(--yellow)";
  return "var(--red)";
}
function scoreBand(s) {
  if (s >= 85) return { label: "Outstanding", color: "var(--green)" };
  if (s >= 70) return { label: "Proficient", color: "var(--accent)" };
  if (s >= 55) return { label: "Developing", color: "var(--yellow)" };
  if (s >= 40) return { label: "Needs Work", color: "var(--yellow)" };
  return { label: "Beginner", color: "var(--red)" };
}

function Nav({ user, onLogout }) {
  return (
    <nav className="nav z1">
      <div className="nav-logo">Interview<span>AI</span></div>
      <div className="nav-right">
        <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <span style={{ fontSize: 14, color: "var(--text2)" }}>{user?.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  );
}

// ── SCREEN 1: AUTH ───────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login" ? { email, password } : { name, email, password };
      const data = await api(endpoint, { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div className="grid-bg" />
      <div className="z1" style={{ width: "100%", maxWidth: 420, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 40, animation: "fadeUp 0.5s ease" }}>
        <div style={{ height: 3, width: 48, background: "var(--accent)", borderRadius: 2, marginBottom: 20 }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Interview<span style={{ color: "var(--accent)" }}>AI</span></div>
        <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Your AI-powered mock interview coach with real-time feedback.</div>
        <div style={{ display: "flex", background: "var(--surface)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: 8, textAlign: "center", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 7, transition: "all 0.2s", color: tab === t ? "var(--text)" : "var(--text2)", background: tab === t ? "var(--card2)" : "none", border: "none", fontFamily: "var(--font)", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.4)" : "none" }}>
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "register" && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : tab === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2: DASHBOARD ──────────────────────────────────
function Dashboard({ user, onStart, onViewReport, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/session/user/history")
      .then(d => setSessions(d.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scores = sessions.map(s => s.report?.finalScore).filter(Boolean);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  return (
    <div className="z1">
      <Nav user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
              Welcome back, <span style={{ color: "var(--accent)" }}>{user?.name}</span>
            </div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>Track your interview performance over time.</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onStart}>+ New Interview</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Sessions", value: sessions.length },
            { label: "Average Score", value: avg || "—" },
            { label: "Best Score", value: best ? Math.round(best) : "—" },
            { label: "Completed", value: sessions.filter(s => s.state === "COMPLETE").length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text2)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>{label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>Session History</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)" }}>{sessions.length} sessions</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text2)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>No sessions yet</div>
              <div style={{ fontSize: 13 }}>Click <strong>+ New Interview</strong> to start your first mock interview.</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Domain", "Date", "Score", "Status", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontFamily: "var(--font-mono)", padding: "10px 16px", borderBottom: "1px solid var(--border)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const score = s.report?.finalScore;
                  const date = new Date(s.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <tr key={s.id} onClick={() => s.state === "COMPLETE" && onViewReport(s)} style={{ cursor: s.state === "COMPLETE" ? "pointer" : "default", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, borderBottom: "1px solid var(--border)" }}>{s.domain}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>{date}</td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                        {score ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: scoreColor(score), background: scoreColor(score) + "22", padding: "3px 10px", borderRadius: 6 }}>{Math.round(score)}</span>
                          : <span style={{ color: "var(--text3)" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                        <span className="badge" style={{ background: s.state === "COMPLETE" ? "var(--green-dim)" : "var(--yellow-dim)", color: s.state === "COMPLETE" ? "var(--green)" : "var(--yellow)", border: `1px solid ${s.state === "COMPLETE" ? "rgba(0,229,160,0.2)" : "rgba(255,184,0,0.2)"}` }}>{s.state}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid var(--border)" }}>{s.state === "COMPLETE" ? "View →" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 3: SETUP ──────────────────────────────────────
function SetupScreen({ user, onStart, onBack, onLogout }) {
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleDomainNext = async () => {
    setLoading(true); setError("");
    try {
      const data = await api("/session/start", { method: "POST", body: JSON.stringify({ domain }) });
      setSessionId(data.sessionId);
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("sessionId", sessionId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/resume/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      if (!res.ok) throw new Error("Upload failed");
      setResumeFile(file);
    } catch { setError("Resume upload failed. You can continue without it."); }
    finally { setUploading(false); }
  };

  return (
    <div className="z1">
      <Nav user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            {["Domain", "Resume", "Start"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: step > i + 1 ? "var(--green)" : step === i + 1 ? "var(--accent)" : "var(--border)", color: step >= i + 1 ? "var(--bg)" : "var(--text3)" }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ marginLeft: 8, fontSize: 13, color: step === i + 1 ? "var(--text)" : "var(--text2)" }}>{label}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--accent)" : "var(--border)", margin: "0 12px" }} />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="anim-fadeup">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Choose your domain</div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Round 1 tests domain knowledge. Round 2 uses your resume.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {DOMAINS.map(d => (
                <div key={d.name} onClick={() => setDomain(d.name)} style={{ background: domain === d.name ? "var(--accent-dim)" : "var(--surface)", border: `1.5px solid ${domain === d.name ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius)", padding: 14, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ fontSize: 20 }}>{d.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>{d.sub}</div>
                </div>
              ))}
            </div>
            {error && <div className="error-box" style={{ marginTop: 14 }}>{error}</div>}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary btn-lg" disabled={!domain || loading} onClick={handleDomainNext}>
                {loading ? "Creating session..." : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="anim-fadeup">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Upload your resume</div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>We'll generate personalised Round 2 questions from it. PDF or DOCX, max 5MB.</div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{ display: "none" }} onChange={e => handleResumeUpload(e.target.files[0])} />
            <div onClick={() => fileRef.current.click()} style={{ border: `1.5px dashed ${resumeFile ? "var(--green)" : "var(--border2)"}`, borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: resumeFile ? "var(--green-dim)" : "transparent" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{uploading ? "⏳" : resumeFile ? "✅" : "📄"}</div>
              <div style={{ fontWeight: 500, color: resumeFile ? "var(--green)" : "var(--text)" }}>{uploading ? "Uploading..." : resumeFile ? resumeFile.name : "Click to upload your resume"}</div>
              {!resumeFile && !uploading && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6 }}>PDF · DOCX · Max 5MB</div>}
            </div>
            {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={() => setStep(3)} disabled={uploading}>{resumeFile ? "Continue →" : "Skip →"}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="anim-fadeup">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Ready to start</div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>Your session is set up. Eye contact tracking runs locally on your device.</div>
            <div className="card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "🎯", label: "Domain", value: domain },
                { icon: "📄", label: "Resume", value: resumeFile ? resumeFile.name : "Not uploaded — Round 2 will use domain questions" },
                { icon: "⚡", label: "Round 1", value: "5 domain questions · 90 seconds each" },
                { icon: "🧠", label: "Round 2", value: "5 resume questions · 120 seconds each" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "var(--font-mono)" }}>{label}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={() => onStart(sessionId)}>🎤 Start Interview</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SCREEN 4: INTERVIEW ──────────────────────────────────
function InterviewScreen({ user, sessionId, onFinish, onLogout }) {
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [eyePct, setEyePct] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const socketRef = useRef(null);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const timeLimitRef = useRef(90);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const eyeFramesRef = useRef({ total: 0, contact: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join_session", { sessionId }));
    socket.on("session_state", ({ state }) => {
      if (state === "TRANSITION") setTransitioning(true);
      if (state === "ROUND_2_ACTIVE") setTransitioning(false);
      if (state === "PROCESSING") onFinish(sessionId);
    });
    socket.on("question", (q) => {
      setQuestion(q); setTimeLeft(q.timeLimit || 90);
      timeLimitRef.current = q.timeLimit || 90;
      setRecording(false); clearInterval(timerRef.current);
    });
    socket.on("round_2_ready", () => setTransitioning(false));
    socket.emit("start_round_1", { sessionId });

    return () => {
      socket.disconnect();
      clearInterval(timerRef.current);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [sessionId]);

  // ── LOAD MEDIAPIPE ONCE ──────────────────────────────
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
    script1.crossOrigin = "anonymous";
    document.head.appendChild(script1);
    const script2 = document.createElement("script");
    script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
    script2.crossOrigin = "anonymous";
    document.head.appendChild(script2);
    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  // ── START MEDIAPIPE TRACKING ──────────────────────────
  const startEyeTracking = (stream) => {
    eyeFramesRef.current = { total: 0, contact: 0 };

    const initFaceMesh = () => {
      if (!window.FaceMesh) { setTimeout(initFaceMesh, 500); return; }

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        eyeFramesRef.current.total += 1;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const noseTip = landmarks[1];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const faceWidth = Math.abs(rightEye.x - leftEye.x);
          const noseOffset = Math.abs(noseTip.x - 0.5);
          // Stricter thresholds — must be clearly centered and close to camera
          const isLooking = noseOffset < 0.12 && faceWidth > 0.12;
          if (isLooking) eyeFramesRef.current.contact += 1;
          // else: face detected but not looking — counts as no contact
        }
        // else: no face detected — also counts as no contact

        // Always update the percentage
        const pct = Math.round(
          (eyeFramesRef.current.contact / eyeFramesRef.current.total) * 100
        );
        setEyePct(pct);
      });

      faceMeshRef.current = faceMesh;

      // Run face mesh on each video frame
      const processFrame = async () => {
        if (videoRef.current && faceMeshRef.current && videoRef.current.readyState >= 2) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
        animFrameRef.current = requestAnimationFrame(processFrame);
      };
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    initFaceMesh();
  };

  const stopEyeTracking = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (faceMeshRef.current) faceMeshRef.current.close();
    faceMeshRef.current = null;
  };

  useEffect(() => {
    if (!recording) { clearInterval(timerRef.current); stopEyeTracking(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { stopRecording(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(timerRef.current); };
  }, [recording]);

  const startRecording = async () => {
    // Stop any existing camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const audioStream = new MediaStream(stream.getAudioTracks());
      const mr = new MediaRecorder(audioStream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.start();
      mrRef.current = mr;
      setRecording(true);
      startEyeTracking(stream);
    } catch { alert("Please allow camera and microphone access to use this feature."); }
  };

  const stopRecording = () => {
    if (!mrRef.current) return;
    mrRef.current.stop();
    mrRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await submitAudio(blob);
    };
    setRecording(false);
    clearInterval(timerRef.current);
    stopEyeTracking();
  };

  const submitAudio = async (blob) => {
    if (!question) return;
    try {
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      form.append("sessionId", sessionId);
      form.append("questionId", question.id);
      const token = localStorage.getItem("token");
      await fetch(`${API}/audio/submit`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      socketRef.current?.emit("submit_eye_contact", { questionId: question.id, eyeContactPct: eyePct });
    } catch (err) { console.error("Audio submit error:", err); }
    finally {
      setAnswered(prev => [...prev, question.round * 10 + question.index]);
      socketRef.current?.emit("request_next_q", { sessionId });
    }
  };

  const handleSkip = () => {
    if (recording) stopRecording();
    else {
      setAnswered(prev => question ? [...prev, question.round * 10 + question.index] : prev);
      socketRef.current?.emit("request_next_q", { sessionId });
    }
  };

  const totalDone = answered.length;
  const timerPct = (timeLeft / timeLimitRef.current) * 100;
  const isUrgent = timeLeft <= 15;

  if (transitioning) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, position: "relative" }}>
      <div className="grid-bg" />
      <div className="z1" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Preparing Round 2...</div>
        <div style={{ color: "var(--text2)", fontSize: 14 }}>Generating personalised questions from your resume</div>
      </div>
    </div>
  );

  if (!question) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="z1" style={{ color: "var(--text2)" }}>Connecting to session...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="grid-bg" />
      <div className="z1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid var(--border)", background: "rgba(7,11,24,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Interview<span style={{ color: "var(--accent)" }}>AI</span></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < totalDone ? "var(--green)" : i === totalDone ? "var(--accent)" : "var(--border2)", transition: "background 0.3s" }} />
          ))}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text2)", marginLeft: 8 }}>{totalDone}/10</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="badge" style={{ background: question.round === 1 ? "var(--accent-dim)" : "var(--green-dim)", color: question.round === 1 ? "var(--accent)" : "var(--green)", border: `1px solid ${question.round === 1 ? "rgba(0,200,255,0.2)" : "rgba(0,229,160,0.2)"}` }}>
            ROUND {question.round}
          </span>
          <button className="btn btn-danger btn-sm" onClick={() => onFinish(sessionId)}>End</button>
        </div>
      </div>

      <div className="z1" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ maxWidth: 720, width: "100%", background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 20, padding: 40, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)" }}>Q{question.index} of 5</span>
            {recording && <span className="badge" style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(255,77,106,0.3)" }}>● REC</span>}
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, lineHeight: 1.45, letterSpacing: "-0.3px", marginBottom: 32 }}>{question.text}</div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Time remaining</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: isUrgent ? "var(--red)" : "var(--text)" }}>
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${timerPct}%`, background: isUrgent ? "linear-gradient(to right, var(--red), #FF8C00)" : "linear-gradient(to right, var(--accent), var(--green))" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: 160, height: 120, borderRadius: 10, border: "1px solid var(--border)", objectFit: "cover", transform: "scaleX(-1)", background: "var(--surface)", display: recording ? "block" : "none" }} />
            <button onClick={recording ? stopRecording : startRecording}
              style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${recording ? "var(--red)" : "var(--accent)"}`, background: recording ? "var(--red-dim)" : "var(--accent-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: recording ? "var(--red)" : "var(--accent)", transition: "all 0.2s", animation: recording ? "glow 1.5s infinite" : "none" }}>
              {recording ? "⏹" : "🎤"}
            </button>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>{recording ? "Click ⏹ to stop and submit" : "Click 🎤 to start recording"}</div>
            {!recording && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={handleSkip}>Skip →</button>}
          </div>
        </div>
      </div>

      <div className="z1" style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10 }}>
        {[{ label: "Eye", value: `${eyePct}%`, color: eyePct > 75 ? "var(--green)" : "var(--yellow)" }, { label: "Round", value: `R${question.round}`, color: question.round === 1 ? "var(--accent)" : "var(--green)" }].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", minWidth: 80 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontFamily: "var(--font-mono)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROCESSING SCREEN ────────────────────────────────────
function ProcessingScreen({ sessionId, onDone }) {
  const steps = ["Transcribing audio responses...", "Grading technical answers...", "Analyzing speech patterns...", "Generating written feedback...", "Building your report..."];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900);
    const poll = setInterval(async () => {
      try {
        const data = await api(`/report/${sessionId}`);
        if (data.report) { clearInterval(poll); clearInterval(tick); onDone(sessionId); }
      } catch {}
    }, 3000);
    return () => { clearInterval(tick); clearInterval(poll); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div className="grid-bg" />
      <div className="z1" style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Analyzing your interview...</div>
        <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>Our AI is reviewing all your responses.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: i < step ? "var(--green-dim)" : i === step ? "var(--accent-dim)" : "var(--surface)", border: `1px solid ${i < step ? "rgba(0,229,160,0.2)" : i === step ? "rgba(0,200,255,0.2)" : "var(--border)"}`, borderRadius: "var(--radius)", transition: "all 0.4s", textAlign: "left" }}>
              <span style={{ fontSize: 14, fontFamily: "var(--font-mono)" }}>{i < step ? "✓" : i === step ? "·" : "○"}</span>
              <span style={{ fontSize: 13, color: i <= step ? "var(--text)" : "var(--text2)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 5: REPORT ─────────────────────────────────────
function ReportScreen({ user, sessionId, onBack, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/report/${sessionId}`)
      .then(setData).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="z1" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text2)" }}>Loading report...</div>;
  if (error) return <div className="z1" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="error-box">{error}</div></div>;
  if (!data?.report) return null;

  const { report, session, questions } = data;
  const band = scoreBand(report.finalScore);
  const circ = 2 * Math.PI * 52;
  const dash = (report.finalScore / 100) * circ;

  return (
    <div className="z1">
      <Nav user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>← Dashboard</button>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>Interview Report</div>
          <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>{session.domain} · {new Date(session.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="65" cy="65" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="65" cy="65" r="52" fill="none" stroke={scoreColor(report.finalScore)} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ}`} style={{ filter: `drop-shadow(0 0 8px ${scoreColor(report.finalScore)}66)` }} />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: scoreColor(report.finalScore), lineHeight: 1 }}>{Math.round(report.finalScore)}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>/100</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: band.color }}>{band.label}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Overall Performance</div>
            </div>
          </div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { label: "Technical Accuracy", score: report.technicalScore, max: 70, color: "var(--accent)", icon: "🧠" },
              { label: "Eye Contact", score: report.eyeContactScore, max: 15, color: "var(--green)", icon: "👁" },
              { label: "Vocal Confidence", score: report.vocalScore, max: 15, color: "var(--yellow)", icon: "🎙" },
            ].map(({ label, score, max, color, icon }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{icon} {label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color }}>{score?.toFixed(1)}/{max}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(score / max) * 100}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { icon: "💬", val: report.avgWpm ? `${report.avgWpm}` : "—", label: "Words Per Minute" },
            { icon: "😶", val: report.totalFillers ?? "—", label: "Filler Words" },
            { icon: "🔇", val: report.avgSilence ? `${report.avgSilence}%` : "—", label: "Silence Ratio" },
          ].map(({ icon, val, label }) => (
            <div key={label} className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>{label}</div>
            </div>
          ))}
        </div>

        {questions?.length > 0 && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "grid", gridTemplateColumns: "2fr 2fr 90px", gap: 12 }}>
              {["Question", "Your Answer", "Score"].map(h => (
                <span key={h} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{h}</span>
              ))}
            </div>
            {questions.map((q, i) => (
              <div key={q.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 90px", gap: 12, padding: "16px 20px", borderBottom: i < questions.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>R{q.round} · Q{q.index}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{q.text}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, fontStyle: "italic" }}>{q.transcript || "No answer recorded"}</div>
                <div style={{ textAlign: "center" }}>
                  {q.technicalScore !== null ? (
                    <>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: q.technicalScore >= 8 ? "var(--green)" : q.technicalScore >= 6 ? "var(--yellow)" : "var(--red)" }}>{q.technicalScore}/10</div>
                      {q.graderNote && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3, lineHeight: 1.3 }}>{q.graderNote}</div>}
                    </>
                  ) : <span style={{ color: "var(--text3)" }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {report.writtenFeedback && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28, marginBottom: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, var(--accent), var(--green))" }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>🤖 AI Feedback</div>
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{report.writtenFeedback}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingBottom: 48 }}>
          <button className="btn btn-ghost btn-lg" onClick={onBack}>← Dashboard</button>
          <button className="btn btn-primary btn-lg" onClick={onBack}>Start Next Interview →</button>
        </div>
      </div>
    </div>
  );
}

// ── ROOT APP ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/auth/me")
        .then(d => { setUser(d.user); setScreen("dashboard"); })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const logout = () => { localStorage.removeItem("token"); setUser(null); setScreen("auth"); };

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div className="grid-bg" />
        {screen === "auth" && <AuthScreen onLogin={(u) => { setUser(u); setScreen("dashboard"); }} />}
        {screen === "dashboard" && <Dashboard user={user} onLogout={logout} onStart={() => setScreen("setup")} onViewReport={(s) => { setSessionId(s.id); setScreen("report"); }} />}
        {screen === "setup" && <SetupScreen user={user} onLogout={logout} onBack={() => setScreen("dashboard")} onStart={(sid) => { setSessionId(sid); setScreen("interview"); }} />}
        {screen === "interview" && <InterviewScreen user={user} sessionId={sessionId} onLogout={logout} onFinish={(sid) => { setSessionId(sid); setScreen("processing"); }} />}
        {screen === "processing" && <ProcessingScreen sessionId={sessionId} onDone={(sid) => { setSessionId(sid); setScreen("report"); }} />}
        {screen === "report" && <ReportScreen user={user} sessionId={sessionId} onLogout={logout} onBack={() => { setSessionId(null); setScreen("dashboard"); }} />}
      </div>
    </>
  );
}