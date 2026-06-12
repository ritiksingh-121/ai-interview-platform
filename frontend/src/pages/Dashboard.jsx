import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUserData(snap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-darkbg text-white flex items-center justify-center">
        <Loading text="Loading dashboard data..." />
      </div>
    );
  }

  // Animation configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-darkbg text-white pt-24 pb-16 px-6 max-w-7xl mx-auto selection:bg-accent-500/30">
      {/* Glow Backdrops */}
      <div className="absolute top-[10vh] left-10 w-[500px] h-[250px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10vh] right-10 w-[400px] h-[200px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* 🔥 HERO HEADER */}
      <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {userData.name} 👋
          </h1>
          <p className="text-white/60 mt-1.5 text-xs sm:text-sm md:text-base">
            Continue your mock training and assess your interview readiness level.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/interview")}
          className="gap-2 shrink-0 animate-pulse-slow w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Start Mock Interview
        </Button>
      </header>

      {/* 📊 KPI CARDS */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, idx) => (
          <motion.div variants={itemVariants} key={idx}>
            <Card variant="glass" className="p-4 sm:p-6 relative">
              <span className="text-xl sm:text-2xl absolute top-4 sm:top-6 right-4 sm:right-6 opacity-80">{stat.icon}</span>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">{stat.label}</p>
              <h3 className="text-xl sm:text-3xl font-bold mt-2 sm:mt-3 mb-1 sm:mb-1.5">{stat.value}</h3>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <span className="text-success-light font-bold">✔</span> {stat.sub}
              </p>
              {stat.progress !== undefined && (
                <div className="w-full bg-white/5 rounded-full h-1.5 mt-4">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-accent-500 h-1.5 rounded-full"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* 🚀 QUICK TOOLS LAUNCHPAD */}
      <section className="mb-12">
        <h2 className="text-lg font-bold tracking-tight text-white mb-6 uppercase tracking-wider text-white/50">Career Acceleration Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTools.map((tool, idx) => (
            <Card
              key={idx}
              variant="glass"
              hover
              clickable
              onClick={() => navigate(tool.path)}
              className="p-6 flex flex-col justify-between h-48 border border-white/5"
            >
              <div>
                <span className="text-3xl mb-3 block">{tool.icon}</span>
                <h3 className="text-md font-bold text-white mb-1.5">{tool.name}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{tool.desc}</p>
              </div>
              <span className="text-xs font-semibold text-accent-400 group-hover:text-accent-350 transition-colors flex items-center gap-1 mt-4">
                Launch tool
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY TABLE */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Recent Sessions</h2>
            <Badge variant="neutral" className="self-start sm:self-auto">History Tracking Enabled</Badge>
          </div>

          <Card variant="default" className="border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="p-4 font-semibold text-white/50">Role</th>
                    <th className="p-4 font-semibold text-white/50">Score</th>
                    <th className="p-4 font-semibold text-white/50">Date</th>
                    <th className="p-4 font-semibold text-white/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {recentInterviews.map((session, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-medium text-white flex items-center gap-2">
                        <span>{session.icon}</span>
                        {session.role}
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={session.score >= 80 ? "text-success-light" : "text-warning-light"}>
                          {session.score}/100
                        </span>
                      </td>
                      <td className="p-4 text-white/40">{session.date}</td>
                      <td className="p-4">
                        <Badge variant={session.status === "Scored" ? "success" : "accent"}>
                          {session.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* PROFILE PREP PLAN SIDEBAR */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Focus Milestones</h2>
          
          <Card variant="glass" className="p-6 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-white mb-2">React Framework Mastery</h4>
              <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                <span>Progress</span>
                <span>80%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-brand-500 h-1 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-2">System Design Core Principles</h4>
              <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                <span>Progress</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-accent-500 h-1 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-2">Graph Theory & Recursion</h4>
              <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-pink-500 h-1 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => alert("Roadmap builder coming soon")}
              >
                Custom Roadmap Builder
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

const stats = [
  {
    label: "Preparation Index",
    value: "68%",
    sub: "Target level: 85%",
    icon: "📈",
    progress: 68
  },
  {
    label: "Interviews Completed",
    value: "7",
    sub: "+2 completed this week",
    icon: "🎤"
  },
  {
    label: "Vocal Clarity Score",
    value: "84/100",
    sub: "Excellent syntax pacing",
    icon: "🗣"
  },
  {
    label: "Subscription tier",
    value: "Free Plan",
    sub: "5 daily interviews left",
    icon: "💎"
  }
];

const quickTools = [
  {
    name: "Resume Tailor",
    desc: "Analyze your resume against a target job description and get optimized ATS bullet point rewrites.",
    icon: "📄",
    path: "/resume"
  },
  {
    name: "Cover Letter Generator",
    desc: "Generate high-converting cover letters customized to specific job roles and company culture.",
    icon: "✉",
    path: "/coverletter"
  },
  {
    name: "STAR story Builder",
    desc: "Build, refine, and score behavioral interview stories using the Situation-Task-Action-Result format.",
    icon: "🎯",
    path: "/star"
  },
  {
    name: "Outreach Assistant",
    desc: "Generate high-converting LinkedIn pitches and email copies to managers for referrals.",
    icon: "📣",
    path: "/outreach"
  }
];

const recentInterviews = [
  {
    role: "Frontend Developer",
    score: 84,
    date: "June 11, 2026",
    status: "Scored",
    icon: "💻"
  },
  {
    role: "DSA Practice (Graphs)",
    score: 65,
    date: "June 09, 2026",
    status: "Completed",
    icon: "🧩"
  },
  {
    role: "HR Behavioral",
    score: 81,
    date: "June 04, 2026",
    status: "Scored",
    icon: "🤝"
  },
  {
    role: "Full Stack Engineer",
    score: 72,
    date: "May 28, 2026",
    status: "Scored",
    icon: "🚀"
  }
];