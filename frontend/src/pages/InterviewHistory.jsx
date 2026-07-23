import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getInterviewHistory, getInterviewAnalytics } from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import ScoreGauge from "../components/ui/ScoreGauge";
import { fadeUp, staggerContainer } from "../lib/motion";

export default function InterviewHistory() {
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const [histRes, analRes] = await Promise.all([
          getInterviewHistory(user.uid),
          getInterviewAnalytics(user.uid),
        ]);
        if (histRes?.interviews) setHistory(histRes.interviews);
        if (analRes) setAnalytics(analRes);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getScoreColor = (s) => {
    if (!s) return "text-zinc-500";
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-amber-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      <section className="relative pt-32 pb-10 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-cyan-950/20 to-transparent" />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Badge variant="green" className="px-3 py-1 uppercase tracking-wider text-[10px]">
            Performance Analytics
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Interview <span className="gradient-accent-text">History</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Track your progress, review past sessions, and identify growth areas.
          </p>
        </motion.div>
      </section>

      <div className="px-4 sm:px-8 max-w-7xl mx-auto pb-20 space-y-10">
        {analytics && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={fadeUp}>
              <Card variant="highlight" className="p-6 flex flex-col items-center">
                <ScoreGauge score={analytics.averageScore || 0} max={100} size={110} strokeWidth={8} label="Avg Score" />
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card variant="glass" className="p-6 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-white">{analytics.totalInterviews || 0}</p>
                <p className="text-xs text-zinc-400 mt-2 font-medium uppercase tracking-wider">Total Interviews</p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card variant="glass" className="p-6 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-emerald-400">{analytics.scoresByRole?.length || 0}</p>
                <p className="text-xs text-zinc-400 mt-2 font-medium uppercase tracking-wider">Roles Practiced</p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card variant="glass" className="p-6 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-emerald-400">{history.filter((h) => h.feedback?.[0]?.overallScore >= 80).length}</p>
                <p className="text-xs text-zinc-400 mt-2 font-medium uppercase tracking-wider">High Scores</p>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {analytics?.scoresByRole && analytics.scoresByRole.length > 0 && (
          <motion.div variants={fadeUp}>
            <Card variant="glass" className="p-6">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4">Scores by Role</h3>
              <div className="space-y-3">
                {analytics.scoresByRole.map((r) => (
                  <div key={r.role} className="flex items-center gap-4">
                    <span className="text-xs font-medium text-zinc-300 w-32 shrink-0">{r.role}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.average >= 80 ? "bg-emerald-400" : r.average >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${r.average}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-12 text-right ${getScoreColor(r.average)}`}>{r.average}</span>
                    <span className="text-xs text-zinc-500 w-8 text-right">{r.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {history.length > 0 ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Recent Sessions</h2>
            {history.map((interview, i) => {
              const fb = interview.feedback?.[0];
              return (
                <motion.div key={interview.id} variants={fadeUp}>
                  <Card variant="glass" hover className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg">
                        {interview.company === "GOOGLE" ? "🔍" : interview.company === "AMAZON" ? "📦" : interview.company === "META" ? "👤" : "💻"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200 capitalize">{interview.role?.toLowerCase()}</p>
                        <p className="text-xs text-zinc-500">
                          {interview.company} · {interview.personality}
                          {interview._count?.messages && ` · ${interview._count.messages} messages`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {fb ? (
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getScoreColor(fb.overallScore)}`}>{fb.overallScore}/100</p>
                          <p className="text-xs text-zinc-500">{new Date(interview.createdAt).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <Badge variant="neutral">No feedback</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/feedback", { state: { feedback: fb } })}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            <p className="text-zinc-400 mb-4">No interview history yet.</p>
            <Button variant="green" onClick={() => navigate("/interview")}>Start Your First Interview</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
