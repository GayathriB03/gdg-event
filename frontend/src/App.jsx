import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [question, setQuestion] = useState("What GDG events are coming up?");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setStatus("Signing in...");
    try {
      const credential = await signInWithEmailAndPassword(email, password);
      setUser(credential.user);
      setStatus("Signed in successfully.");
      await loadEvents();
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`Login failed: ${error.message}`);
    }
  }

  async function loadEvents() {
    setStatus("Loading GDG events...");
    try {
      const snapshot = await getDocs(collection(db, "event"));
      const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setEvents(rows);
      setStatus(rows.length ? "Events loaded." : "No events found.");
    } catch (error) {
      console.error("Firestore error:", error);
      setStatus(`Could not load events: ${error.message}`);
    }
  }

  async function askGemini(event) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setUnlockCode("");
    setStatus("Asking Gemini...");
    try {
      const response = await fetch(`${API_BASE}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          events: events.map(({ title, date, location, description }) => ({
            title, date, location, description
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gemini request failed");

      const generatedText = data.answer;
      setAnswer(generatedText);
      if (generatedText.includes("GDG")) {
        setUnlockCode(data.unlockCode);
        setStatus("Challenge flow completed!");
      }
    } catch (error) {
      console.error("Gemini error:", error);
      setStatus(`Assistant error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setEvents([]);
    setAnswer("");
    setUnlockCode("");
    setStatus("You have signed out.");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark">G</div>
        <div>
          <p className="eyebrow">GOOGLE DEVELOPER GROUPS</p>
          <h1>GDG Event Finder</h1>
        </div>
        {user && <button className="ghost-button" onClick={handleLogout}>Sign out</button>}
      </header>

      <section className="hero">
        <span className="pill">COMMUNITY • LEARN • BUILD</span>
        <h2>Find your next <span>build moment.</span></h2>
        <p>Explore community events and ask the Gemini assistant what to attend next.</p>
      </section>

      {!user ? (
        <section className="panel login-panel">
          <div>
            <p className="eyebrow">MEMBER ACCESS</p>
            <h3>Welcome back</h3>
            <p className="muted">Sign in with the challenge account to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="stack">
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required /></label>
            <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Your password" required /></label>
            <button className="primary-button" type="submit">Sign in <span>→</span></button>
          </form>
        </section>
      ) : (
        <div className="content-grid">
          <section className="panel">
            <div className="section-heading">
              <div><p className="eyebrow">YOUR COMMUNITY</p><h3>Upcoming events</h3></div>
              <button className="small-button" onClick={loadEvents}>Refresh</button>
            </div>
            {events.length === 0 ? <p className="muted">No events to show yet.</p> : (
              <div className="event-list">
                {events.map((item) => (
                  <article className="event-card" key={item.id}>
                    <span className="event-dot" />
                    <div><h4>{item.title || "Untitled event"}</h4><p>{item.date} · {item.location}</p><small>{item.description}</small></div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel assistant-panel">
            <p className="eyebrow">POWERED BY GEMINI</p>
            <h3>Ask the event assistant</h3>
            <p className="muted">Ask about sessions, dates, venues or which event suits your interests.</p>
            <form onSubmit={askGemini} className="stack">
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows="3" />
              <button className="primary-button" disabled={loading}>{loading ? "Thinking..." : "Ask Gemini"} <span>✦</span></button>
            </form>
            {answer && <div className="answer-box"><strong>Gemini says</strong><p>{answer}</p></div>}
            {unlockCode && <div className="unlock-box"><span>CHALLENGE UNLOCKED</span><strong>{unlockCode}</strong></div>}
          </section>
        </div>
      )}

      {status && <p className="status" role="status">{status}</p>}
      <footer>Built for the GDG debugging challenge <span>✦</span></footer>
    </main>
  );
}
