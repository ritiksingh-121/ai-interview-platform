import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "cpp", "csharp",
  "go", "rust", "swift", "kotlin", "ruby", "php",
];

function CodeReview() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const analyzeCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch(`${BASE}/code-review/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, context: context || undefined }),
      });
      const data = await res.json();
      if (data.analysis) setAnalysis(data.analysis);
      else setError(data.error || "Failed to analyze");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const presetExamples = {
    javascript: `function findMax(arr) {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
    python: `def find_max(arr):
    max_val = 0
    for i in range(len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val`,
    typescript: `function findMax(arr: number[]): number {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
  };

  const loadExample = () => {
    setCode(presetExamples[language] || presetExamples.javascript);
  };

  const ScoreRing = ({ label, score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;
    const color = score >= 8 ? "#34d399" : score >= 6 ? "#fbbf24" : "#f87171";

    return (
      <div className="flex flex-col items-center gap-1">
        <svg width="72" height="72" className="transform -rotate-90">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#27272a" strokeWidth="5" />
          <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className="text-lg font-bold" style={{ color }}>{score}/10</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Code Review</h1>
          <p className="text-zinc-400 text-sm mt-1">Get instant AI-powered code reviews — quality, complexity, security, and best practices</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-300">Language</label>
                <button onClick={loadExample} className="text-[10px] text-emerald-400 hover:text-emerald-400 transition-all">
                  Load Example
                </button>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={14}
                  className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-3 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  spellCheck={false}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-300">Context (optional)</label>
                <input
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., This function sorts user data..."
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                onClick={analyzeCode}
                disabled={loading || !code.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  "Review Code"
                )}
              </button>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {loading && (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-10 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400 text-sm">Analyzing your code...</p>
                <div className="flex gap-1.5">
                  {["Quality", "Security", "Performance", "Maintainability"].map((s) => (
                    <div key={s} className="px-2 py-1 rounded-md bg-zinc-800 text-[10px] text-zinc-500 animate-pulse">{s}</div>
                  ))}
                </div>
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                {/* Score Rings */}
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <ScoreRing label="Overall" score={analysis.overallScore} />
                    <ScoreRing label="Quality" score={analysis.qualityScore} />
                    <ScoreRing label="Readability" score={analysis.readabilityScore} />
                    <ScoreRing label="Performance" score={analysis.performanceScore} />
                    <ScoreRing label="Security" score={analysis.securityScore} />
                    <ScoreRing label="Maintain." score={analysis.maintainabilityScore} />
                  </div>
                </div>

                {/* Complexity */}
                {(analysis.timeComplexity || analysis.spaceComplexity) && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Complexity Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {analysis.timeComplexity && (
                        <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Time</p>
                          <p className="text-lg font-bold text-amber-400 font-mono mt-1">{analysis.timeComplexity}</p>
                        </div>
                      )}
                      {analysis.spaceComplexity && (
                        <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Space</p>
                           <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{analysis.spaceComplexity}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {analysis.summary && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2">Summary</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{analysis.summary}</p>
                  </div>
                )}

                {/* Issues */}
                {analysis.issues?.length > 0 && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-300">Issues Found ({analysis.issues.length})</h3>
                    {analysis.issues.map((issue, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${
                        issue.type === "error" ? "bg-red-500/10 border-red-500/30" :
                        issue.type === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                        "bg-blue-500/10 border-blue-500/30"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold uppercase ${
                              issue.type === "error" ? "text-red-400" :
                              issue.type === "warning" ? "text-amber-400" : "text-blue-400"
                            }`}>
                              {issue.type}
                            </span>
                            {issue.line && (
                              <span className="text-[10px] text-zinc-500 font-mono">Line {issue.line}</span>
                            )}
                          </div>
                          {issue.severity && (
                            <span className={`text-[10px] font-semibold ${
                              issue.severity === "critical" ? "text-red-400" :
                              issue.severity === "major" ? "text-amber-400" : "text-zinc-400"
                            }`}>
                              {issue.severity}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-zinc-400 mt-1">💡 {issue.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Best Practices */}
                {analysis.bestPractices?.length > 0 && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Best Practices</h3>
                    <ul className="space-y-2">
                      {analysis.bestPractices.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          {bp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Security Concerns */}
                {analysis.securityConcerns?.length > 0 && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-red-400 mb-3">Security Concerns</h3>
                    <ul className="space-y-2">
                      {analysis.securityConcerns.map((sc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-red-400 mt-0.5">⚠</span>
                          {sc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optimized Code */}
                {analysis.optimizedCode && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Optimized Code</h3>
                    <pre className="bg-zinc-950 rounded-xl p-4 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed border border-zinc-800">
                      <code>{analysis.optimizedCode}</code>
                    </pre>
                  </div>
                )}

                {/* Key Takeaways */}
                {analysis.keyTakeaways?.length > 0 && (
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Key Takeaways</h3>
                    <ul className="space-y-2">
                      {analysis.keyTakeaways.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-emerald-400 mt-0.5">💡</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!analysis && !loading && (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-10 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl">🔍</div>
                <p className="text-zinc-400 text-sm">Paste your code on the left and click "Review Code"</p>
                <p className="text-zinc-600 text-xs">Get scores for quality, performance, security, and more</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeReview;
