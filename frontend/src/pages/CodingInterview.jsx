import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DIFFICULTY_COLORS = {
  EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  HARD: "text-red-400 bg-red-500/10 border-red-500/30",
  EXPERT: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

const TOPICS = [
  "arrays", "strings", "hashmaps", "two-pointers", "sliding-window",
  "stacks", "queues", "linked-lists", "trees", "graphs",
  "dynamic-programming", "greedy", "recursion", "sorting", "searching",
  "math", "bit-manipulation", "design", "concurrency",
];

const COMPANY_OPTIONS = [
  { id: "GENERAL", label: "General" },
  { id: "GOOGLE", label: "Google" },
  { id: "AMAZON", label: "Amazon" },
  { id: "META", label: "Meta" },
  { id: "MICROSOFT", label: "Microsoft" },
  { id: "ADOBE", label: "Adobe" },
  { id: "UBER", label: "Uber" },
  { id: "FLIPKART", label: "Flipkart" },
];

function CodingInterview() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [phase, setPhase] = useState("setup");
  const [session, setSession] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [company, setCompany] = useState("GENERAL");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) { setUser(u); setUid(u.uid); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (phase === "coding" && !timerRef.current) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const generateProblem = async () => {
    if (!uid) return;
    setLoading(true);
    setError("");
    setResults(null);
    setElapsed(0);
    try {
      const res = await fetch(`${BASE}/coding/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: uid, company, difficulty: difficulty || undefined, topic: topic || undefined }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setCode(data.session.code);
        setLanguage(data.session.language || "javascript");
        setPhase("coding");
        loadHistory();
      } else setError(data.error || "Failed to generate");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const evaluateCode = async () => {
    if (!session || !uid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/coding/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, code, language, firebaseUid: uid }),
      });
      const data = await res.json();
      if (data.evaluation) setResults(data.evaluation);
      else setError(data.error || "Failed to evaluate");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const saveCode = useCallback(async () => {
    if (!session?.id || !uid) return;
    try {
      await fetch(`${BASE}/coding/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, code, language, firebaseUid: uid, timeSpent: elapsed }),
      });
    } catch { /* silent */ }
  }, [session, code, language, uid, elapsed]);

  useEffect(() => {
    if (phase === "coding" && code) {
      const debounce = setTimeout(() => saveCode(), 5000);
      return () => clearTimeout(debounce);
    }
  }, [code, phase, saveCode]);

  const loadHistory = async () => {
    if (!uid) return;
    try {
      const res = await fetch(`${BASE}/coding/history/${uid}`);
      const data = await res.json();
      if (data.sessions) setHistory(data.sessions);
    } catch { /* silent */ }
  };

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    const starterCodes = {
      javascript: "function solution(...args) {\n  \n}",
      typescript: "function solution(...args: any[]): any {\n  \n}",
      python: "def solution(*args):\n    pass",
      java: "public class Solution {\n    public static Object solution(Object... args) {\n        return null;\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nauto solution(auto... args) {\n    \n}",
      csharp: "using System;\n\nclass Solution {\n    static object SolutionMethod(params object[] args) {\n        return null;\n    }\n}",
      go: "package main\n\nfunc solution(args ...interface{}) interface{} {\n    return nil\n}",
      rust: "fn solution() -> i32 {\n    0\n}",
    };
    setCode(starterCodes[newLang] || "// Write your code here");
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 pb-4 px-0">
      {/* Setup Phase */}
      {phase === "setup" && (
        <div className="max-w-2xl mx-auto pt-12 px-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Coding Interview</h1>
            <p className="text-zinc-400 text-sm mt-1">Practice coding problems in a realistic interview environment</p>
          </div>

          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Company</label>
                <select value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                  {COMPANY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                  <option value="">Random</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Topic (optional)</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                <option value="">Random</option>
                {TOPICS.map((t) => <option key={t} value={t}>{t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>)}
              </select>
            </div>

            <button onClick={generateProblem} disabled={loading || !uid}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : "Start Coding Interview"}
            </button>
          </div>

          {/* History */}
          <button onClick={() => { loadHistory(); setShowHistory(!showHistory); }}
            className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-all text-center">
            {showHistory ? "Hide" : "Show"} Past Sessions ({history.length})
          </button>
          {showHistory && history.length > 0 && (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-lg">
                      {h.language === "javascript" ? "🟨" : h.language === "python" ? "🐍" : "📄"}
                    </span>
                    <div>
                      <p className="text-sm text-zinc-200">{h.title}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(h.createdAt).toLocaleDateString()} · {h.language}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.completed ? (
                      <span className={`text-sm font-bold ${h.score >= 7 ? "text-emerald-400" : h.score >= 5 ? "text-amber-400" : "text-red-400"}`}>
                        {h.score}/10
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">Incomplete</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coding Phase */}
      {phase === "coding" && session && (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <button onClick={() => setPhase("setup")} className="text-zinc-400 hover:text-zinc-200 transition-all p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-sm font-semibold text-white">{session.title}</h2>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${DIFFICULTY_COLORS[session.problem?.difficulty] || "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                {session.problem?.difficulty || "MEDIUM"}
              </span>
              {session.company !== "GENERAL" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-indigo-500/30">
                  {COMPANY_OPTIONS.find(c => c.id === session.company)?.label || session.company}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select value={language} onChange={(e) => changeLanguage(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50">
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-mono text-zinc-300">{formatTime(elapsed)}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Problem Description Panel */}
            <div className="lg:w-2/5 xl:w-1/3 overflow-y-auto border-r border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-zinc-300 leading-relaxed">{session.problem?.description}</p>

                {/* Examples */}
                {session.problem?.examples?.map((ex, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-1.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Example {i + 1}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400"><span className="text-zinc-500">Input:</span> <code className="text-amber-300 bg-zinc-800 px-1 rounded">{ex.input}</code></p>
                      <p className="text-xs text-zinc-400"><span className="text-zinc-500">Output:</span> <code className="text-emerald-300 bg-zinc-800 px-1 rounded">{ex.output}</code></p>
                      {ex.explanation && <p className="text-xs text-zinc-500 mt-1">{ex.explanation}</p>}
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {session.problem?.constraints?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-1.5">Constraints:</p>
                    <ul className="space-y-1">
                      {session.problem.constraints.map((c, i) => (
                        <li key={i} className="text-xs text-zinc-500 flex items-start gap-2"><span className="text-zinc-600 mt-0.5">•</span>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hints */}
                {session.problem?.hints?.length > 0 && (
                  <div>
                    <button onClick={() => setShowHints(!showHints)}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1">
                      {showHints ? "Hide" : "Show"} Hints ({session.problem.hints.length})
                    </button>
                    {showHints && (
                      <ul className="space-y-1.5 mt-2">
                        {session.problem.hints.map((h, i) => (
                          <li key={i} className="text-xs text-amber-300/80 bg-amber-500/5 p-2 rounded-lg flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">💡</span>{h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {session.problem?.followUp && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">Follow-up</p>
                    <p className="text-xs text-emerald-400">{session.problem.followUp}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor + Results Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Monaco Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderWhitespace: "selection",
                    tabSize: 2,
                    automaticLayout: true,
                    padding: { top: 12 },
                  }}
                />
              </div>

              {/* Test Cases + Results */}
              <div className="border-t border-zinc-800 bg-zinc-900/80">
                {results ? (
                  <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                    {/* Score Summary */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Score:</span>
                        <span className={`text-lg font-bold ${results.overallScore >= 7 ? "text-emerald-400" : results.overallScore >= 5 ? "text-amber-400" : "text-red-400"}`}>
                          {results.overallScore}/10
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${results.passedCount === results.totalCount ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {results.passedCount}/{results.totalCount} Passed
                        </span>
                        {results.timeComplexity && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400">{results.timeComplexity}</span>
                        )}
                      </div>
                    </div>

                    {/* Test Case Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto">
                      {results.testResults?.map((tr, i) => (
                        <button key={i} onClick={() => setActiveTestCase(i)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                            activeTestCase === i
                              ? tr.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                              : tr.passed ? "bg-emerald-500/5 border-zinc-700 text-emerald-400/60" : "bg-red-500/5 border-zinc-700 text-red-400/60"
                          }`}>
                          {tr.passed ? "✓" : "✗"} Case {tr.testCase + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Test Case Detail */}
                    {results.testResults?.[activeTestCase] && (
                      <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">Test Case {activeTestCase + 1}</span>
                          <span className={results.testResults[activeTestCase].passed ? "text-emerald-400 text-xs font-semibold" : "text-red-400 text-xs font-semibold"}>
                            {results.testResults[activeTestCase].passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400"><span className="text-zinc-500">Input:</span> <code className="text-amber-300">{results.testResults[activeTestCase].input}</code></p>
                        <p className="text-xs text-zinc-400"><span className="text-zinc-500">Expected:</span> <code className="text-emerald-300">{results.testResults[activeTestCase].expected}</code></p>
                        <p className="text-xs text-zinc-400"><span className="text-zinc-500">Actual:</span> <code className="text-zinc-300">{results.testResults[activeTestCase].actual}</code></p>
                        {results.testResults[activeTestCase].notes && (
                          <p className="text-xs text-zinc-500 mt-1">{results.testResults[activeTestCase].notes}</p>
                        )}
                      </div>
                    )}

                    {/* Feedback */}
                    {results.feedback && (
                      <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                        <p className="text-xs text-zinc-300">{results.feedback}</p>
                      </div>
                    )}

                    {/* Strengths / Improvements */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {results.strengths?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">Strengths</p>
                          <ul className="space-y-1">{results.strengths.map((s, i) => <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5"><span className="text-emerald-400">✓</span>{s}</li>)}</ul>
                        </div>
                      )}
                      {results.improvements?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">Improvements</p>
                          <ul className="space-y-1">{results.improvements.map((imp, i) => <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5"><span className="text-amber-400">→</span>{imp}</li>)}</ul>
                        </div>
                      )}
                    </div>

                    {/* Optimized Code */}
                    {results.optimizedCode && (
                      <div>
                        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">Optimized Solution</p>
                        <pre className="bg-zinc-950 rounded-xl p-3 text-xs text-zinc-300 font-mono overflow-x-auto border border-zinc-800">
                          <code>{results.optimizedCode}</code>
                        </pre>
                      </div>
                    )}

                    <button onClick={() => setPhase("setup")}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition-all">
                      Back to Setup
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {session.testCases?.slice(0, 6).map((tc, i) => (
                        <button key={i} onClick={() => setActiveTestCase(i)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                            activeTestCase === i ? "bg-zinc-700/50 border-zinc-600 text-zinc-200" : "bg-zinc-800/30 border-zinc-700/50 text-zinc-500 hover:text-zinc-300"
                          }`}>
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                    <button onClick={evaluateCode} disabled={loading}
                      className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1.5">
                      {loading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Evaluating</> : "Submit"}
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="px-4 pb-2">
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">{error}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodingInterview;
