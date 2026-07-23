import { useState, useEffect } from "react";
import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function RecruiterDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("register");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [recruiter, setRecruiter] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => { if (u) { setUser(u); setEmail(u.email); } });
    return () => unsub();
  }, []);

  const register = async () => {
    if (!email || !name) { setError("Name and email required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/recruiter/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company }),
      });
      const data = await res.json();
      if (data.recruiter) { setRecruiter(data.recruiter); setTab("dashboard"); loadDashboard(); }
      else setError(data.error || "Failed");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const loadDashboard = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${BASE}/recruiter/dashboard/${email}`);
      const data = await res.json();
      if (data.dashboard) setDashboard(data.dashboard);
    } catch {}
  };

  const sendInvite = async () => {
    if (!candidateEmail) { setError("Candidate email required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/recruiter/invite`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterEmail: email, candidateEmail, candidateName: candidateName || undefined, message: inviteMsg || undefined }),
      });
      const data = await res.json();
      if (data.invite) { setCandidateEmail(""); setCandidateName(""); setInviteMsg(""); loadDashboard(); }
      else setError(data.error || "Failed");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { if (email) { loadDashboard(); } }, [email]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Send interview invites and track candidate pipeline</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}

        {/* Register Tab */}
        {tab === "register" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-indigo-500/30 flex items-center justify-center text-lg">👔</div>
              <div><h2 className="text-lg font-bold text-white">Register as Recruiter</h2><p className="text-xs text-zinc-500">Create your recruiter profile to start inviting candidates</p></div>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
            <button onClick={register} disabled={loading || !name || !email}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</> : "Register"}
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Invites", key: "total", color: "text-emerald-400" },
                { label: "Pending", key: "pending", color: "text-amber-400" },
                { label: "Accepted", key: "accepted", color: "text-emerald-400" },
                { label: "Completed", key: "completed", color: "text-teal-400" },
              ].map((stat) => (
                <div key={stat.key} className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{dashboard?.stats?.[stat.key] || 0}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Send Invite */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">Send Interview Invite</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} placeholder="Candidate email" className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
                <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Candidate name (optional)" className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <textarea value={inviteMsg} onChange={(e) => setInviteMsg(e.target.value)} placeholder="Personal message (optional)" rows={2} className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
              <button onClick={sendInvite} disabled={loading || !candidateEmail}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40">
                Send Invite
              </button>
            </div>

            {/* Invites List */}
            {dashboard?.invites?.length > 0 && (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">Recent Invites ({dashboard.invites.length})</h3>
                <div className="space-y-2">
                  {dashboard.invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                      <div>
                        <p className="text-sm text-zinc-200">{inv.candidateName || inv.candidateEmail}</p>
                        <p className="text-[10px] text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()} · {inv.candidateEmail}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                        inv.status === "ACCEPTED" ? "bg-blue-500/10 text-blue-400" :
                        inv.status === "DECLINED" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        {recruiter && (
          <div className="flex gap-2 justify-center">
            <button onClick={() => setTab("register")} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === "register" ? "bg-emerald-500/10 text-emerald-400 border border-indigo-500/30" : "bg-zinc-800/30 text-zinc-400 border border-zinc-800/50"}`}>
              Profile
            </button>
            <button onClick={() => { setTab("dashboard"); loadDashboard(); }} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-indigo-500/30" : "bg-zinc-800/30 text-zinc-400 border border-zinc-800/50"}`}>
              Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
