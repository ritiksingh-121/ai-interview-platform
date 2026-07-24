import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getViolationTypeLabel } from "../utils/violationEngine";

export default function InterviewReport() {
  const { sessionId } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) fetchReport();
    else setLoading(false);
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/proctoring/session/${sessionId}/report`);
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-zinc-500">No report available. Session ID not provided.</p>
        </div>
      </div>
    );
  }

  const recommendationColor =
    report.recommendation === "PASS" ? "text-emerald-400" :
    report.recommendation === "REVIEW" ? "text-yellow-400" : "text-red-400";

  const recommendationBg =
    report.recommendation === "PASS" ? "bg-emerald-500/10 border-emerald-500/30" :
    report.recommendation === "REVIEW" ? "bg-yellow-500/10 border-yellow-500/30" :
    "bg-red-500/10 border-red-500/30";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-20 px-4 sm:px-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interview Integrity Report</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {report.userName} &middot; {report.role} &middot; {report.company}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${recommendationBg}`}>
            <p className={`text-lg font-bold ${recommendationColor}`}>{report.recommendation}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Recommendation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ScoreCard label="Integrity Score" value={`${report.integrityScore}%`} color={report.integrityScore >= 80 ? "emerald" : report.integrityScore >= 50 ? "yellow" : "red"} />
          <ScoreCard label="Cheating Probability" value={`${report.cheatingProbability}%`} color={report.cheatingProbability > 50 ? "red" : report.cheatingProbability > 20 ? "yellow" : "emerald"} />
          <ScoreCard label="Total Violations" value={String(report.totalViolations)} color={report.totalViolations === 0 ? "emerald" : report.totalViolations <= 3 ? "yellow" : "red"} />
          <ScoreCard label="Duration" value={`${Math.floor((report.duration || 0) / 60)}m ${(report.duration || 0) % 60}s`} color="blue" />
        </div>

        {report.status === "TERMINATED" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-400">Interview Terminated</p>
                <p className="text-xs text-red-400/70">{report.terminationReason}</p>
              </div>
            </div>
          </div>
        )}

        {report.severityCounts && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Severity Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(report.severityCounts).map(([sev, count]: [string, any]) => (
                <div key={sev} className="text-center">
                  <p className={`text-2xl font-bold ${
                    sev === "CRITICAL" ? "text-red-400" :
                    sev === "HIGH" ? "text-orange-400" :
                    sev === "MEDIUM" ? "text-yellow-400" : "text-zinc-400"
                  }`}>{count as number}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{sev}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.timeline && report.timeline.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Violation Timeline</h3>
            <div className="space-y-2">
              {report.timeline.map((v: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      v.severity === "CRITICAL" ? "bg-red-500" :
                      v.severity === "HIGH" ? "bg-orange-500" :
                      v.severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                    }`} />
                    {i < report.timeline.length - 1 && <div className="w-px h-4 bg-zinc-800" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-200">{getViolationTypeLabel(v.type)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        v.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                        v.severity === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                        v.severity === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-800 text-zinc-500"
                      }`}>{v.severity}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{v.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">{new Date(v.time).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {report.typeCounts && Object.keys(report.typeCounts).length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Violation Types</h3>
            <div className="space-y-2">
              {Object.entries(report.typeCounts).sort(([, a]: any, [, b]: any) => b - a).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-zinc-400 truncate">{getViolationTypeLabel(type)}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(report.typeCounts) as number[])) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-zinc-300 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colorMap[color] || "text-zinc-100"}`}>{value}</p>
    </div>
  );
}
