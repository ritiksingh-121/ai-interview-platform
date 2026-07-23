import { useState, useEffect } from "react";
import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TABS = [
  { id: "practice", label: "Practice Mode", icon: "🎤" },
  { id: "star", label: "STAR Builder", icon: "⭐" },
  { id: "competency", label: "Competency Framework", icon: "📊" },
];

const CATEGORIES = {
  leadership: "Leadership & Delegation",
  teamwork: "Teamwork & Collaboration",
  conflict: "Conflict Resolution",
  problem_solving: "Problem-Solving & Critical Thinking",
  communication: "Communication & Presentation",
  adaptability: "Adaptability & Flexibility",
  time_management: "Time Management & Prioritization",
  career: "Career Goals & Motivation",
  failure: "Handling Failure & Feedback",
  ethics: "Ethics & Integrity",
};

function HRInterview() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState("practice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Practice Mode
  const [category, setCategory] = useState("leadership");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState([]);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  // STAR Builder
  const [starQuestion, setStarQuestion] = useState("");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [starAnalysis, setStarAnalysis] = useState(null);
  const [starLoading, setStarLoading] = useState(false);

  // Competency
  const [compRole, setCompRole] = useState("Software Engineer");
  const [compFramework, setCompFramework] = useState(null);
  const [compLoading, setCompLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) { setUser(u); setUid(u.uid); }
    });
    return () => unsub();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    setPracticeFeedback(null);
    setPracticeAnswers([]);
    setCurrentQ(0);
    try {
      const res = await fetch(`${BASE}/hr/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: 5 }),
      });
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
      else setError("Failed to load questions");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const submitPracticeAnswer = async (answer) => {
    const updated = [...practiceAnswers, { question: questions[currentQ]?.question, answer }];
    setPracticeAnswers(updated);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/hr/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: updated }),
        });
        const data = await res.json();
        if (data.feedback) setPracticeFeedback(data.feedback);
        else setError("Failed to get feedback");
      } catch { setError("Network error"); }
      setLoading(false);
    }
  };

  const analyzeStar = async () => {
    if (!situation || !task || !action || !result) {
      setError("Fill all STAR fields");
      return;
    }
    setStarLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/hr/analyze-star`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, task, action, result, question: starQuestion }),
      });
      const data = await res.json();
      if (data.analysis) setStarAnalysis(data.analysis);
      else setError("Failed to analyze");
    } catch { setError("Network error"); }
    setStarLoading(false);
  };

  const loadCompetency = async () => {
    setCompLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/hr/competency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: compRole }),
      });
      const data = await res.json();
      if (data.competencyFramework) setCompFramework(data.competencyFramework);
      else setError("Failed to load framework");
    } catch { setError("Network error"); }
    setCompLoading(false);
  };

  const ScoreBar = ({ label, score }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-zinc-800 rounded-full h-2">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all" style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs font-bold text-emerald-400 w-6 text-right">{score}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">HR Interview Module</h1>
          <p className="text-zinc-400 text-sm mt-1">Master behavioral interviews with STAR method and competency assessment</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-emerald-400"
                  : "bg-zinc-800/30 border border-zinc-800/50 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>
        )}

        {/* Practice Mode Tab */}
        {activeTab === "practice" && (
          <div className="space-y-4">
            {!questions.length ? (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
                <label className="text-sm font-semibold text-zinc-300">Select Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={fetchQuestions}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : "Start Practice"}
                </button>
              </div>
            ) : practiceFeedback ? (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">📊 Practice Complete</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Overall", key: "overallScore" },
                    { label: "Communication", key: "communicationScore" },
                    { label: "Confidence", key: "confidenceScore" },
                    { label: "STAR Usage", key: "starUsageScore" },
                    { label: "Relevance", key: "relevanceScore" },
                    { label: "Hiring Prob.", key: "hiringProbability" },
                  ].map((item) => (
                    <div key={item.key} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
                      <p className={`text-xl font-bold mt-1 ${
                        item.key === "hiringProbability"
                          ? practiceFeedback[item.key] === "High" ? "text-emerald-400" : practiceFeedback[item.key] === "Medium" ? "text-amber-400" : "text-red-400"
                          : "text-emerald-400"
                      }`}>
                        {practiceFeedback[item.key] || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                {practiceFeedback.strengths?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">Strengths</h3>
                    <ul className="space-y-1">{practiceFeedback.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400 mt-0.5">✓</span>{s}</li>)}</ul>
                  </div>
                )}
                {practiceFeedback.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-400 mb-2">Areas to Improve</h3>
                    <ul className="space-y-1">{practiceFeedback.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-amber-400 mt-0.5">→</span>{w}</li>)}</ul>
                  </div>
                )}
                {practiceFeedback.improvementPlan && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-indigo-500/20">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-1">Improvement Plan</h3>
                    <p className="text-sm text-zinc-300">{practiceFeedback.improvementPlan}</p>
                  </div>
                )}
                {practiceFeedback.keyTakeaways?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">Key Takeaways</h3>
                    <ul className="space-y-1">{practiceFeedback.keyTakeaways.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400 mt-0.5">💡</span>{t}</li>)}</ul>
                  </div>
                )}
                <button onClick={() => { setQuestions([]); setPracticeFeedback(null); setPracticeAnswers([]); setCurrentQ(0); }} className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition-all">
                  Practice Again
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Question {currentQ + 1} of {questions.length}</span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < currentQ ? "bg-emerald-500" : i === currentQ ? "bg-cyan-500" : "bg-zinc-700"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-100 font-medium">{questions[currentQ]?.question}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">{questions[currentQ]?.difficulty}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">{questions[currentQ]?.focusArea}</span>
                </div>
                {questions[currentQ]?.starTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    💡 STAR Tip: {questions[currentQ].starTip}
                  </div>
                )}
                <AnswerInput onSubmit={submitPracticeAnswer} currentQ={currentQ} totalQ={questions.length} />
              </div>
            )}
          </div>
        )}

        {/* STAR Builder Tab */}
        {activeTab === "star" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg">⭐</div>
              <div>
                <h2 className="text-lg font-bold text-white">STAR Method Builder</h2>
                <p className="text-xs text-zinc-500">Structure your behavioral answers using Situation, Task, Action, Result</p>
              </div>
            </div>

            <input
              value={starQuestion}
              onChange={(e) => setStarQuestion(e.target.value)}
              placeholder="What question are you answering? (optional)"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />

            <div className="grid gap-3">
              {[
                { label: "Situation", key: "situation", value: situation, set: setSituation, hint: "Describe the context and background", color: "border-l-blue-500" },
                { label: "Task", key: "task", value: task, set: setTask, hint: "What was your responsibility or goal?", color: "border-l-emerald-500" },
                { label: "Action", key: "action", value: action, set: setAction, hint: "What specific steps did you take?", color: "border-l-amber-500" },
                { label: "Result", key: "result", value: result, set: setResult, hint: "What was the outcome? Use metrics if possible", color: "border-l-purple-500" },
              ].map((field) => (
                <div key={field.key} className={`pl-4 border-l-2 ${field.color}`}>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{field.label}</label>
                  <p className="text-[10px] text-zinc-600 mb-1">{field.hint}</p>
                  <textarea
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={analyzeStar}
              disabled={starLoading || !situation || !task || !action || !result}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {starLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : "Analyze STAR Answer"}
            </button>

            {starAnalysis && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-md font-bold text-white">Analysis Results</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Overall", key: "overallScore" },
                    { label: "Situation", key: "situationScore" },
                    { label: "Task", key: "taskScore" },
                    { label: "Action", key: "actionScore" },
                    { label: "Result", key: "resultScore" },
                  ].map((s) => (
                    <div key={s.key} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                      <p className="text-[10px] text-zinc-500">{s.label}</p>
                      <p className="text-xl font-bold text-amber-400">{starAnalysis[s.key] || "—"}</p>
                    </div>
                  ))}
                </div>
                <ScoreBar label="Situation" score={starAnalysis.situationScore} />
                <ScoreBar label="Task" score={starAnalysis.taskScore} />
                <ScoreBar label="Action" score={starAnalysis.actionScore} />
                <ScoreBar label="Result" score={starAnalysis.resultScore} />

                {starAnalysis.feedback && (
                  <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                    <p className="text-sm text-zinc-300">{starAnalysis.feedback}</p>
                  </div>
                )}

                {starAnalysis.strengths?.length > 0 && (
                  <div><h4 className="text-sm font-semibold text-emerald-400 mb-2">Strengths</h4>
                    <ul className="space-y-1">{starAnalysis.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400">✓</span>{s}</li>)}</ul>
                  </div>
                )}
                {starAnalysis.improvements?.length > 0 && (
                  <div><h4 className="text-sm font-semibold text-amber-400 mb-2">Improvements</h4>
                    <ul className="space-y-1">{starAnalysis.improvements.map((imp, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-amber-400">→</span>{imp}</li>)}</ul>
                  </div>
                )}
                {starAnalysis.improvedAnswer && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-indigo-500/20">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">Improved Answer</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{starAnalysis.improvedAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Competency Framework Tab */}
        {activeTab === "competency" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-lg">📊</div>
              <div>
                <h2 className="text-lg font-bold text-white">Competency Framework</h2>
                <p className="text-xs text-zinc-500">Key competencies assessed for your target role</p>
              </div>
            </div>

            <input
              value={compRole}
              onChange={(e) => setCompRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
            />

            <button
              onClick={loadCompetency}
              disabled={compLoading || !compRole}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {compLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : "Generate Framework"}
            </button>

            {compFramework && (
              <div className="space-y-4 pt-2">
                {compFramework.overallSummary && (
                  <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                    <p className="text-sm text-zinc-300">{compFramework.overallSummary}</p>
                  </div>
                )}
                {compFramework.competencies?.map((comp, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{comp.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        comp.importance === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                        comp.importance === "important" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        "bg-zinc-700/50 text-zinc-400 border border-zinc-600/50"
                      }`}>
                        {comp.importance.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{comp.description}</p>
                    {comp.questions?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Sample Questions</p>
                        <ul className="space-y-1">{comp.questions.map((q, j) => <li key={j} className="text-xs text-zinc-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span>{q}</li>)}</ul>
                      </div>
                    )}
                    {comp.assessmentCriteria?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Assessment Criteria</p>
                        <div className="flex flex-wrap gap-1.5">{comp.assessmentCriteria.map((c, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{c}</span>
                        ))}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerInput({ onSubmit, currentQ, totalQ }) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    await onSubmit(answer.trim());
    setAnswer("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer using the STAR method..."
        rows={4}
        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting || !answer.trim()}
        className="w-full py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {submitting ? "Submitting..." : currentQ < totalQ - 1 ? "Next Question →" : "Finish & Get Feedback"}
      </button>
    </div>
  );
}

export default HRInterview;
