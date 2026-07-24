import { ViolationSeverity, ViolationType, ViolationEvent } from "../hooks/useViolation";

export const SEVERITY_ORDER: ViolationSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const VIOLATION_WEIGHTS: Record<ViolationSeverity, number> = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 7,
  CRITICAL: 15,
};

export const CRITICAL_VIOLATIONS: ViolationType[] = [
  "PHONE_DETECTED",
  "MULTIPLE_FACES",
  "IDENTITY_MISMATCH",
  "AUTOMATION_DETECTED",
  "HEADLESS_BROWSER",
  "DEVELOPER_TOOLS",
  "CONSOLE_OPEN",
];

export const HIGH_VIOLATIONS: ViolationType[] = [
  "FULLSCREEN_EXIT",
  "TAB_SWITCH",
  "CAMERA_DISCONNECTED",
  "CAMERA_BLOCKED",
  "SECOND_VOICE",
  "SECOND_PERSON",
  "COPY_PASTE",
  "SCREEN_RECORDING",
];

export function calculateIntegrityScore(violations: ViolationEvent[]): number {
  const weightedSum = violations.reduce(
    (sum, v) => sum + (VIOLATION_WEIGHTS[v.severity] || 0),
    0
  );
  const maxScore = violations.length * 15;
  const cheatingProbability = Math.min(100, Math.round((weightedSum / Math.max(maxScore, 1)) * 100));
  return Math.max(0, 100 - cheatingProbability);
}

export function calculateCheatingProbability(violations: ViolationEvent[]): number {
  const weightedSum = violations.reduce(
    (sum, v) => sum + (VIOLATION_WEIGHTS[v.severity] || 0),
    0
  );
  const maxPossible = Math.max(violations.length, 1) * 15;
  return Math.min(100, Math.round((weightedSum / maxPossible) * 100));
}

export function getRecommendation(integrityScore: number): "PASS" | "REVIEW" | "REJECT" {
  if (integrityScore >= 80) return "PASS";
  if (integrityScore >= 50) return "REVIEW";
  return "REJECT";
}

export function getViolationTypeLabel(type: ViolationType): string {
  const labels: Record<string, string> = {
    FULLSCREEN_EXIT: "Fullscreen Exit",
    TAB_SWITCH: "Tab Switch",
    WINDOW_BLUR: "Window Blur",
    KEYBOARD_SHORTCUT: "Keyboard Shortcut",
    MULTI_MONITOR: "Multiple Monitors",
    NO_FACE: "No Face Detected",
    MULTIPLE_FACES: "Multiple Faces",
    FACE_COVERED: "Face Covered",
    LOOKING_AWAY: "Looking Away",
    EYES_CLOSED: "Eyes Closed",
    HEAD_TURNED: "Head Turned",
    PERSON_LEFT: "Person Left",
    PHONE_DETECTED: "Phone Detected",
    TABLET_DETECTED: "Tablet Detected",
    BOOK_DETECTED: "Book/Paper Detected",
    SECOND_PERSON: "Second Person",
    HAND_COVERING_CAMERA: "Hand Covering Camera",
    LOW_LIGHTING: "Low Lighting",
    CAMERA_BLOCKED: "Camera Blocked",
    CAMERA_DISCONNECTED: "Camera Disconnected",
    IDENTITY_MISMATCH: "Identity Mismatch",
    SECOND_VOICE: "Second Voice",
    BACKGROUND_SPEECH: "Background Speech",
    DEVELOPER_TOOLS: "Developer Tools",
    VIEWPORT_RESIZE: "Viewport Resize",
    CONSOLE_OPEN: "Console Open",
    DEBUGGER_PAUSE: "Debugger Pause",
    NETWORK_OFFLINE: "Network Offline",
    VPN_DETECTED: "VPN Detected",
    COPY_PASTE: "Copy/Paste",
    SCREENSHOT: "Screenshot",
    SCREEN_RECORDING: "Screen Recording",
    AI_ASSISTANCE_SUSPICION: "AI Assistance Suspicion",
    SUSPICIOUS_EYE_MOVEMENT: "Suspicious Eye Movement",
    FREQUENT_SIDE_READING: "Frequent Side Reading",
    RAPID_GAZE_SWITCHING: "Rapid Gaze Switching",
    AUTOMATION_DETECTED: "Automation Detected",
    HEADLESS_BROWSER: "Headless Browser",
    EMULATOR_DETECTED: "Emulator Detected",
  };
  return labels[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSeverityColor(severity: ViolationSeverity): string {
  switch (severity) {
    case "LOW": return "bg-zinc-500/20 text-zinc-400 border-zinc-700";
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-700";
    case "HIGH": return "bg-orange-500/20 text-orange-400 border-orange-700";
    case "CRITICAL": return "bg-red-500/20 text-red-400 border-red-700";
  }
}

export function determineSeverity(type: ViolationType): ViolationSeverity {
  if (CRITICAL_VIOLATIONS.includes(type)) return "CRITICAL";
  if (HIGH_VIOLATIONS.includes(type)) return "HIGH";
  return "MEDIUM";
}
