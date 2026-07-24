import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getViolationTypeLabel, getSeverityColor, getRecommendation } from "../utils/violationEngine";

interface ProctoringSessionSummary {
  id: string;
  strictMode: string;
  status: string;
  violationCount: number;
  integrityScore: number | null;
  cheatingProbability: number | null;
  terminatedAt: string | null;
  terminationReason: string | null;
  createdAt: string;
  interview: { role: string; company: string; id: string } | null;
  user: { name: string; email: string } | null;
  violations: any[];
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<ProctoringSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/proctoring/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/proctoring/session/${id}/report`);
      const data = await res.json();
      setSessionDetail(data.report);
      setSelectedSession(id);
    } catch (err) {
      console.error("Failed to fetch session detail:", err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "active") return s.status === "ACTIVE";
    if (filter === "terminated") return s.status === "TERMINATED";
    if (filter === "completed") return s.status === "COMPLETED";
    if (filter === "flagged") return (s.violationCount || 0) > 3;
    return true;
  });

  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === "ACTIVE").length,
    terminated: sessions.filter((s) => s.status === "TERMINATED").length,
    flagged: sessions.filter((s) => (s.violationCount || 0) > 3).length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-20 px-4 sm:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Proctoring Admin Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor and review interview sessions</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", value: stats.total, color: "text-zinc-400" },
            { label: "Active", value: stats.active, color: "text-emerald-400" },
            { label: "Terminated", value: stats.terminated, color: "text-red-400" },
            { label: "Flagged", value: stats.flagged, color: "text-yellow-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "active", "terminated", "completed", "flagged"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium ${
                filter === f
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No sessions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => fetchSessionDetail(session.id)}
                  className={`bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-zinc-700 ${
                    selectedSession === session.id ? "border-indigo-500/50 ring-1 ring-indigo-500/20" : "border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        session.status === "ACTIVE" ? "bg-emerald-400" :
                        session.status === "TERMINATED" ? "bg-red-400" : "bg-zinc-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {session.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {session.interview?.role || "N/A"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {session.strictMode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>Violations: <span className={`font-medium ${(session.violationCount || 0) > 3 ? "text-red-400" : "text-zinc-300"}`}>{session.violationCount || 0}</span></span>
                    <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                    {session.terminatedAt && (
                      <span className="text-red-400">Terminated</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              {sessionDetail ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 sticky top-24">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-200">Session Report</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      sessionDetail.recommendation === "PASS" ? "bg-emerald-500/20 text-emerald-400" :
                      sessionDetail.recommendation === "REVIEW" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {sessionDetail.recommendation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox label="Integrity" value={`${sessionDetail.integrityScore}%`} />
                    <MetricBox label="Cheating Risk" value={`${sessionDetail.cheatingProbability}%`} />
                    <MetricBox label="Violations" value={String(sessionDetail.totalViolations)} />
                    <MetricBox label="Duration" value={`${sessionDetail.duration || 0}s`} />
                  </div>

                  {sessionDetail.severityCounts && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Severity Breakdown</p>
                      {Object.entries(sessionDetail.severityCounts).map(([sev, count]: [string, any]) =>
                        count > 0 ? (
                          <div key={sev} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              sev === "CRITICAL" ? "bg-red-500" : sev === "HIGH" ? "bg-orange-500" : sev === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                            }`} />
                            <span className="text-zinc-400">{sev}</span>
                            <span className="ml-auto text-zinc-300 font-medium">{count}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  {sessionDetail.timeline && sessionDetail.timeline.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Violation Timeline</p>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
                        {sessionDetail.timeline.slice(-10).map((v: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                              v.severity === "CRITICAL" ? "bg-red-500" :
                              v.severity === "HIGH" ? "bg-orange-500" :
                              v.severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-zinc-300 truncate">{getViolationTypeLabel(v.type)}</p>
                              <p className="text-zinc-600">{new Date(v.time).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-xs text-zinc-500">Select a session to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-zinc-200 mt-0.5">{value}</p>
    </div>
  );
}
