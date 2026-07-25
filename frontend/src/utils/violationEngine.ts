import type { ViolationSeverity, ViolationType, ViolationEvent } from "../hooks/useViolation";

export const SEVERITY_ORDER: ViolationSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const VIOLATION_WEIGHTS: Record<ViolationSeverity, number> = {
  LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 15,
};

export const VIOLATION_SCORES: Record<string, number> = {
  PHONE_DETECTED: 10,
  MULTIPLE_FACES: 8,
  FULLSCREEN_EXIT: 4,
  DEVELOPER_TOOLS: 8,
  TAB_SWITCH: 5,
  MIC_DISCONNECTED: 6,
  CAMERA_DISCONNECTED: 7,
  IDENTITY_MISMATCH: 10,
  AUTOMATION_DETECTED: 10,
  CAMERA_BLOCKED: 6,
  SECOND_PERSON: 8,
  BOOK_DETECTED: 5,
  COPY_PASTE: 4,
  CONSOLE_OPEN: 7,
  DEBUGGER_PAUSE: 7,
  NO_FACE: 4,
  PERSON_LEFT: 6,
  EYE_GAZE_AWAY: 3,
  HEAD_POSE_SUSPICIOUS: 3,
  CAMERA_FREEZE: 5,
  PRINT_SCREEN: 3,
  NETWORK_OFFLINE: 3,
  LOW_LIGHT: 2,
  EARPHONE_DETECTED: 6,
  SMARTWATCH_DETECTED: 4,
  UNKNOWN_OBJECT: 3,
  TABLET_DETECTED: 6,
  SECOND_VOICE: 6,
  BACKGROUND_SPEECH: 3,
  AUDIO_NOISE: 2,
  VIEWPORT_ZOOM: 3,
  VIEWPORT_RESIZE: 2,
  MIC_MUTED: 3,
  CONTEXT_MENU: 2,
  DRAG_DROP: 1,
  KEYBOARD_SHORTCUT: 3,
};

export const CRITICAL_VIOLATIONS: ViolationType[] = [
  "PHONE_DETECTED", "MULTIPLE_FACES", "IDENTITY_MISMATCH",
  "AUTOMATION_DETECTED", "HEADLESS_BROWSER", "DEVELOPER_TOOLS",
  "CONSOLE_OPEN",
];

export const HIGH_VIOLATIONS: ViolationType[] = [
  "FULLSCREEN_EXIT", "TAB_SWITCH", "CAMERA_DISCONNECTED",
  "CAMERA_BLOCKED", "SECOND_VOICE", "SECOND_PERSON",
  "COPY_PASTE", "SCREEN_RECORDING", "EARPHONE_DETECTED",
  "BOOK_DETECTED", "SMARTWATCH_DETECTED", "TABLET_DETECTED",
];

export function calculateIntegrityScore(violations: ViolationEvent[]): number {
  const totalScore = violations.reduce((sum, v) => {
    return sum + (VIOLATION_SCORES[v.type] || VIOLATION_WEIGHTS[v.severity] || 1);
  }, 0);
  const maxPossible = Math.max(violations.length * 10, 1);
  const cheatingProb = Math.min(100, Math.round((totalScore / maxPossible) * 100));
  return Math.max(0, 100 - cheatingProb);
}

export function calculateCheatingProbability(violations: ViolationEvent[]): number {
  const totalScore = violations.reduce((sum, v) => {
    return sum + (VIOLATION_SCORES[v.type] || VIOLATION_WEIGHTS[v.severity] || 1);
  }, 0);
  const maxPossible = Math.max(violations.length * 10, 1);
  return Math.min(100, Math.round((totalScore / maxPossible) * 100));
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
    HEAD_POSE_SUSPICIOUS: "Suspicious Head Pose",
    PERSON_LEFT: "Person Left",
    PHONE_DETECTED: "Phone Detected",
    TABLET_DETECTED: "Tablet Detected",
    BOOK_DETECTED: "Book/Paper Detected",
    SECOND_PERSON: "Second Person",
    HAND_COVERING_CAMERA: "Hand Covering Camera",
    LOW_LIGHTING: "Low Lighting",
    LOW_LIGHT: "Low Light",
    CAMERA_BLOCKED: "Camera Blocked",
    CAMERA_DISCONNECTED: "Camera Disconnected",
    CAMERA_FREEZE: "Camera Frozen",
    IDENTITY_MISMATCH: "Identity Mismatch",
    SECOND_VOICE: "Second Voice",
    BACKGROUND_SPEECH: "Background Speech",
    DEVELOPER_TOOLS: "Developer Tools",
    VIEWPORT_RESIZE: "Viewport Resize",
    VIEWPORT_ZOOM: "Browser Zoom",
    CONSOLE_OPEN: "Console Open",
    DEBUGGER_PAUSE: "Debugger Pause",
    NETWORK_OFFLINE: "Network Offline",
    NETWORK_LATENCY: "Network Latency",
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
    MIC_DISCONNECTED: "Mic Disconnected",
    MIC_MUTED: "Mic Silent",
    AUDIO_NOISE: "Background Noise",
    EYE_GAZE_AWAY: "Eye Gaze Away",
    PRINT_SCREEN: "Print Screen",
    TEXT_SELECTION: "Text Selection",
    DRAG_DROP: "Drag & Drop",
    CONTEXT_MENU: "Context Menu",
    UNKNOWN_OBJECT: "Unknown Object",
    EARPHONE_DETECTED: "Earphone/Headphones",
    SMARTWATCH_DETECTED: "Smart Watch",
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

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-red-400";
  if (score >= 5) return "text-orange-400";
  if (score >= 3) return "text-yellow-400";
  return "text-zinc-400";
}

export function determineSeverity(type: ViolationType): ViolationSeverity {
  if (CRITICAL_VIOLATIONS.includes(type)) return "CRITICAL";
  if (HIGH_VIOLATIONS.includes(type)) return "HIGH";
  return "MEDIUM";
}
