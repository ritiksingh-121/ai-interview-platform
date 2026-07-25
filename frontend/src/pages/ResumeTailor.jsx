import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ScoreGauge from "../components/ui/ScoreGauge";
import { LoadingSpinner } from "../components/ui/Loading";
import { analyzeResume } from "../api/api";
import { auth } from "../firebase";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useNavigate } from "react-router-dom";
import ExitConfirmationModal from "../components/ui/ExitConfirmationModal";
import useExitHandler from "../hooks/useExitHandler";

const difficultyColors = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "error",
  EXPERT: "primary",
};

export default function ResumeTailor() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const user = auth.currentUser;
      const data = await analyzeResume({
        resumeText: resume,
        jobDescription: jobDesc,
        userId: user?.uid,
      });

      if (!data || data.error) {
        setError(data?.error || "Analysis failed. Please try again.");
        return;
      }
      setResult(data);
      setActiveTab("overview");
    } catch {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { showExitDialog, openExitDialog, closeExitDialog, handleConfirmExit } = useExitHandler({
    navigateTo: "/dashboard",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      <section className="relative pt-32 pb-10 px-4 sm:px-8 overflow-hidden">
        <button
          onClick={openExitDialog}
          className="absolute top-4 right-4 sm:right-8 z-20 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-medium"
        >
          Exit
        </button>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-950/20 to-transparent" />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Badge variant="cyan" className="px-3 py-1 uppercase tracking-wider text-[10px]">
            AI Resume Intelligence
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Resume + JD <span className="gradient-accent-text">Intelligence</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Upload your resume and paste the job description. AI extracts skills, calculates match score, detects gaps, and generates personalized interview questions.
          </p>
        </motion.div>
      </section>

      <div className="px-4 sm:px-8 max-w-7xl mx-auto pb-20 space-y-10">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="glass" className="p-6 space-y-3">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Your Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 leading-relaxed resize-y font-mono text-xs transition-all"
            />
            <p className="text-xs text-zinc-500">Or upload a PDF/DOCX file (coming soon)</p>
          </Card>

          <Card variant="glass" className="p-6 space-y-3">
            <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider">
              Job Description
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 leading-relaxed resize-y font-mono text-xs transition-all"
            />
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="green"
            size="lg"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading}
            className="uppercase tracking-wider text-xs py-3.5 px-8"
          >
            Analyze & Generate Intelligence
          </Button>
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <LoadingSpinner size="xl" />
            <p className="text-xs text-zinc-500 font-medium animate-pulse">Analyzing resume, extracting skills, calculating scores...</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
              {/* Score Cards Row */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="highlight" className="p-5 flex flex-col items-center">
                  <ScoreGauge score={result.atsScore || 0} max={100} size={100} strokeWidth={8} label="ATS Score" />
                  <span className="text-[10px] text-zinc-500 mt-1">{result.atsScore >= 80 ? "Excellent" : result.atsScore >= 60 ? "Good" : "Needs Work"}</span>
                </Card>
                <Card variant="highlight" className="p-5 flex flex-col items-center">
                  <ScoreGauge score={result.matchScore || result.atsScore || 0} max={100} size={100} strokeWidth={8} label="Match Score" />
                  <span className="text-[10px] text-zinc-500 mt-1">Resume vs JD Fit</span>
                </Card>
                <Card variant="glass" className="p-5 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-amber-400">{result.skillsMissing?.length || 0}</span>
                  <span className="text-xs text-zinc-400 font-medium">Missing Skills</span>
                  <span className="text-[10px] text-zinc-500">Gap to address</span>
                </Card>
                <Card variant="glass" className="p-5 flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Interview Difficulty</span>
                  <Badge variant={difficultyColors[result.predictedDifficulty] || "neutral"}>
                    {result.predictedDifficulty || "N/A"}
                  </Badge>
                  <span className="text-[10px] text-zinc-500">AI Predicted</span>
                </Card>
              </motion.div>

              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "skills", label: "Skills Analysis" },
                  { id: "rewrites", label: "Bullet Rewrites" },
                  { id: "questions", label: "Interview Questions" },
                  { id: "plan", label: "Improvement Plan" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-cyan-500/15 text-emerald-400 border border-cyan-500/30"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <Card variant="glass" className="p-6">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4">AI Assessment</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {result.atsScore >= 80
                          ? "Your resume demonstrates strong keyword overlap and alignment with this role."
                          : result.atsScore >= 60
                          ? "Your resume is moderately aligned. Addressing the missing keywords below will improve your pass rate."
                          : "Significant gaps detected between your resume and this job description. Focus on the suggestions below."}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant={result.atsScore >= 80 ? "success" : result.atsScore >= 60 ? "warning" : "error"}>
                          {result.atsScore >= 80 ? "Strong Match" : result.atsScore >= 60 ? "Moderate Match" : "Low Match"}
                        </Badge>
                        {result.predictedDifficulty && (
                          <Badge variant={difficultyColors[result.predictedDifficulty]}>
                            {result.predictedDifficulty} Interview
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "skills" && (
                  <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-6">
                    <Card variant="glass" className="p-6 space-y-4">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span>✓</span> Skills Found ({result.skillsFound?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.skillsFound?.map((k, i) => (
                          <Badge key={i} variant="success">{k}</Badge>
                        ))}
                      </div>
                    </Card>
                    <Card variant="glass" className="p-6 space-y-4">
                      <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <span>⚡</span> Missing Skills ({result.skillsMissing?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.skillsMissing?.map((k, i) => (
                          <Badge key={i} variant="warning">{k}</Badge>
                        ))}
                      </div>
                    </Card>
                    {result.skillGap && result.skillGap.length > 0 && (
                      <Card variant="glass" className="p-6 space-y-4 md:col-span-2">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Skill Gap Analysis</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.skillGap.map((s, i) => (
                            <Badge key={i} variant="green">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === "rewrites" && (
                  <motion.div key="rewrites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {result.bulletRewrites && result.bulletRewrites.length > 0 ? (
                      <Card variant="glass" className="p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white">Optimized Bullet Points</h3>
                        <div className="space-y-4">
                          {result.bulletRewrites.map((b, i) => (
                            <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                              <p className="text-xs text-red-400 line-through">Original: {b.original}</p>
                              <p className="text-xs text-emerald-300 font-semibold">Optimized: {b.optimized}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ) : (
                      <Card variant="glass" className="p-6 text-center text-sm text-zinc-400">No bullet rewrites available.</Card>
                    )}
                  </motion.div>
                )}

                {activeTab === "questions" && (
                  <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card variant="glass" className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Personalized Interview Questions</h3>
                        <Badge variant="live">AI Generated</Badge>
                      </div>
                      <p className="text-xs text-zinc-400">Based on your resume and the job description:</p>
                      <div className="space-y-3">
                        {result.interviewQuestions?.map((q, i) => (
                          <div key={i} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5 shrink-0">Q{i + 1}.</span>
                            <p className="text-sm text-zinc-200">{q}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="green"
                        size="sm"
                        onClick={() => navigate("/interview")}
                        className="mt-2"
                      >
                        Practice These Questions
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {activeTab === "plan" && (
                  <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {result.improvementPlan && (
                      <Card variant="glass" className="p-6">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">Improvement Plan</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">{result.improvementPlan}</p>
                      </Card>
                    )}
                    {result.suggestions && result.suggestions.length > 0 && (
                      <Card variant="glass" className="p-6 space-y-4">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">AI Suggestions</h3>
                        <ul className="space-y-2">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs text-zinc-300">
                              <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExitConfirmationModal
        isOpen={showExitDialog}
        onContinue={closeExitDialog}
        onExit={handleConfirmExit}
      />
    </div>
  );
}
