import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import ScoreGauge from "../components/ui/ScoreGauge";
import { fadeUp, staggerContainer } from "../lib/motion";
import { syncUser, getInterviewAnalytics, getInterviewHistory, getUserProgress } from "../api/api";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
        const synced = await syncUser(user);
        if (synced?.user) setDbUser(synced.user);

        const [analRes, histRes, progRes] = await Promise.all([
          getInterviewAnalytics(user.uid),
          getInterviewHistory(user.uid),
          getUserProgress(user.uid),
        ]);
        if (analRes) setAnalytics(analRes);
        if (histRes?.interviews) setRecentSessions(histRes.interviews.slice(0, 5));
        if (progRes?.achievements) setAchievements(progRes.achievements);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <Loading text="Loading your interview dashboard..." />
      </div>
    );
  }

  const avgScore = analytics?.averageScore || 0;
  const totalInterviews = analytics?.totalInterviews || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-28 pb-safe px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-zinc-800/80"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back, {userData?.name || "Candidate"}
            </h1>
            <Badge variant="cyan">{dbUser?.plan || "Free"} Plan</Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Track your interview readiness index, analyze recent sessions, and launch AI coaching tools.
          </p>
        </div>
        <Button
          variant="green"
          size="lg"
          onClick={() => navigate("/interview", { replace: true })}
          className="gap-2 shrink-0 justify-center uppercase tracking-wider text-xs py-3.5 px-6 shadow-xl"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Start Mock Interview
        </Button>
      </motion.header>

      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-1">
          <Card variant="highlight" className="p-6 flex flex-col items-center justify-center text-center h-full">
            <ScoreGauge score={avgScore} max={100} size={130} strokeWidth={9} label="Readiness Index" />
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="glass" hover className="p-6 h-full flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <span>Mock Interviews</span>
                <span className="text-xl group-hover:scale-110 transition-transform">🎙️</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white mt-4 mb-2">{totalInterviews}</h3>
              <p className="text-xs text-zinc-400">{totalInterviews > 0 ? "Completed sessions" : "No sessions yet"}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="glass" hover className="p-6 h-full flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <span>Avg Score</span>
                <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
              </div>
              <h3 className={`text-3xl font-bold tracking-tight mt-4 mb-2 ${avgScore >= 80 ? "text-emerald-400" : avgScore >= 60 ? "text-amber-400" : "text-zinc-100"}`}>{avgScore}/100</h3>
              <p className="text-xs text-zinc-400">{avgScore >= 80 ? "Strong performance" : "Room for improvement"}</p>
            </div>
            <div className="w-full bg-zinc-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-2 rounded-full" style={{ width: `${avgScore}%` }} />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="glass" hover className="p-6 h-full flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <span>Active Subscription</span>
                <span className="text-xl group-hover:scale-110 transition-transform">💎</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mt-4 mb-2 capitalize">{dbUser?.plan || "Free"} Plan</h3>
              <p className="text-xs text-zinc-400">{dbUser?.plan === "FREE" ? "Upgrade for unlimited sessions" : "Unlimited daily sessions"}</p>
            </div>
          </Card>
        </motion.div>
      </motion.section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">Career Acceleration Suite</h2>
          <Badge variant="green">AI Powered Tools</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((t, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card
                variant="default"
                hover
                clickable
                onClick={() => navigate(t.path)}
                className="p-6 flex flex-col justify-between h-48 group border-zinc-800/80 hover:bg-zinc-800/40 hover:border-indigo-500/50 transition-all duration-200"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-indigo-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                    {t.icon}
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 mb-1.5">{t.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{t.desc}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-4 group-hover:gap-2.5 transition-all">
                  Open Tool <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {achievements.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-white">Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((a, i) => (
              <Card key={i} variant="glass" className="p-4 flex items-center gap-3 shrink-0">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{a.title}</p>
                  <p className="text-xs text-zinc-500">{a.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Recent Interview Sessions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="text-xs">
              View All →
            </Button>
          </div>
          <Card variant="glass" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/60">
                    <th className="p-5 font-bold text-zinc-400">Role</th>
                    <th className="p-5 font-bold text-zinc-400">Score</th>
                    <th className="p-5 font-bold text-zinc-400">Date</th>
                    <th className="p-5 font-bold text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {recentSessions.length > 0 ? recentSessions.map((s, i) => {
                    const fb = s.feedback?.[0];
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 font-medium text-zinc-200 flex items-center gap-3">
                          <span className="text-lg">💻</span>
                          {s.role}
                        </td>
                        <td className="p-5 font-bold">
                          <span className={fb?.overallScore >= 80 ? "text-emerald-400" : fb?.overallScore >= 60 ? "text-amber-400" : "text-zinc-400"}>
                            {fb?.overallScore || "—"}/100
                          </span>
                        </td>
                        <td className="p-5 text-zinc-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-5">
                          <Badge variant={fb ? "success" : "cyan"}>{fb ? "Scored" : "Completed"}</Badge>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-zinc-500">No sessions yet. Start your first interview!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Quick Actions</h2>
          <Card variant="glass" className="p-6 space-y-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-all text-left cursor-pointer"
              >
                <span className="text-lg">{action.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{action.label}</p>
                  <p className="text-xs text-zinc-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}

const quickTools = [
  { name: "Mock Interview", desc: "AI-powered voice & text mock interviews.", icon: "🎤", path: "/interview" },
  { name: "Voice Interview", desc: "Real-time speech analysis with STT/TTS.", icon: "🎙️", path: "/voice" },
  { name: "HR Interview", desc: "Behavioral questions with STAR feedback.", icon: "🤝", path: "/hr" },
  { name: "Coding Interview", desc: "Live coding with Monaco editor & AI eval.", icon: "💻", path: "/coding" },
  { name: "Resume Tailor", desc: "ATS score optimization and keyword gap analysis.", icon: "📄", path: "/resume" },
  { name: "Cover Letter Generator", desc: "Craft role-specific cover letters in seconds.", icon: "✉️", path: "/coverletter" },
  { name: "STAR Story Builder", desc: "Score behavioral stories with STAR guidelines.", icon: "🎯", path: "/star" },
  { name: "Outreach Assistant", desc: "Generate cold recruiter messages & LinkedIn DMs.", icon: "📣", path: "/outreach" },
  { name: "AI Code Review", desc: "Analyze code quality, complexity & security.", icon: "🔍", path: "/code-review" },
  { name: "Daily Challenge", desc: "New coding/HR challenge every day with streaks.", icon: "🔥", path: "/challenge" },
  { name: "Learning Roadmap", desc: "Personalized 7/30/90-day study plans.", icon: "🗺️", path: "/roadmap" },
  { name: "GitHub Analysis", desc: "Profile analysis & project-based interview Qs.", icon: "🐙", path: "/github" },
  { name: "Portfolio Analysis", desc: "Score design, performance, SEO & content.", icon: "🌐", path: "/portfolio" },
  { name: "Career Coach", desc: "Personalized advice, skill gaps & job matches.", icon: "💡", path: "/coach" },
  { name: "Recruiter Dashboard", desc: "Send invites & track candidate pipeline.", icon: "👔", path: "/recruiter" },
];

const quickActions = [
  { label: "Interview History", desc: "Review past sessions & scores", icon: "📋", path: "/history" },
  { label: "Get Feedback", desc: "AI analysis of your last session", icon: "📊", path: "/feedback" },
  { label: "Resume Analysis", desc: "Optimize for ATS scoring", icon: "📄", path: "/resume" },
  { label: "Learning Roadmap", desc: "Personalized study plan", icon: "🗺️", path: "/roadmap" },
  { label: "Practice Now", desc: "Start a mock interview", icon: "🎤", path: "/interview" },
];
