import { useState, useCallback, useRef } from "react";

export type ViolationSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ViolationType = string;

export interface ViolationEvent {
  id: string;
  type: ViolationType;
  severity: ViolationSeverity;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ViolationConfig {
  maxViolations: number;
  strictMode: "EASY" | "MEDIUM" | "STRICT";
  onTerminate?: (reason: string) => void;
}

const SEVERITY_WEIGHTS: Record<ViolationSeverity, number> = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 7,
  CRITICAL: 15,
};

const STRICT_TERMINATION_TYPES: ViolationType[] = [
  "PHONE_DETECTED",
  "MULTIPLE_FACES",
  "FULLSCREEN_EXIT",
  "TAB_SWITCH",
  "CAMERA_BLOCKED",
  "CAMERA_DISCONNECTED",
  "IDENTITY_MISMATCH",
  "DEVELOPER_TOOLS",
  "CONSOLE_OPEN",
  "DEBUGGER_PAUSE",
  "AUTOMATION_DETECTED",
  "HEADLESS_BROWSER",
];

let violationIdCounter = 0;

export function useViolation(config: ViolationConfig) {
  const { maxViolations = 10, strictMode = "MEDIUM", onTerminate } = config;
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [weightedScore, setWeightedScore] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const violationsRef = useRef<ViolationEvent[]>([]);
  const terminatedRef = useRef(false);

  const addViolation = useCallback((
    type: ViolationType,
    severity: ViolationSeverity,
    message: string,
    metadata?: Record<string, any>
  ) => {
    if (terminatedRef.current) return;

    const id = `v_${Date.now()}_${++violationIdCounter}`;
    const event: ViolationEvent = {
      id,
      type,
      severity,
      message,
      timestamp: Date.now(),
      metadata,
    };

    violationsRef.current = [...violationsRef.current, event];
    setViolations(violationsRef.current);

    const newScore = violationsRef.current.reduce(
      (sum, v) => sum + (SEVERITY_WEIGHTS[v.severity] || 0),
      0
    );
    setWeightedScore(newScore);

    if (strictMode === "STRICT" && STRICT_TERMINATION_TYPES.includes(type)) {
      terminatedRef.current = true;
      setIsTerminated(true);
      const reason = `STRICT: ${message}`;
      setTerminationReason(reason);
      onTerminate?.(reason);
      return;
    }

    if (strictMode !== "EASY" && violationsRef.current.length >= maxViolations) {
      terminatedRef.current = true;
      setIsTerminated(true);
      const reason = `Violation limit exceeded (${maxViolations})`;
      setTerminationReason(reason);
      onTerminate?.(reason);
    }
  }, [maxViolations, strictMode, onTerminate]);

  const addViolations = useCallback((
    events: Array<{ type: ViolationType; severity: ViolationSeverity; message: string; metadata?: Record<string, any> }>
  ) => {
    events.forEach((e) => addViolation(e.type, e.severity, e.message, e.metadata));
  }, [addViolation]);

  const clearViolations = useCallback(() => {
    violationsRef.current = [];
    setViolations([]);
    setWeightedScore(0);
  }, []);

  const reset = useCallback(() => {
    violationsRef.current = [];
    terminatedRef.current = false;
    setViolations([]);
    setWeightedScore(0);
    setIsTerminated(false);
    setTerminationReason(null);
  }, []);

  const latestViolations = violations.slice(-5);
  const criticalCount = violations.filter((v) => v.severity === "CRITICAL").length;
  const highCount = violations.filter((v) => v.severity === "HIGH").length;

  return {
    violations,
    latestViolations,
    weightedScore,
    isTerminated,
    terminationReason,
    violationCount: violations.length,
    criticalCount,
    highCount,
    addViolation,
    addViolations,
    clearViolations,
    reset,
  };
}
