import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFullscreen } from "../../hooks/useFullscreen";
import { useTabFocus } from "../../hooks/useTabFocus";
import { useViolation, ViolationSeverity } from "../../hooks/useViolation";
import { useKeyboardRestriction } from "../../hooks/useKeyboardRestriction";
import { useMultiMonitor } from "../../hooks/useMultiMonitor";
import { useNetworkMonitor } from "../../hooks/useNetworkMonitor";
import { useBrowserIntegrity } from "../../hooks/useBrowserIntegrity";
import { useCamera } from "../../hooks/useCamera";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { useObjectDetection } from "../../hooks/useObjectDetection";
import { useAudio } from "../../hooks/useAudio";
import { useAIAssistance } from "../../hooks/useAIAssistance";
import { useScreenCapture } from "../../hooks/useScreenCapture";
import { useCameraStream } from "../../context/CameraContext";
import FullscreenEnforcer from "./FullscreenEnforcer";
import CountdownOverlay from "./CountdownOverlay";
import TerminationScreen from "./TerminationScreen";
import InterviewGuard from "./InterviewGuard";
import ViolationToast from "./ViolationToast";

export type StrictMode = "EASY" | "MEDIUM" | "STRICT";

interface SecureInterviewModeProps {
  enabled: boolean;
  strictMode?: StrictMode;
  maxViolations?: number;
  tabSwitchLimit?: number;
  fullscreenExitLimit?: number;
  gracePeriod?: number;
  onTerminate?: (reason: string) => void;
  onViolation?: (type: string, severity: ViolationSeverity, message: string) => void;
  children?: React.ReactNode;
  timeElapsed?: number;
  onSessionReady?: (sessionId: string) => void;
  interviewId?: string;
  userId?: string;
}

export default function SecureInterviewMode({
  enabled,
  strictMode = "MEDIUM",
  maxViolations = 10,
  tabSwitchLimit = 3,
  fullscreenExitLimit = 3,
  gracePeriod = 5,
  onTerminate,
  onViolation,
  children,
  timeElapsed = 0,
  onSessionReady,
  interviewId,
  userId,
}: SecureInterviewModeProps) {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { setStream: setSharedStream } = useCameraStream();

  const violationHook = useViolation({
    maxViolations,
    strictMode,
    onTerminate: (reason) => {
      handleTerminate(reason);
    },
  });

  const fullscreen = useFullscreen({
    maxExits: fullscreenExitLimit,
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const tabFocus = useTabFocus({
    gracePeriod,
    maxSwitches: tabSwitchLimit,
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const keyboardRestriction = useKeyboardRestriction({
    enabled: isReady,
    onViolation: (type, msg) => handleViolation(type, "MEDIUM", msg),
  });

  const multiMonitor = useMultiMonitor({
    onViolation: (type, msg) => handleViolation(type, "MEDIUM", msg),
  });

  const networkMonitor = useNetworkMonitor({
    onViolation: (type, msg) => handleViolation(type, "LOW", msg),
  });

  const browserIntegrity = useBrowserIntegrity({
    onViolation: (type, msg) => handleViolation(type, "CRITICAL", msg),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const camera = useCamera({
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
  });

  const faceDetection = useFaceDetection({
    stream: cameraStream,
    enabled: isReady,
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
    onTerminate: (reason) => handleViolation("IDENTITY_MISMATCH", "CRITICAL", reason),
  });

  const objectDetection = useObjectDetection({
    stream: cameraStream,
    enabled: isReady,
    onViolation: (type, msg) => handleViolation(type, "CRITICAL", msg),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const audio = useAudio({
    onViolation: (type, msg) => handleViolation(type, "MEDIUM", msg),
  });

  const aiAssistance = useAIAssistance({
    onViolation: (type, msg) => handleViolation(type, "MEDIUM", msg),
  });

  const screenCapture = useScreenCapture({
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
  });

  const emitViolation = useCallback((type: string, severity: ViolationSeverity, message: string, metadata?: any) => {
    if (socket && sessionId) {
      socket.emit("violation", { sessionId, type, severity, message, metadata });
    }
  }, [socket, sessionId]);

  const handleViolation = useCallback((type: string, severity: ViolationSeverity, message: string, metadata?: any) => {
    if (violationHook.isTerminated) return;
    violationHook.addViolation(type, severity, message, metadata);
    emitViolation(type, severity, message, metadata);
    onViolation?.(type, severity, message);
  }, [violationHook, emitViolation, onViolation]);

  const handleTerminate = useCallback((reason: string) => {
    if (socket && sessionId) {
      socket.emit("session-terminate", { sessionId, reason });
    }
    onTerminate?.(reason);
  }, [socket, sessionId, onTerminate]);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  const createSocketConnection = useCallback(async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const { io } = await import("socket.io-client");
      const s = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
      });
      setSocket(s);
      return s;
    } catch {
      return null;
    }
  }, []);

  const createProctoringSession = useCallback(async (s: any) => {
    if (!userId) return null;
    try {
      const res = await fetch(`${API_BASE}/proctoring/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(interviewId ? { interviewId } : {}),
          userId,
          strictMode,
          maxViolations,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
        s.emit("join-session", data.session.id);
        onSessionReady?.(data.session.id);
        return data.session.id;
      }
    } catch (err) {
      console.error("Failed to create proctoring session:", err);
    }
    return null;
  }, [interviewId, userId, strictMode, maxViolations, onSessionReady]);

  const startSecureSession = useCallback(async () => {
    await fullscreen.enable();

    setShowStartPrompt(false);
    tabFocus.enable();
    multiMonitor.enable();
    networkMonitor.enable();
    browserIntegrity.enable();
    screenCapture.enable();
    audio.enable();
    aiAssistance.enable();

    const s = await createSocketConnection();
    if (s) {
      await createProctoringSession(s);
    }

    const stream = await camera.startCamera();
    if (stream) {
      setCameraStream(stream);
      setSharedStream(stream);
    }

    await audio.startMicrophone();

    setIsReady(true);
  }, [
    fullscreen.enable,
    tabFocus.enable,
    multiMonitor.enable,
    networkMonitor.enable,
    browserIntegrity.enable,
    screenCapture.enable,
    audio.enable,
    audio.startMicrophone,
    aiAssistance.enable,
    createSocketConnection,
    createProctoringSession,
    camera.startCamera,
    setCameraStream,
    setSharedStream,
  ]);

  useEffect(() => {
    return () => setSharedStream(null);
  }, []);

  if (!enabled) return <>{children}</>;

  if (!isReady) {
    if (showStartPrompt) {
      return (
        <FullscreenEnforcer
          onFullscreen={startSecureSession}
          isFullscreen={fullscreen.isFullscreen}
        />
      );
    }
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Initializing secure environment...</p>
        </div>
      </div>
    );
  }

  if (violationHook.isTerminated) {
    return (
      <TerminationScreen
        reason={violationHook.terminationReason || "Interview terminated"}
        violationCount={violationHook.violationCount}
        onDismiss={() => {
          fullscreen.disable();
          tabFocus.disable();
          camera.stopCamera();
          audio.stopMicrophone();
          setSharedStream(null);
          navigate("/dashboard", { replace: true });
        }}
      />
    );
  }

  return (
    <div id={fullscreen.FULLSCREEN_ELEMENT_ID} className="min-h-screen bg-zinc-950">
      {children}

      <InterviewGuard
        isFullscreen={fullscreen.isFullscreen}
        isCameraActive={camera.isCameraActive}
        isMicActive={audio.isMicActive}
        isOnline={networkMonitor.isOnline}
        violationCount={violationHook.violationCount}
        maxViolations={maxViolations}
        criticalCount={violationHook.criticalCount}
        highCount={violationHook.highCount}
        latestViolations={violationHook.latestViolations}
        timeElapsed={timeElapsed}
        suspicionScore={aiAssistance.suspicionScore}
      />

      <ViolationToast violations={violationHook.latestViolations} />

      <CountdownOverlay
        show={tabFocus.showCountdown}
        countdown={tabFocus.countdown}
        message="You have switched away from the interview window."
        onReturn={() => window.focus()}
      />

      {!fullscreen.isFullscreen && fullscreen.exitCount > 0 && (
        <div className="fixed bottom-4 left-4 z-[9990]">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-xs text-red-400 backdrop-blur-xl">
            Fullscreen required - click anywhere to return
          </div>
        </div>
      )}

      <canvas ref={faceDetection.canvasRef} className="hidden" />
      <canvas ref={objectDetection.canvasRef} className="hidden" />
    </div>
  );
}
