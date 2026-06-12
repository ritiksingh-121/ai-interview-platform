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

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      }
    });
    return () => unsub();
  }, []);

  if (!userData) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center"><Loading text="Loading dashboard data..." /></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-8 border-b border-zinc-800"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome back, {userData.name}</h1>
          <p className="text-sm text-zinc-400 mt-1.5">Continue your mock training and assess your interview readiness level.</p>
        </div>
        <Button variant="gradient" onClick={() => navigate("/interview")} className="gap-2 shrink-0 w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          Start Mock Interview
        </Button>
      </motion.header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card variant="glass" className="p-6 relative">
              <span className="text-xl absolute top-6 right-6 opacity-80">{s.icon}</span>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-3xl font-bold tracking-tight text-zinc-100 mt-2 mb-1">{s.value}</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1"><span className="text-emerald-400 font-medium">✔</span> {s.sub}</p>
              {s.progress !== undefined && (
                <div className="w-full bg-zinc-800/60 rounded-full h-1.5 mt-4">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6">Career Acceleration Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card variant="default" hover clickable onClick={() => navigate(t.path)} className="p-6 flex flex-col justify-between h-44 group">
                <div>
                  <span className="text-3xl mb-3 block">{t.icon}</span>
                  <h3 className="text-base font-semibold text-zinc-100 mb-1.5">{t.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
                </div>
                <span className="text-xs font-medium text-pink-400 flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
                  Launch tool <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Recent Sessions</h2>
            <Badge variant="neutral">History Tracking Enabled</Badge>
          </div>
          <Card variant="default" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60">
                    <th className="p-4 font-medium text-zinc-400">Role</th>
                    <th className="p-4 font-medium text-zinc-400">Score</th>
                    <th className="p-4 font-medium text-zinc-400">Date</th>
                    <th className="p-4 font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentInterviews.map((s, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-medium flex items-center gap-2"><span>{s.icon}</span>{s.role}</td>
                      <td className="p-4 font-medium"><span className={s.score >= 80 ? "text-emerald-400" : "text-amber-400"}>{s.score}/100</span></td>
                      <td className="p-4 text-zinc-400">{s.date}</td>
                      <td className="p-4"><Badge variant={s.status === "Scored" ? "success" : "primary"}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Focus Milestones</h2>
          <Card variant="glass" className="p-6 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 mb-2">React Framework Mastery</h4>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5"><span>Progress</span><span>80%</span></div>
              <div className="w-full bg-zinc-800/60 rounded-full h-1"><div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1 rounded-full" style={{ width: "80%" }} /></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 mb-2">System Design Core Principles</h4>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5"><span>Progress</span><span>40%</span></div>
              <div className="w-full bg-zinc-800/60 rounded-full h-1"><div className="bg-cyan-500 h-1 rounded-full" style={{ width: "40%" }} /></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 mb-2">Graph Theory & Recursion</h4>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5"><span>Progress</span><span>65%</span></div>
              <div className="w-full bg-zinc-800/60 rounded-full h-1"><div className="bg-gradient-to-r from-pink-500/60 to-purple-500/60 h-1 rounded-full" style={{ width: "65%" }} /></div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <Button variant="outline" className="w-full justify-center" onClick={() => alert("Roadmap builder coming soon")}>Custom Roadmap Builder</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

const stats = [
  { label: "Preparation Index", value: "68%", sub: "Target level: 85%", icon: "📈", progress: 68 },
  { label: "Interviews Completed", value: "7", sub: "+2 completed this week", icon: "🎤" },
  { label: "Vocal Clarity Score", value: "84/100", sub: "Excellent syntax pacing", icon: "🗣" },
  { label: "Subscription Tier", value: "Free Plan", sub: "5 daily interviews left", icon: "💎" },
];

const quickTools = [
  { name: "Resume Tailor", desc: "Analyze your resume against a target job description.", icon: "📄", path: "/resume" },
  { name: "Cover Letter Generator", desc: "Generate high-converting cover letters.", icon: "✉", path: "/coverletter" },
  { name: "STAR Story Builder", desc: "Build and score behavioral interview stories.", icon: "🎯", path: "/star" },
  { name: "Outreach Assistant", desc: "Generate LinkedIn pitches and email copies.", icon: "📣", path: "/outreach" },
];

const recentInterviews = [
  { role: "Frontend Developer", score: 84, date: "June 11, 2026", status: "Scored", icon: "💻" },
  { role: "DSA Practice (Graphs)", score: 65, date: "June 09, 2026", status: "Completed", icon: "🧩" },
  { role: "HR Behavioral", score: 81, date: "June 04, 2026", status: "Scored", icon: "🤝" },
  { role: "Full Stack Engineer", score: 72, date: "May 28, 2026", status: "Scored", icon: "🚀" },
];
