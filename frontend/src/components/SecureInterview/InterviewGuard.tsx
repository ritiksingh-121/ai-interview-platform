import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViolationEvent } from "../../hooks/useViolation";
import { getViolationTypeLabel, getScoreColor, VIOLATION_SCORES } from "../../utils/violationEngine";

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
  eyeGazeScore?: number;
  headPoseScore?: number;
  inline?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export default function InterviewGuard({
  isFullscreen, isCameraActive, isMicActive, isOnline,
  violationCount, maxViolations, criticalCount, highCount,
  latestViolations, timeElapsed, suspicionScore,
  eyeGazeScore, headPoseScore, inline,
}: InterviewGuardProps) {
  const remaining = maxViolations - violationCount;
  const isWarning = remaining <= 3;
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  }, [latestViolations]);

  const displayViolations = showFullTimeline ? latestViolations : latestViolations.slice(0, 5);

  return (
    <div className={inline ? "w-full" : "fixed top-4 right-4 z-[9990] w-72 pointer-events-none"}>
      <motion.div
        initial={inline ? false : { x: 320, opacity: 0 }}
        animate={inline ? {} : { x: 0, opacity: 1 }}
        className={`${inline ? "bg-zinc-900/95 border border-zinc-800 rounded-2xl overflow-hidden" : "pointer-events-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"}`}
      >
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isFullscreen && isCameraActive && isMicActive ? "bg-emerald-400" : "bg-red-400"} ${isFullscreen ? "animate-pulse" : ""}`} />
              Proctoring Guard
            </span>
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isWarning ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>
            {remaining}/{maxViolations}
          </span>
        </div>

        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>{formatTime(timeElapsed)}</span>
            <span className="flex items-center gap-1.5">
              {criticalCount > 0 && <span className="text-red-400 font-bold">{criticalCount}C</span>}
              {highCount > 0 && <span className="text-orange-400 font-bold">{highCount}H</span>}
              <span className={`${isWarning ? "text-red-400" : "text-zinc-500"}`}>{violationCount}V</span>
            </span>
          </div>

          {suspicionScore !== undefined && suspicionScore > 0 && (
            <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-3 py-2 border border-zinc-800">
              <span className="text-[10px] font-medium text-zinc-500 uppercase">Risk</span>
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

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${isFullscreen ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              <span className={`w-1 h-1 rounded-full ${isFullscreen ? "bg-emerald-400" : "bg-red-400"}`} />
              Fullscreen
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${isCameraActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              <span className={`w-1 h-1 rounded-full ${isCameraActive ? "bg-emerald-400" : "bg-red-400"}`} />
              Camera
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${isMicActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              <span className={`w-1 h-1 rounded-full ${isMicActive ? "bg-emerald-400" : "bg-red-400"}`} />
              Mic
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${isOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              <span className={`w-1 h-1 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
              Network
            </div>
          </div>

          {eyeGazeScore !== undefined && eyeGazeScore < 100 && (
            <div className="text-[9px] text-zinc-500 flex justify-between">
              <span>Eye Gaze</span>
              <span className={eyeGazeScore < 50 ? "text-red-400" : "text-yellow-400"}>{eyeGazeScore}%</span>
            </div>
          )}

          {isWarning && violationCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-[10px] text-red-400 font-medium">
                {remaining === 0
                  ? "Termination imminent"
                  : `${remaining} violation${remaining !== 1 ? "s" : ""} remaining`
                }
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
              <div className="px-3 py-2 border-b border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Violation Timeline</span>
                {latestViolations.length > 5 && (
                  <button
                    onClick={() => setShowFullTimeline(!showFullTimeline)}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300"
                  >
                    {showFullTimeline ? "Show Less" : `View All (${latestViolations.length})`}
                  </button>
                )}
              </div>
              <div
                ref={timelineRef}
                className={`px-3 py-1 space-y-0.5 overflow-y-auto no-scrollbar ${showFullTimeline ? "max-h-60" : "max-h-32"}`}
              >
                {displayViolations.map((v) => {
                  const score = VIOLATION_SCORES[v.type] || 0;
                  return (
                    <div key={v.id} className="flex items-start gap-2 py-1 group hover:bg-zinc-800/30 rounded px-1 -mx-1 transition-colors">
                      <span className="text-[9px] font-mono text-zinc-600 w-8 shrink-0 pt-0.5">
                        {formatTimestamp(v.timestamp)}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                        v.severity === "CRITICAL" ? "bg-red-500" :
                        v.severity === "HIGH" ? "bg-orange-500" :
                        v.severity === "MEDIUM" ? "bg-yellow-500" : "bg-zinc-500"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-zinc-300 truncate">{getViolationTypeLabel(v.type)}</p>
                        {showFullTimeline && (
                          <p className="text-[8px] text-zinc-600 truncate">{v.message}</p>
                        )}
                      </div>
                      {score > 0 && (
                        <span className={`text-[9px] font-bold font-mono ${getScoreColor(score)} shrink-0`}>
                          +{score}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: "active" | "inactive" }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-950/50 rounded-lg px-2.5 py-2 border border-zinc-800">
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
