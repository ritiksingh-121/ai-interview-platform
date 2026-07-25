import { useState, useRef, useCallback, useEffect } from "react";

export interface FaceData {
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
  mesh?: Array<{ x: number; y: number; z: number }>;
}

interface UseFaceDetectionOptions {
  stream: MediaStream | null;
  enabled?: boolean;
  interval?: number;
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
  onFaceCapture?: (imageData: string) => void;
}

export function useFaceDetection(options: UseFaceDetectionOptions) {
  const { stream, enabled = false, interval: detectionInterval = 1500, onViolation, onTerminate, onFaceCapture } = options;

  const [faces, setFaces] = useState<FaceData[]>([]);
  const [faceCount, setFaceCount] = useState(0);
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  const [lookingAway, setLookingAway] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [headTurned, setHeadTurned] = useState(false);
  const [faceCovered, setFaceCovered] = useState(false);
  const [lowLighting, setLowLighting] = useState(false);
  const [faceTooFar, setFaceTooFar] = useState(false);
  const [faceTooClose, setFaceTooClose] = useState(false);
  const [gazeDirection, setGazeDirection] = useState<"center" | "left" | "right" | "up" | "down">("center");
  const [headPose, setHeadPose] = useState<"forward" | "left" | "right" | "down">("forward");
  const [eyeGazeScore, setEyeGazeScore] = useState(100);
  const [headPoseScore, setHeadPoseScore] = useState(100);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const enabledRef = useRef(enabled);
  const noFaceCountRef = useRef(0);
  const multipleFaceCountRef = useRef(0);
  const personLeftRef = useRef(false);
  const noFaceTimerRef = useRef<ReturnType<typeof setInterval>>();
  const detectionTimerRef = useRef<ReturnType<typeof setInterval>>();
  const lastGazeRef = useRef<"center" | "left" | "right" | "up" | "down">("center");
  const gazeAwayDurationRef = useRef(0);
  const previousFrameRef = useRef<ImageData | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const worker = new Worker(
        new URL("../workers/proctoringWorker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === "brightness-result" && e.data.data.isLow && !lowLighting) {
          setLowLighting(true);
          onViolation?.("LOW_LIGHT", "Low lighting detected in camera feed");
        }
        if (e.data.type === "frame-result") {
          if (e.data.data.isFrozen) {
            onViolation?.("CAMERA_FREEZE", "Camera appears to be frozen or covered");
          }
        }
      };
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !stream) return;
    if (!videoRef.current) {
      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      videoRef.current = video;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => {});

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const noFaceCheck = setInterval(() => {
      if (!enabledRef.current || !video || !ctx || !canvas) return;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "brightness-check",
          data: { imageData },
        });
        workerRef.current.postMessage({
          type: "frame-analyze",
          data: { imageData, width: canvas.width, height: canvas.height },
        });
      }

      let nonBlackPixels = 0;
      const len = imageData.data.length;
      for (let i = 0; i < len; i += 4) {
        if (imageData.data[i] > 10 || imageData.data[i + 1] > 10 || imageData.data[i + 2] > 10) {
          nonBlackPixels++;
        }
      }
      const coverage = nonBlackPixels / (canvas.width * canvas.height);
      if (coverage < 0.05) {
        noFaceCountRef.current++;
        if (noFaceCountRef.current >= 3) {
          setIsFaceVisible(false);
          onViolation?.("NO_FACE", "No face detected in camera");
          if (noFaceCountRef.current >= 6 && !personLeftRef.current) {
            personLeftRef.current = true;
            onViolation?.("PERSON_LEFT", "Person appears to have left the seat");
          }
        }
      } else {
        noFaceCountRef.current = 0;
        if (personLeftRef.current) {
          personLeftRef.current = false;
          setIsFaceVisible(true);
        }
      }

      if (previousFrameRef.current) {
        let changedPixels = 0;
        const prev = previousFrameRef.current.data;
        const curr = imageData.data;
        for (let i = 0; i < curr.length; i += 4) {
          const diff = Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2]);
          if (diff > 30) changedPixels++;
        }
        const motionRatio = changedPixels / (canvas.width * canvas.height);
        if (motionRatio < 0.002 && coverage > 0.05) {
          noFaceCountRef.current += 2;
          onViolation?.("CAMERA_FREEZE", "Camera appears frozen - no motion detected");
        }
      }
      previousFrameRef.current = imageData;
    }, 2000);

    noFaceTimerRef.current = noFaceCheck;

    return () => {
      clearInterval(noFaceCheck);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [enabled, stream, onViolation]);

  const trackGaze = useCallback((x: number, y: number, z: number) => {
    if (!enabledRef.current) return;
    const threshold = 0.15;
    let gaze: "center" | "left" | "right" | "up" | "down" = "center";
    if (x < -threshold) gaze = "left";
    else if (x > threshold) gaze = "right";
    if (y < -threshold) gaze = "up";
    else if (y > threshold) gaze = "down";
    setGazeDirection(gaze);

    if (gaze !== "center") {
      gazeAwayDurationRef.current += detectionInterval;
      if (gazeAwayDurationRef.current >= 3000) {
        onViolation?.("EYE_GAZE_AWAY", `Looking ${gaze} from screen for ${(gazeAwayDurationRef.current / 1000).toFixed(0)}s`);
        gazeAwayDurationRef.current = 0;
      }
    } else {
      gazeAwayDurationRef.current = 0;
    }
    lastGazeRef.current = gaze;

    let score = 100;
    if (gaze === "left" || gaze === "right") score -= 30;
    if (gaze === "up" || gaze === "down") score -= 20;
    setEyeGazeScore(Math.max(0, score));
  }, [detectionInterval, onViolation]);

  const trackHeadPose = useCallback((yaw: number, pitch: number) => {
    if (!enabledRef.current) return;
    let pose: "forward" | "left" | "right" | "down" = "forward";
    if (yaw < -0.3) pose = "left";
    else if (yaw > 0.3) pose = "right";
    else if (pitch > 0.3) pose = "down";
    setHeadPose(pose);

    if (pose !== "forward") {
      onViolation?.("HEAD_POSE_SUSPICIOUS", `Head turned ${pose} (yaw: ${yaw.toFixed(2)}, pitch: ${pitch.toFixed(2)})`);
    }

    let score = 100;
    if (yaw < -0.3 || yaw > 0.3) score -= 25;
    if (pitch > 0.3) score -= 20;
    setHeadPoseScore(Math.max(0, score));
  }, [onViolation]);

  const registerFace = useCallback((descriptor: Float32Array, imageData: string) => {
    onFaceCapture?.(imageData);
  }, [onFaceCapture]);

  const compareFace = useCallback((_descriptor: Float32Array): number => {
    return 100;
  }, []);

  const simulateFaceDetection = useCallback((detected: boolean, count: number) => {
    if (!enabledRef.current) return;
    setFaceCount(count);
    if (count === 0 && !personLeftRef.current) {
      setIsFaceVisible(false);
      noFaceCountRef.current++;
      if (noFaceCountRef.current >= 3) {
        onViolation?.("NO_FACE", "No face detected in camera");
        if (noFaceCountRef.current >= 6) {
          personLeftRef.current = true;
          onViolation?.("PERSON_LEFT", "Person appears to have left the seat");
        }
      }
    } else if (count === 0 && personLeftRef.current) {
      onViolation?.("PERSON_LEFT", "Person has left the seat");
    } else {
      setIsFaceVisible(true);
      noFaceCountRef.current = 0;
    }
    if (count > 1) {
      multipleFaceCountRef.current++;
      onViolation?.("MULTIPLE_FACES", `${count} faces detected in camera`);
      if (multipleFaceCountRef.current >= 3) {
        onTerminate?.("Multiple faces detected persistently");
      }
    } else {
      multipleFaceCountRef.current = 0;
    }
  }, [onViolation, onTerminate]);

  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonEmpty = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0 || imageData.data[i + 1] > 0 || imageData.data[i + 2] > 0) nonEmpty++;
    }
    if (nonEmpty === 0) return null;
    return canvas.toDataURL("image/jpeg", 0.6);
  }, []);

  return {
    faces, faceCount, isFaceVisible, lookingAway, eyesClosed,
    headTurned, faceCovered, lowLighting, faceTooFar, faceTooClose,
    gazeDirection, headPose, eyeGazeScore, headPoseScore,
    modelLoaded, modelLoading,
    canvasRef, videoRef,
    registerFace, compareFace, captureSnapshot,
    trackGaze, trackHeadPose,
    simulateFaceDetection,
  };
}
