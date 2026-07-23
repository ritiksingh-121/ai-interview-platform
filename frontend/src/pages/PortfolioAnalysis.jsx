import { useState, useEffect } from "react";
import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function PortfolioAnalysis() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => { if (u) { setUser(u); setUid(u.uid); } });
    return () => unsub();
  }, []);

  useEffect(() => { if (uid) loadHistory(); }, [uid]);

  const loadHistory = async () => {
    if (!uid) return;
    try {
      const res = await fetch(`${BASE}/portfolio/analysis/${uid}`);
      const data = await res.json();
      if (data.analyses) setHistory(data.analyses);
    } catch {}
  };

  const analyze = async () => {
    if (!uid || !url.trim()) { setError("Portfolio URL required"); return; }
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch(`${BASE}/portfolio/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: uid, url: url.trim() }),
      });
      const data = await res.json();
      if (data.analysis) { setAnalysis(data.analysis); loadHistory(); }
      else setError(data.error || "Failed to analyze");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const ScoreRing = ({ label, score }) => {
    const r = 28; const c = 2 * Math.PI * r;
    const offset = c - (score / 10) * c;
    const color = score >= 7 ? "#34d399" : score >= 5 ? "#fbbf24" : "#f87171";
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width="68" height="68" className="transform -rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="#27272a" strokeWidth="5" />
          <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className="text-lg font-bold" style={{ color }}>{score}/10</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Analysis</h1>
          <p className="text-zinc-400 text-sm mt-1">Get AI-powered analysis of your developer portfolio</p>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
          <div className="flex gap-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-portfolio.com"
              className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
              onKeyDown={(e) => e.key === "Enter" && analyze()} />
            <button onClick={analyze} disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : "Analyze"}
            </button>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">🌐 {url}</h2>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  Overall: {analysis.overallScore}/10
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <ScoreRing label="Overall" score={analysis.overallScore} />
                <ScoreRing label="Design" score={analysis.designScore} />
                <ScoreRing label="Content" score={analysis.contentScore} />
                <ScoreRing label="Performance" score={analysis.performanceScore} />
                <ScoreRing label="SEO" score={analysis.seoScore} />
                <ScoreRing label="Accessibility" score={analysis.accessibilityScore} />
              </div>

              {analysis.summary && <p className="text-sm text-zinc-300 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">{analysis.summary}</p>}

              {analysis.strengths?.length > 0 && (
                <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Strengths</p>
                  <ul className="space-y-1">{analysis.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400 mt-0.5">✓</span>{s}</li>)}</ul>
                </div>
              )}

              {analysis.weaknesses?.length > 0 && (
                <div><p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Weaknesses</p>
                  <ul className="space-y-1">{analysis.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-amber-400 mt-0.5">→</span>{w}</li>)}</ul>
                </div>
              )}

              {analysis.suggestions?.length > 0 && (
                <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Suggestions</p>
                  <ul className="space-y-1">{analysis.suggestions.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400 mt-0.5">💡</span>{s}</li>)}</ul>
                </div>
              )}

              {analysis.projectQuality && (
                <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                  <p className="text-xs text-zinc-400 font-semibold mb-1">Project Assessment</p>
                  <p className="text-sm text-zinc-300">{analysis.projectQuality}</p>
                </div>
              )}

              {analysis.interviewQuestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Interview Questions from Your Portfolio</p>
                  <div className="space-y-2">
                    {analysis.interviewQuestions.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                        <p className="text-sm text-zinc-200">{q.question}</p>
                        {q.focus && <p className="text-[10px] text-zinc-500 mt-1">🎯 {q.focus}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Previous Analyses</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 cursor-pointer hover:bg-zinc-800/60 transition-all"
                  onClick={() => setAnalysis(h)}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌐</span>
                    <div>
                      <p className="text-sm text-zinc-200 truncate max-w-[200px]">{h.url}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioAnalysis;
