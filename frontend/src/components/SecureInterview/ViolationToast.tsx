import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViolationEvent } from "../../hooks/useViolation";
import { getViolationTypeLabel, getSeverityColor } from "../../utils/violationEngine";

interface ViolationToastProps {
  violations: ViolationEvent[];
}

export default function ViolationToast({ violations }: ViolationToastProps) {
  const [visible, setVisible] = useState<ViolationEvent | null>(null);

  useEffect(() => {
    if (violations.length === 0) return;
    const latest = violations[violations.length - 1];
    if (latest.id !== visible?.id) {
      setVisible(latest);
      const timer = setTimeout(() => setVisible(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [violations, visible?.id]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`max-w-sm rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              visible.severity === "CRITICAL"
                ? "bg-red-900/90 border-red-700"
                : visible.severity === "HIGH"
                ? "bg-orange-900/90 border-orange-700"
                : "bg-zinc-900/90 border-zinc-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                visible.severity === "CRITICAL" ? "bg-red-400 animate-pulse" :
                visible.severity === "HIGH" ? "bg-orange-400" : "bg-yellow-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-100">
                  {getViolationTypeLabel(visible.type)}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{visible.message}</p>
              </div>
              <button
                onClick={() => setVisible(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-600">
              <span>{new Date(visible.timestamp).toLocaleTimeString()}</span>
              <span className="uppercase font-medium">{visible.severity}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
