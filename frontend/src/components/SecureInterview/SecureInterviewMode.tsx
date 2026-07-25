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
import { useAudioMonitor } from "../../hooks/useAudioMonitor";
import { useZoomDetection } from "../../hooks/useZoomDetection";
import { useResizeDetection } from "../../hooks/useResizeDetection";
import { useScreenCapture } from "../../hooks/useScreenCapture";
import { useCameraStream } from "../../context/CameraContext";
import ProctoringContext from "../../context/ProctoringContext";
import CountdownOverlay from "./CountdownOverlay";
import TerminationScreen from "./TerminationScreen";
import InterviewGuard from "./InterviewGuard";
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

const API_BASE = import.meta.env.VITE_API_URL || "/api";

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
  const [candidatePhotoCaptured, setCandidatePhotoCaptured] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { setStream: setSharedStream } = useCameraStream();

  const violationHook = useViolation({
    maxViolations,
    strictMode,
    onTerminate: (reason) => handleTerminate(reason),
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
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const camera = useCamera({
    onViolation: (type, msg) => handleViolation(type, "HIGH", msg),
  });

  const faceDetection = useFaceDetection({
    stream: cameraStream,
    enabled: isReady,
    onViolation: (type, msg) => handleViolation(
      type,
      type === "MULTIPLE_FACES" || type === "IDENTITY_MISMATCH" ? "CRITICAL" :
      type === "NO_FACE" || type === "PERSON_LEFT" ? "HIGH" : "MEDIUM",
      msg
    ),
    onTerminate: (reason) => handleViolation("IDENTITY_MISMATCH", "CRITICAL", reason),
    onFaceCapture: async (imageData) => {
      if (socket && sessionId) {
        socket.emit("face-capture", { sessionId, imageData });
      }
    },
  });

  const objectDetection = useObjectDetection({
    stream: cameraStream,
    enabled: isReady,
    onViolation: (type, msg) => handleViolation(
      type,
      type === "PHONE_DETECTED" || type === "SECOND_PERSON" ? "CRITICAL" :
      type === "EARPHONE_DETECTED" || type === "SMARTWATCH_DETECTED" || type === "TABLET_DETECTED" ? "HIGH" : "MEDIUM",
      msg
    ),
    onTerminate: (reason) => handleTerminate(reason),
  });

  const audioMonitor = useAudioMonitor({
    onViolation: (type, msg) => handleViolation(
      type,
      type === "MIC_DISCONNECTED" ? "HIGH" : "MEDIUM",
      msg
    ),
  });

  const zoomDetection = useZoomDetection({
    onViolation: (type, msg) => handleViolation(type, "LOW", msg),
  });

  const resizeDetection = useResizeDetection({
    onViolation: (type, msg) => handleViolation(type, "LOW", msg),
  });

  const screenCapture = useScreenCapture({
    onViolation: (type, msg) => handleViolation(type, "LOW", msg),
  });

  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
    ]).catch(() => fallback);
  };

  const sendToBackend = useCallback(async (endpoint: string, data: any) => {
    try {
      await fetch(`${API_BASE}/proctoring/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  }, []);

  const captureCandidatePhoto = useCallback(async () => {
    if (!faceDetection.videoRef.current || !faceDetection.canvasRef.current) return;
    let attempts = 0;
    const maxAttempts = 10;

    const tryCapture = async (): Promise<string | null> => {
      return new Promise((resolve) => {
        const video = faceDetection.videoRef.current;
        const canvas = faceDetection.canvasRef.current;
        if (!video || !canvas) { resolve(null); return; }

        if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(() => tryCapture().then(resolve), 300);
          } else {
            resolve(null);
          }
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) { resolve(null); return; }

        try {
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let nonEmpty = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 10 || imageData.data[i + 1] > 10 || imageData.data[i + 2] > 10) nonEmpty++;
          }
          if (nonEmpty < 100) {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(() => tryCapture().then(resolve), 300);
            } else {
              resolve(null);
            }
            return;
          }
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        } catch {
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(() => tryCapture().then(resolve), 300);
          } else {
            resolve(null);
          }
        }
      });
    };

    const photo = await tryCapture();
    if (photo) {
      setPhotoPreview(photo);
      setCandidatePhotoCaptured(true);
      if (sessionId) {
        sendToBackend("photo", { sessionId, imageData: photo });
        if (socket) {
          socket.emit("face-capture", { sessionId, imageData: photo });
        }
      }
    }
  }, [faceDetection.videoRef, faceDetection.canvasRef, sessionId, socket, sendToBackend]);

  const captureEvidenceScreenshot = useCallback(async (violationType: string) => {
    const frame = faceDetection.captureSnapshot();
    if (frame && sessionId) {
      sendToBackend("snapshot", {
        sessionId,
        imageData: frame,
        trigger: `violation:${violationType}`,
      });
    }
    return frame || undefined;
  }, [faceDetection, sessionId, sendToBackend]);

  const emitViolation = useCallback((type: string, severity: ViolationSeverity, message: string, metadata?: any) => {
    if (socket && sessionId) {
      socket.emit("violation", { sessionId, type, severity, message, metadata });
    }
  }, [socket, sessionId]);

  const handleViolation = useCallback(async (type: string, severity: ViolationSeverity, message: string, metadata?: any) => {
    if (violationHook.isTerminated) return;

    const screenshot = await captureEvidenceScreenshot(type);

    violationHook.addViolation(type, severity, message, metadata, screenshot);
    emitViolation(type, severity, message, metadata);
    if (sessionId) {
      sendToBackend("violation", {
        sessionId, type, severity, message, metadata,
        screenshot,
      });
    }

    if (type === "PHONE_DETECTED" || type === "MULTIPLE_FACES" || type === "NO_FACE") {
      const frame = faceDetection.captureSnapshot();
      if (frame && sessionId) {
        sendToBackend("snapshot", {
          sessionId, imageData: frame, trigger: `violation:${type}`,
        });
      }
    }

    onViolation?.(type, severity, message);
  }, [violationHook, captureEvidenceScreenshot, emitViolation, sendToBackend, sessionId, faceDetection, onViolation]);

  const handleTerminate = useCallback((reason: string) => {
    if (socket && sessionId) {
      socket.emit("session-terminate", { sessionId, reason });
    }
    sendToBackend("snapshot", {
      sessionId, trigger: "termination",
      imageData: faceDetection.captureSnapshot() || "",
    });
    onTerminate?.(reason);
  }, [socket, sessionId, sendToBackend, faceDetection, onTerminate]);

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
    fullscreen.enable();

    setShowStartPrompt(false);
    tabFocus.enable();
    multiMonitor.enable();
    networkMonitor.enable();
    browserIntegrity.enable();
    screenCapture.enable();
    audioMonitor.enable();
    zoomDetection.enable();
    resizeDetection.enable();

    const [stream, s] = await Promise.all([
      withTimeout(camera.startCamera(), 10000, null),
      withTimeout(createSocketConnection(), 5000, null),
    ]);
    if (stream) {
      setCameraStream(stream);
      setSharedStream(stream);
    }
    if (s) {
      withTimeout(createProctoringSession(s), 5000, null);
    }

    withTimeout(audioMonitor.startMicrophone(), 10000, null);

    setIsReady(true);

    setTimeout(() => captureCandidatePhoto(), 1500);
  }, [
    fullscreen.enable, tabFocus.enable, multiMonitor.enable,
    networkMonitor.enable, browserIntegrity.enable, screenCapture.enable,
    audioMonitor.enable, zoomDetection.enable, resizeDetection.enable,
    camera.startCamera, setCameraStream, setSharedStream,
    audioMonitor.startMicrophone, captureCandidatePhoto,
    createSocketConnection, createProctoringSession,
  ]);

  useEffect(() => {
    return () => {
      setSharedStream(null);
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (enabled && !isReady && showStartPrompt) {
      startSecureSession();
    }
  }, [enabled, isReady, showStartPrompt, startSecureSession]);

  if (!enabled) return <>{children}</>;

  if (!isReady) {
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
        integrityScore={Math.max(0, 100 - violationHook.cheatingProbability)}
        onDismiss={() => {
          fullscreen.disable();
          tabFocus.disable();
          camera.stopCamera();
          audioMonitor.stopMicrophone();
          setSharedStream(null);
          if (socket) socket.disconnect();
          navigate("/dashboard", { replace: true });
        }}
      />
    );
  }

  return (
    <ProctoringContext.Provider
      value={{
        isFullscreen: fullscreen.isFullscreen,
        isCameraActive: camera.isCameraActive,
        isMicActive: audioMonitor.isMicActive,
        isOnline: networkMonitor.isOnline,
        violationCount: violationHook.violationCount,
        maxViolations,
        criticalCount: violationHook.criticalCount,
        highCount: violationHook.highCount,
        latestViolations: violationHook.latestViolations,
        timeElapsed,
        suspicionScore: violationHook.cheatingProbability,
        eyeGazeScore: faceDetection.eyeGazeScore,
        headPoseScore: faceDetection.headPoseScore,
      }}
    >
    <div id={fullscreen.FULLSCREEN_ELEMENT_ID} className="min-h-screen bg-zinc-950">
      {!fullscreen.isFullscreen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 flex items-center gap-4 shadow-xl backdrop-blur-sm w-[90%] max-w-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Fullscreen required</p>
            <p className="text-xs text-zinc-400">You have exited fullscreen mode.</p>
          </div>
          <button
            onClick={() => fullscreen.reEnterFullscreen()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Return to Fullscreen
          </button>
        </div>
      )}
      {children}

      <CountdownOverlay
        show={tabFocus.showCountdown}
        countdown={tabFocus.countdown}
        message="You have switched away from the interview window."
        onReturn={() => window.focus()}
      />

      <canvas ref={faceDetection.canvasRef} className="hidden" />
      <canvas ref={objectDetection.canvasRef} className="hidden" />
    </div>
    </ProctoringContext.Provider>
  );
}
