import { createContext, useContext } from "react";
import type { ViolationEvent } from "../hooks/useViolation";

interface ProctoringContextValue {
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
}

const ProctoringContext = createContext<ProctoringContextValue | null>(null);

export function useProctoring() {
  return useContext(ProctoringContext);
}

export default ProctoringContext;
