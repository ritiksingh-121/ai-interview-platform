import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ScoreGauge from "../components/ui/ScoreGauge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getInterviewFeedback } from "../api/api";
import { auth } from "../firebase";
import { fadeUp, staggerContainer, slideUp } from "../lib/motion";

const scoreColor = (val) => {
  if (val >= 80) return { text: "text-emerald-400", badge: "success", label: "Excellent" };
  if (val >= 60) return { text: "text-amber-400", badge: "warning", label: "Good" };
  if (val >= 40) return { text: "text-orange-400", badge: "warning", label: "Needs Work" };
  return { text: "text-red-400", badge: "error", label: "Poor" };
};

const METRICS = [
  { key: "technicalScore", label: "Technical", icon: "💻" },
  { key: "communicationScore", label: "Communication", icon: "🗣️" },
  { key: "confidenceScore", label: "Confidence", icon: "💪" },
  { key: "problemSolvingScore", label: "Problem Solving", icon: "🧩" },
  { key: "dsaScore", label: "DSA", icon: "📊" },
  { key: "systemDesignScore", label: "System Design", icon: "🏗️" },
  { key: "codingScore", label: "Coding", icon: "⚡" },
  { key: "projectsScore", label: "Projects", icon: "📁" },
  { key: "hrScore", label: "HR", icon: "🤝" },
  { key: "softSkillsScore", label: "Soft Skills", icon: "🌟" },
];

export default function FeedbackDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const interviewData = location.state?.messages || [];
  const interviewId = location.state?.interviewId;

  const [feedback, setFeedback] = useState(location.state?.feedback || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateFeedback = async () => {
    if (interviewData.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      const result = await getInterviewFeedback({
        messages: interviewData,
        userId: user?.uid,
        interviewId,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setFeedback(result);
      }
    } catch {
      setError("Failed to generate feedback");
    }
    setLoading(false);
  };

  const overallColor = feedback ? scoreColor(feedback.overallScore) : { text: "text-zinc-400" };
  const hireColor = feedback ? scoreColor(feedback.hiringProbability) : { text: "text-zinc-400" };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      <section className="relative pt-32 pb-10 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-950/20 to-transparent" />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Badge variant="green" className="px-3 py-1 uppercase tracking-wider text-[10px]">
            AI Interview Analysis
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Feedback <span className="gradient-accent-text">Dashboard</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Comprehensive AI-powered analysis of your interview performance with detailed scores across all competencies.
          </p>
        </motion.div>
      </section>

      <div className="px-4 sm:px-8 max-w-7xl mx-auto pb-20 space-y-10">
        {interviewData.length === 0 && !feedback ? (
          <Card variant="glass" className="p-12 text-center space-y-4">
            <p className="text-zinc-400">No interview data available.</p>
            <Button variant="green" onClick={() => navigate("/interview")}>Take an Interview</Button>
          </Card>
        ) : feedback ? (
          <AnimatePresence>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
              {/* Overall Score */}
              <motion.div variants={slideUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="highlight" className="p-6 flex flex-col items-center justify-center">
                  <ScoreGauge score={feedback.overallScore || 0} max={100} size={140} strokeWidth={10} label="Overall Score" />
                </Card>
                <Card variant="highlight" className="p-6 flex flex-col items-center justify-center">
                  <ScoreGauge score={feedback.hiringProbability || 0} max={100} size={140} strokeWidth={10} label="Hiring Probability" />
                </Card>
                <Card variant="glass" className="p-6 flex flex-col justify-center col-span-2">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Summary</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {feedback.strengths?.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="success">{s}</Badge>
                    ))}
                    {feedback.weaknesses?.slice(0, 3).map((w, i) => (
                      <Badge key={i} variant="warning">{w}</Badge>
                    ))}
                  </div>
                  {feedback.improvementPlan && (
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{feedback.improvementPlan}</p>
                  )}
                </Card>
              </motion.div>

              {/* Score Grid */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {METRICS.map(({ key, label, icon }) => {
                  const val = feedback[key];
                  if (val === null || val === undefined) return null;
                  const { text, badge } = scoreColor(val);
                  return (
                    <Card key={key} variant="glass" hover className="p-4 flex items-center gap-3">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
                        <p className={`text-xl font-bold ${text}`}>{val}<span className="text-xs text-zinc-500">/100</span></p>
                        <Badge variant={badge} className="mt-1 text-[10px]">{scoreColor(val).label}</Badge>
                      </div>
                    </Card>
                  );
                })}
              </motion.div>

              {/* Strengths & Weaknesses */}
              <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
                <Card variant="glass" className="p-6 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-emerald-400 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card variant="glass" className="p-6 space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Areas to Improve</h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-amber-400 mt-0.5">→</span> {w}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              {/* Improvement Plan */}
              {feedback.improvementPlan && (
                <motion.div variants={fadeUp}>
                  <Card variant="green" className="p-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">Improvement Plan</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{feedback.improvementPlan}</p>
                  </Card>
                </motion.div>
              )}

              {/* Detailed Feedback */}
              {feedback.detailedFeedback && (
                <motion.div variants={fadeUp}>
                  <Card variant="glass" className="p-6">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">Detailed Analysis</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{feedback.detailedFeedback}</p>
                  </Card>
                </motion.div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="green" onClick={() => navigate("/interview")}>Practice Again</Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center gap-6 py-20">
            <Card variant="glass" className="p-8 text-center max-w-md space-y-4">
              <p className="text-sm text-zinc-400">You just completed {interviewData.length} Q&A rounds.</p>
              <p className="text-xs text-zinc-500">Generate a comprehensive AI analysis of your performance.</p>
              <Button variant="live" size="lg" onClick={generateFeedback} loading={loading} className="w-full justify-center">
                Generate AI Feedback
              </Button>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
