import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  show: boolean;
  countdown: number;
  message?: string;
  onReturn?: () => void;
}

export default function CountdownOverlay({ show, countdown, message, onReturn }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-sm w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center space-y-6"
          >
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(39 39 42)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(244 63 94)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(countdown / 5) * 283} 283`}
                  initial={{ strokeDasharray: "283 283" }}
                  animate={{ strokeDasharray: `${(countdown / 5) * 283} 283` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-white"
                >
                  {countdown}
                </motion.span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Focus Lost</h3>
              <p className="text-sm text-zinc-400">
                {message || "You have switched away from the interview window."}
              </p>
              <p className="text-xs text-red-400 font-medium">
                Return within {countdown} seconds or the interview will be terminated.
              </p>
            </div>

            {onReturn && (
              <button
                onClick={onReturn}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Return to Interview
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
