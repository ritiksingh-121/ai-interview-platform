import { motion, AnimatePresence } from "framer-motion";
import { ViolationEvent } from "../../hooks/useViolation";
import { getSeverityColor, getViolationTypeLabel } from "../../utils/violationEngine";

interface InterviewGuardProps {
  isFullscreen: boolean;
  isCameraActive: boolean;
  isMicActive: boolean;
  isOnline: boolean;
  violationCount: number;
  maxViolations: number;
  criticalCount: number;
  highCount: number;
  latestViolations: ViolationEvent[];
  timeElapsed: number;
  suspicionScore?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewGuard({
  isFullscreen,
  isCameraActive,
  isMicActive,
  isOnline,
  violationCount,
  maxViolations,
  criticalCount,
  highCount,
  latestViolations,
  timeElapsed,
  suspicionScore,
}: InterviewGuardProps) {
  const remaining = maxViolations - violationCount;
  const isWarning = remaining <= 3;

  return (
    <div className="fixed top-4 right-4 z-[9990] w-72 pointer-events-none">
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="pointer-events-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
      >
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Interview Guard</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isWarning ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>
            {remaining}/{maxViolations}
          </span>
        </div>

        <div className="px-4 py-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <StatusItem
              label="Fullscreen"
              status={isFullscreen ? "active" : "inactive"}
              icon={
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              }
            />
            <StatusItem
              label="Camera"
              status={isCameraActive ? "active" : "inactive"}
              icon={
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatusItem
              label="Mic"
              status={isMicActive ? "active" : "inactive"}
              icon={
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
            />
            <StatusItem
              label="Network"
              status={isOnline ? "active" : "inactive"}
              icon={
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                </svg>
              }
            />
          </div>

          {suspicionScore !== undefined && suspicionScore > 0 && (
            <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-3 py-2 border border-zinc-800">
              <span className="text-[10px] font-medium text-zinc-500 uppercase">Suspicion</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    suspicionScore > 60 ? "bg-red-500" : suspicionScore > 30 ? "bg-yellow-500" : "bg-zinc-600"
                  }`}
                  style={{ width: `${suspicionScore}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-400">{suspicionScore}%</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>{formatTime(timeElapsed)}</span>
            <span className="flex items-center gap-1">
              {criticalCount > 0 && <span className="text-red-400">{criticalCount}C</span>}
              {highCount > 0 && <span className="text-orange-400">{highCount}H</span>}
              <span className={`${isWarning ? "text-red-400" : "text-zinc-500"}`}>{violationCount}V</span>
            </span>
          </div>

          {isWarning && violationCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-red-400 font-medium">
                {remaining === 0 ? "Termination imminent" : `${remaining} violation${remaining !== 1 ? "s" : ""} remaining before termination`}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {latestViolations.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              className="border-t border-zinc-800"
            >
              <div className="px-4 py-2 space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                {latestViolations.slice(-3).map((v) => (
                  <div key={v.id} className="flex items-start gap-2 py-1">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                      v.severity === "CRITICAL" ? "bg-red-500" :
                      v.severity === "HIGH" ? "bg-orange-500" :
                      v.severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-300 truncate">{getViolationTypeLabel(v.type)}</p>
                      <p className="text-[9px] text-zinc-600">{new Date(v.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StatusItem({ label, status, icon }: { label: string; status: "active" | "inactive"; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-2.5 py-2 border border-zinc-800">
      <span className={status === "active" ? "text-emerald-400" : "text-red-400"}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-zinc-500">{label}</p>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className={`text-[9px] font-medium ${status === "active" ? "text-emerald-400" : "text-red-400"}`}>
            {status === "active" ? "OK" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
