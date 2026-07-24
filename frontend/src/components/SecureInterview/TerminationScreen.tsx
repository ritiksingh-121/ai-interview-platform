import { motion } from "framer-motion";
import Button from "../ui/Button";

interface TerminationScreenProps {
  reason: string;
  violationCount: number;
  integrityScore?: number;
  onDismiss: () => void;
}

export default function TerminationScreen({
  reason,
  violationCount,
  integrityScore,
  onDismiss,
}: TerminationScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg w-full bg-zinc-900 border border-red-900/50 rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 p-8 text-center border-b border-red-900/30">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Terminated</h2>
          <p className="text-red-400/80 text-sm">{reason}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950/50 rounded-xl p-4 text-center border border-zinc-800">
              <p className="text-2xl font-bold text-red-400">{violationCount}</p>
              <p className="text-xs text-zinc-500 mt-1">Total Violations</p>
            </div>
            {integrityScore !== undefined && (
              <div className="bg-zinc-950/50 rounded-xl p-4 text-center border border-zinc-800">
                <p className={`text-2xl font-bold ${integrityScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {integrityScore}%
                </p>
                <p className="text-xs text-zinc-500 mt-1">Integrity Score</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Security Summary</p>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                Repeated security violations detected
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                Interview environment compromised
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                Proctoring session has been closed
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onDismiss}
            className="w-full justify-center"
          >
            Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
