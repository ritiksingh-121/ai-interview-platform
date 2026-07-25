import { useState, useCallback, useRef } from "react";

export type ViolationSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ViolationType = string;

export interface ViolationEvent {
  id: string;
  type: ViolationType;
  severity: ViolationSeverity;
  message: string;
  timestamp: number;
  screenshot?: string;
  faceImage?: string;
  metadata?: Record<string, any>;
}

export interface ViolationConfig {
  maxViolations: number;
  strictMode: "EASY" | "MEDIUM" | "STRICT";
  onTerminate?: (reason: string) => void;
}

const SEVERITY_WEIGHTS: Record<ViolationSeverity, number> = {
  LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 15,
};

const STRICT_TERMINATION_TYPES: ViolationType[] = [
  "PHONE_DETECTED", "MULTIPLE_FACES", "FULLSCREEN_EXIT",
  "TAB_SWITCH", "CAMERA_BLOCKED", "CAMERA_DISCONNECTED",
  "IDENTITY_MISMATCH", "DEVELOPER_TOOLS", "CONSOLE_OPEN",
  "DEBUGGER_PAUSE", "AUTOMATION_DETECTED", "HEADLESS_BROWSER",
];

const VIOLATION_SCORES: Record<string, number> = {
  PHONE_DETECTED: 10, MULTIPLE_FACES: 8, FULLSCREEN_EXIT: 4,
  DEVELOPER_TOOLS: 8, TAB_SWITCH: 5, MIC_DISCONNECTED: 6,
  CAMERA_DISCONNECTED: 7, IDENTITY_MISMATCH: 10, AUTOMATION_DETECTED: 10,
  CAMERA_BLOCKED: 6, SECOND_PERSON: 8, BOOK_DETECTED: 5,
  COPY_PASTE: 4, CONSOLE_OPEN: 7, DEBUGGER_PAUSE: 7,
  NO_FACE: 4, PERSON_LEFT: 6, EYE_GAZE_AWAY: 3,
  HEAD_POSE_SUSPICIOUS: 3, CAMERA_FREEZE: 5, PRINT_SCREEN: 3,
  NETWORK_OFFLINE: 3, LOW_LIGHT: 2, EARPHONE_DETECTED: 6,
  SMARTWATCH_DETECTED: 4, UNKNOWN_OBJECT: 3, TABLET_DETECTED: 6,
  SECOND_VOICE: 6, BACKGROUND_SPEECH: 3, AUDIO_NOISE: 2,
  VIEWPORT_ZOOM: 3, VIEWPORT_RESIZE: 2, MIC_MUTED: 3,
  CONTEXT_MENU: 2, DRAG_DROP: 1, KEYBOARD_SHORTCUT: 3,
};

let violationIdCounter = 0;

export function useViolation(config: ViolationConfig) {
  const { maxViolations = 10, strictMode = "MEDIUM", onTerminate } = config;
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [weightedScore, setWeightedScore] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const [cheatingProbability, setCheatingProbability] = useState(0);
  const violationsRef = useRef<ViolationEvent[]>([]);
  const terminatedRef = useRef(false);

  const updateScore = useCallback((events: ViolationEvent[]) => {
    const totalScore = events.reduce((sum, v) => {
      return sum + (VIOLATION_SCORES[v.type] || SEVERITY_WEIGHTS[v.severity] || 1);
    }, 0);
    setWeightedScore(totalScore);
    const maxPossible = Math.max(events.length * 10, 1);
    setCheatingProbability(Math.min(100, Math.round((totalScore / maxPossible) * 100)));
  }, []);

  const addViolation = useCallback((
    type: ViolationType,
    severity: ViolationSeverity,
    message: string,
    metadata?: Record<string, any>,
    screenshot?: string,
    faceImage?: string,
  ) => {
    if (terminatedRef.current) return;

    const id = `v_${Date.now()}_${++violationIdCounter}`;
    const event: ViolationEvent = {
      id, type, severity, message,
      timestamp: Date.now(),
      screenshot, faceImage, metadata,
    };

    violationsRef.current = [...violationsRef.current, event];
    setViolations(violationsRef.current);
    updateScore(violationsRef.current);

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
  }, [maxViolations, strictMode, onTerminate, updateScore]);

  const addViolations = useCallback((
    events: Array<{
      type: ViolationType; severity: ViolationSeverity; message: string;
      metadata?: Record<string, any>; screenshot?: string; faceImage?: string;
    }>
  ) => {
    events.forEach((e) => addViolation(e.type, e.severity, e.message, e.metadata, e.screenshot, e.faceImage));
  }, [addViolation]);

  const clearViolations = useCallback(() => {
    violationsRef.current = [];
    setViolations([]);
    setWeightedScore(0);
    setCheatingProbability(0);
  }, []);

  const reset = useCallback(() => {
    violationsRef.current = [];
    terminatedRef.current = false;
    setViolations([]);
    setWeightedScore(0);
    setCheatingProbability(0);
    setIsTerminated(false);
    setTerminationReason(null);
  }, []);

  const latestViolations = violations;
  const criticalCount = violations.filter((v) => v.severity === "CRITICAL").length;
  const highCount = violations.filter((v) => v.severity === "HIGH").length;

  return {
    violations, latestViolations, weightedScore, isTerminated,
    terminationReason, violationCount: violations.length,
    criticalCount, highCount, cheatingProbability,
    addViolation, addViolations, clearViolations, reset,
  };
}
