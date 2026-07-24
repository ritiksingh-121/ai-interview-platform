import { useState, useRef, useCallback, useEffect } from "react";

export interface FaceData {
  detection: any;
  landmarks?: any;
  descriptor?: Float32Array;
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
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
  const {
    stream,
    enabled = false,
    interval = 1000,
    onViolation,
    onTerminate,
    onFaceCapture,
  } = options;

  const [faces, setFaces] = useState<FaceData[]>([]);
  const [faceCount, setFaceCount] = useState(0);
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [lookingAway, setLookingAway] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [headTurned, setHeadTurned] = useState(false);
  const [faceCovered, setFaceCovered] = useState(false);
  const [lowLighting, setLowLighting] = useState(false);
  const [faceTooFar, setFaceTooFar] = useState(false);
  const [faceTooClose, setFaceTooClose] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number>();
  const enabledRef = useRef(enabled);
  const registeredDescriptorRef = useRef<Float32Array | null>(null);
  const noFaceCountRef = useRef(0);
  const multipleFaceCountRef = useRef(0);
  const personLeftRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.warn("[FaceDetection:captureSnapshot] video or canvas ref is null");
      return null;
    }

    const debug = (label: string, val: any) => console.debug(`[FaceDetection:captureSnapshot] ${label}:`, val);

    debug("video.readyState", video.readyState);
    debug("video.videoWidth x video.videoHeight", `${video.videoWidth} x ${video.videoHeight}`);
    debug("video.paused", video.paused);
    debug("video.ended", video.ended);

    if (video.readyState < 2) {
      console.warn("[FaceDetection:captureSnapshot] Video not ready (readyState < HAVE_CURRENT_DATA). Cannot capture.");
      return null;
    }

    if (!video.videoWidth || !video.videoHeight) {
      console.warn("[FaceDetection:captureSnapshot] Video dimensions are zero. Video stream may not have produced a frame yet.");
      return null;
    }

    const track = stream?.getVideoTracks()[0];
    if (track) {
      debug("track.readyState", track.readyState);
      debug("track settings", track.getSettings());
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    debug("canvas.width x canvas.height", `${canvas.width} x ${canvas.height}`);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      console.warn("[FaceDetection:captureSnapshot] Could not get 2D context");
      return null;
    }

    ctx.drawImage(video, 0, 0);

    if (canvas.width > 0 && canvas.height > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonEmptyPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0 || imageData.data[i + 1] > 0 || imageData.data[i + 2] > 0) {
          nonEmptyPixels++;
        }
      }
      debug("non-empty pixels", nonEmptyPixels);
      debug("total pixels", canvas.width * canvas.height);
      if (nonEmptyPixels === 0) {
        console.warn("[FaceDetection:captureSnapshot] Captured frame is completely blank/black!");
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
    debug("dataUrl length", dataUrl.length);
    return dataUrl;
  }, [stream]);

  const checkBrightness = useCallback((imageData: ImageData): boolean => {
    let total = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      total += imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114;
    }
    const avg = total / (imageData.width * imageData.height);
    return avg < 40;
  }, []);

  const processFrame = useCallback(async () => {
    if (!enabledRef.current || !stream || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dark = checkBrightness(imageData);
    if (dark && !lowLighting) {
      setLowLighting(true);
      onViolation?.("LOW_LIGHTING", "Low lighting detected in camera feed");
    } else if (!dark && lowLighting) {
      setLowLighting(false);
    }

    animationRef.current = requestAnimationFrame(processFrame);
  }, [stream, lowLighting, checkBrightness, onViolation]);

  useEffect(() => {
    if (!enabled || !stream) return;

    if (!videoRef.current) {
      const video = document.createElement("video");
      video.srcObject = stream;
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

    const checkCamBlocked = setInterval(() => {
      if (video.readyState >= 2 && video.videoWidth === 0) {
        onViolation?.("CAMERA_BLOCKED", "Camera appears blocked or disconnected");
      }
    }, 3000);

    const noFaceTimer = setInterval(() => {
      if (video.readyState >= 2 && video.videoWidth > 0 && !video.paused && !video.ended) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let totalPixels = 0;
          for (let i = 0; i < data.data.length; i += 4) {
            if (data.data[i] > 0 || data.data[i + 1] > 0 || data.data[i + 2] > 0) totalPixels++;
          }
          const coverage = totalPixels / (canvas.width * canvas.height);
          if (coverage < 0.05) {
            noFaceCountRef.current++;
            if (noFaceCountRef.current > 5) {
              onViolation?.("CAMERA_BLOCKED", "Camera appears to be covered or blocked");
            }
          } else {
            noFaceCountRef.current = 0;
          }
        }
      }
    }, 5000);

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      clearInterval(checkCamBlocked);
      clearInterval(noFaceTimer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [enabled, stream, processFrame, onViolation]);

  const registerFace = useCallback((descriptor: Float32Array, imageData: string) => {
    registeredDescriptorRef.current = descriptor;
    setFaceDescriptor(descriptor);
    onFaceCapture?.(imageData);
  }, [onFaceCapture]);

  const compareFace = useCallback((descriptor: Float32Array): number => {
    if (!registeredDescriptorRef.current) return 100;
    let distance = 0;
    for (let i = 0; i < Math.min(descriptor.length, registeredDescriptorRef.current.length); i++) {
      distance += Math.abs(descriptor[i] - registeredDescriptorRef.current[i]);
    }
    const maxDistance = 2 * Math.min(descriptor.length, registeredDescriptorRef.current.length);
    const similarity = Math.max(0, 100 - (distance / maxDistance) * 100);
    if (similarity < 40) {
      onViolation?.("IDENTITY_MISMATCH", "Face identity mismatch detected");
      onTerminate?.("Identity mismatch - different person detected");
    }
    return similarity;
  }, [onViolation, onTerminate]);

  const simulateFaceDetection = useCallback((detected: boolean, count: number) => {
    if (!enabledRef.current) return;
    setFaceCount(count);
    setFaces([]);
    if (count === 0 && !personLeftRef.current) {
      setIsFaceVisible(false);
      noFaceCountRef.current++;
      if (noFaceCountRef.current >= 3) {
        onViolation?.("NO_FACE", "No face detected in camera");
        if (onTerminate) {
          personLeftRef.current = true;
          onViolation?.("PERSON_LEFT", "Person appears to have left the seat");
        }
      }
    } else if (count === 0 && personLeftRef.current) {
      onViolation?.("PERSON_LEFT", "Person has left the seat");
    } else {
      setIsFaceVisible(true);
      noFaceCountRef.current = 0;
      personLeftRef.current = false;
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

  const simulateLookingAway = useCallback((state: boolean) => {
    if (!enabledRef.current) return;
    setLookingAway(state);
    if (state) onViolation?.("LOOKING_AWAY", "Candidate looking away from screen");
  }, [onViolation]);

  const simulateEyesClosed = useCallback((state: boolean) => {
    if (!enabledRef.current) return;
    setEyesClosed(state);
    if (state) onViolation?.("EYES_CLOSED", "Eyes closed detected");
  }, [onViolation]);

  const simulateHeadTurned = useCallback((state: boolean) => {
    if (!enabledRef.current) return;
    setHeadTurned(state);
    if (state) onViolation?.("HEAD_TURNED", "Head turned away from camera");
  }, [onViolation]);

  const simulateFaceCovered = useCallback((state: boolean) => {
    if (!enabledRef.current) return;
    setFaceCovered(state);
    if (state) onViolation?.("FACE_COVERED", "Face appears to be covered");
  }, [onViolation]);

  return {
    faces,
    faceCount,
    isFaceVisible,
    faceDescriptor,
    lookingAway,
    eyesClosed,
    headTurned,
    faceCovered,
    lowLighting,
    faceTooFar,
    faceTooClose,
    canvasRef,
    videoRef,
    registerFace,
    compareFace,
    captureSnapshot,
    simulateFaceDetection,
    simulateLookingAway,
    simulateEyesClosed,
    simulateHeadTurned,
    simulateFaceCovered,
  };
}
