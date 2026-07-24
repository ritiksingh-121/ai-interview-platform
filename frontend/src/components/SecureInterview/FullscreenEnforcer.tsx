import { useState, useEffect } from "react";
import Button from "../ui/Button";

interface FullscreenEnforcerProps {
  onFullscreen: () => void;
  isFullscreen: boolean;
}

export default function FullscreenEnforcer({ onFullscreen, isFullscreen }: FullscreenEnforcerProps) {
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    if (isFullscreen) setShowPrompt(false);
  }, [isFullscreen]);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Enter Fullscreen Mode</h2>
          <p className="text-sm text-zinc-400">
            This interview requires fullscreen mode to maintain a secure testing environment.
            Please click the button below to continue.
          </p>
        </div>

        <ul className="text-left text-xs text-zinc-500 space-y-1.5 bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
            Fullscreen prevents tab switching and other distractions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
            Exiting fullscreen will be logged as a violation
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
            After 3 exits, the interview will be terminated
          </li>
        </ul>

        <Button
          variant="gradient"
          size="lg"
          onClick={onFullscreen}
          className="w-full justify-center"
        >
          Enter Fullscreen & Start Interview
        </Button>
      </div>
    </div>
  );
}
