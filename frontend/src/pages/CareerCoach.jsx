import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import ExitConfirmationModal from "../components/ui/ExitConfirmationModal";
import useExitHandler from "../hooks/useExitHandler";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TABS = [
  { id: "advice", label: "Career Advice", icon: "💡" },
  { id: "skillgap", label: "Skill Gap Analysis", icon: "📊" },
  { id: "jobs", label: "Job Recommendations", icon: "💼" },
];

function CareerCoach() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("advice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [coaching, setCoaching] = useState(null);

  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [skillGap, setSkillGap] = useState(null);

  const [jobRole, setJobRole] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => { if (u) setUser(u); });
    return () => unsub();
  }, []);

  const getAdvice = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/coach/advice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: context || undefined }),
      });
      const data = await res.json();
      if (data.coaching) setCoaching(data.coaching);
      else setError("Failed to get advice");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const analyzeGaps = async () => {
    if (!targetRole || !currentSkills) { setError("Role and skills required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/coach/skill-gap`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole, currentSkills, experience: experience || undefined }),
      });
      const data = await res.json();
      if (data.skillGap) setSkillGap(data.skillGap);
      else setError("Failed to analyze");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const getJobs = async () => {
    if (!jobRole) { setError("Role required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/coach/jobs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: jobRole, location: jobLocation || undefined, skills: jobSkills || undefined }),
      });
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
      else setError("Failed to get recommendations");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const { showExitDialog, openExitDialog, closeExitDialog, handleConfirmExit } = useExitHandler({
    navigateTo: "/dashboard",
  });

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Career Coach</h1>
            <p className="text-zinc-400 text-sm mt-1">Personalized career advice, skill analysis, and job recommendations</p>
          </div>
          <button onClick={openExitDialog} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-medium shrink-0">Exit</button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-zinc-800/30 border border-zinc-800/50 text-zinc-400 hover:text-zinc-200"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}

        {/* Career Advice */}
        {activeTab === "advice" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a career question... e.g., How do I transition from frontend to full-stack?"
              rows={3} className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
            <input value={context} onChange={(e) => setContext(e.target.value)}
              placeholder="Additional context (your experience, goals, etc.)"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            <button onClick={getAdvice} disabled={loading || !question.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Thinking...</> : "Get Advice"}
            </button>

            {coaching && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{coaching.advice}</p>
                </div>
                {coaching.actionItems?.length > 0 && (
                  <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Action Items</p>
                    <ul className="space-y-1.5">{coaching.actionItems.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-emerald-400 mt-0.5">→</span>{a}</li>)}</ul>
                  </div>
                )}
                {coaching.resources?.length > 0 && (
                  <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Resources</p>
                    <ul className="space-y-1">{coaching.resources.map((r, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">📚</span>{r}</li>)}</ul>
                  </div>
                )}
                {coaching.confidenceScore && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>Confidence:</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 max-w-[200px]">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${coaching.confidenceScore * 10}%` }} />
                    </div>
                    <span className="font-bold text-emerald-400">{coaching.confidenceScore}/10</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Skill Gap Analysis */}
        {activeTab === "skillgap" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target role (e.g., Senior Frontend)"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
              <input value={experience} onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience level (e.g., 3 years)"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            </div>
            <textarea value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="Your current skills (comma-separated)... e.g., React, Node.js, TypeScript, AWS"
              rows={3} className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
            <button onClick={analyzeGaps} disabled={loading || !targetRole || !currentSkills}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : "Analyze Skill Gaps"}
            </button>

            {skillGap && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                {skillGap.analysis && <p className="text-sm text-zinc-300">{skillGap.analysis}</p>}
                {skillGap.strengths?.length > 0 && (
                  <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Your Strengths</p>
                    <div className="flex flex-wrap gap-1.5">{skillGap.strengths.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{s}</span>)}</div>
                  </div>
                )}
                {skillGap.gaps?.length > 0 && (
                  <div><p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Skill Gaps</p>
                    <div className="space-y-2">{skillGap.gaps.map((g, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                        <div>
                          <p className="text-sm text-zinc-200">{g.skill}</p>
                          {g.learningResource && <p className="text-xs text-zinc-500 mt-0.5">📚 {g.learningResource}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          g.importance === "critical" ? "bg-red-500/10 text-red-400" :
                          g.importance === "important" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-700/50 text-zinc-400"
                        }`}>{g.importance.replace("_", " ")}</span>
                      </div>
                    ))}</div>
                  </div>
                )}
                {skillGap.roadmap && <div className="p-4 rounded-xl bg-emerald-500/10 border border-indigo-500/20"><p className="text-xs text-emerald-400 font-semibold mb-1">Recommended Learning Path</p><p className="text-sm text-zinc-300">{skillGap.roadmap}</p></div>}
                {skillGap.marketDemand && <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50"><p className="text-xs text-zinc-400">📊 Market Demand: {skillGap.marketDemand}</p></div>}
              </div>
            )}
          </div>
        )}

        {/* Job Recommendations */}
        {activeTab === "jobs" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={jobRole} onChange={(e) => setJobRole(e.target.value)}
                placeholder="Target role"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
              <input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            </div>
            <input value={jobSkills} onChange={(e) => setJobSkills(e.target.value)}
              placeholder="Your key skills (comma-separated, optional)"
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            <button onClick={getJobs} disabled={loading || !jobRole}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Searching...</> : "Get Recommendations"}
            </button>

            {jobs && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                {jobs.marketInsight && <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50"><p className="text-sm text-zinc-300">{jobs.marketInsight}</p></div>}
                {jobs.recommendations?.length > 0 && (
                  <div className="space-y-3">
                    {jobs.recommendations.map((job, i) => (
                      <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div><p className="text-sm font-bold text-white">{job.title}</p><p className="text-xs text-zinc-400">{job.company}</p></div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">{job.matchScore}/10</p>
                            <p className="text-[10px] text-zinc-500">Match</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300">{job.whyMatch}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skillsNeeded?.map((s, j) => <span key={j} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{s}</span>)}
                        </div>
                        {job.salaryRange && <p className="text-xs text-zinc-500">💰 {job.salaryRange}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {jobs.tips?.length > 0 && (
                  <div><p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Tips</p>
                    <ul className="space-y-1">{jobs.tips.map((t, i) => <li key={i} className="text-sm text-zinc-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">💡</span>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ExitConfirmationModal
        isOpen={showExitDialog}
        onContinue={closeExitDialog}
        onExit={handleConfirmExit}
      />
    </div>
  );
}

export default CareerCoach;
