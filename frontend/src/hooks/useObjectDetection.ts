import { useState, useRef, useCallback, useEffect } from "react";

export interface DetectedObject {
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}

interface UseObjectDetectionOptions {
  stream: MediaStream | null;
  enabled?: boolean;
  interval?: number;
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

const SUSPICIOUS_LABELS: Record<string, string> = {
  "cell phone": "PHONE_DETECTED",
  "mobile phone": "PHONE_DETECTED",
  phone: "PHONE_DETECTED",
  smartphone: "PHONE_DETECTED",
  laptop: "LAPTOP_DETECTED",
  notebook: "LAPTOP_DETECTED",
  tablet: "TABLET_DETECTED",
  ipad: "TABLET_DETECTED",
  book: "BOOK_DETECTED",
  booklet: "BOOK_DETECTED",
  magazine: "BOOK_DETECTED",
  newspaper: "BOOK_DETECTED",
  paper: "BOOK_DETECTED",
  document: "BOOK_DETECTED",
  headphones: "EARPHONE_DETECTED",
  earphone: "EARPHONE_DETECTED",
  headset: "EARPHONE_DETECTED",
  "tv": "MONITOR_DETECTED",
  television: "MONITOR_DETECTED",
  monitor: "MONITOR_DETECTED",
  "remote": "REMOTE_DETECTED",
  "remote control": "REMOTE_DETECTED",
  person: "SECOND_PERSON",
  "cell phone, smartphone": "PHONE_DETECTED",
  "smart watch": "SMARTWATCH_DETECTED",
  watch: "SMARTWATCH_DETECTED",
};

const DANGEROUS_LABELS = ["cell phone", "mobile phone", "phone", "smartphone", "tablet", "ipad"];

export function useObjectDetection(options: UseObjectDetectionOptions) {
  const { stream, enabled = false, interval = 3000, onViolation, onTerminate } = options;

  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [suspiciousObjects, setSuspiciousObjects] = useState<DetectedObject[]>([]);
  const [dangerousObjects, setDangerousObjects] = useState<DetectedObject[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const phoneDetectedRef = useRef(false);
  const secondPersonDetectedRef = useRef(false);
  const bookDetectedRef = useRef(false);
  const earphoneDetectedRef = useRef(false);
  const smartwatchDetectedRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<any>(null);
  const enabledRef = useRef(enabled);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const phoneWarningCountRef = useRef(0);
  const detectionCountRef = useRef(0);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;
  const onTerminateRef = useRef(onTerminate);
  onTerminateRef.current = onTerminate;

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const loadModel = useCallback(async () => {
    if (modelRef.current) return;
    setModelLoading(true);
    setModelError(null);
    try {
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      const model = await cocoSsd.load();
      modelRef.current = model;
      setModelLoaded(true);
    } catch (err: any) {
      setModelError(err.message || "Failed to load detection model");
    } finally {
      setModelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !stream) return;
    loadModel();
    if (!videoRef.current) {
      const video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      videoRef.current = video;
    }
    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => {});
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [enabled, stream, loadModel]);

  useEffect(() => {
    if (!enabled || !modelLoaded || !stream || !videoRef.current) return;
    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;

    const detect = async () => {
      if (!enabledRef.current || !modelRef.current || !video || !video.videoWidth) return;
      try {
        const predictions = await modelRef.current.detect(video);
        detectionCountRef.current++;
        const objects: DetectedObject[] = predictions.map((p: any) => ({
          label: p.class,
          confidence: p.score,
          box: { x: p.bbox[0], y: p.bbox[1], width: p.bbox[2], height: p.bbox[3] },
        }));
        setDetectedObjects(objects);
        const suspicious = objects.filter((o) => {
          const key = Object.keys(SUSPICIOUS_LABELS).find((k) =>
            o.label.toLowerCase().includes(k)
          );
          return !!key;
        });
        setSuspiciousObjects(suspicious);
        const dangerous = objects.filter((o) =>
          DANGEROUS_LABELS.some((d) => o.label.toLowerCase().includes(d))
        );
        setDangerousObjects(dangerous);

        for (const obj of suspicious) {
          const vioType = Object.keys(SUSPICIOUS_LABELS).find((k) =>
            obj.label.toLowerCase().includes(k)
          );
          if (!vioType) continue;
          const evType = SUSPICIOUS_LABELS[vioType];
          if (evType === "PHONE_DETECTED" && !phoneDetectedRef.current) {
            phoneDetectedRef.current = true;
            phoneWarningCountRef.current++;
            onViolationRef.current?.("PHONE_DETECTED", `Mobile phone detected (confidence: ${(obj.confidence * 100).toFixed(0)}%)`);
            if (phoneWarningCountRef.current >= 3) {
              onTerminateRef.current?.("Mobile phone detected persistently");
            }
          } else if (evType === "EARPHONE_DETECTED" && !earphoneDetectedRef.current) {
            earphoneDetectedRef.current = true;
            onViolationRef.current?.("EARPHONE_DETECTED", `Earphone/headphones detected (confidence: ${(obj.confidence * 100).toFixed(0)}%)`);
          } else if (evType === "SMARTWATCH_DETECTED" && !smartwatchDetectedRef.current) {
            smartwatchDetectedRef.current = true;
            onViolationRef.current?.("SMARTWATCH_DETECTED", `Smart watch detected (confidence: ${(obj.confidence * 100).toFixed(0)}%)`);
          }
        }
        const personCount = objects.filter((o) =>
          o.label.toLowerCase().includes("person")
        ).length;
        if (personCount >= 2 && !secondPersonDetectedRef.current) {
          secondPersonDetectedRef.current = true;
          onViolationRef.current?.("SECOND_PERSON", "Second person detected in camera frame");
          setTimeout(() => {
            if (enabledRef.current) {
              onTerminateRef.current?.("Multiple people detected in interview area");
            }
          }, 5000);
        }
        const bookFound = objects.some((o) =>
          ["book", "booklet", "magazine", "newspaper", "paper", "document"].includes(o.label.toLowerCase())
        );
        if (bookFound && !bookDetectedRef.current) {
          bookDetectedRef.current = true;
          onViolationRef.current?.("BOOK_DETECTED", "Book or paper detected in camera frame");
        }
      } catch (err) {
        if (enabledRef.current) {
          console.error("Object detection error:", err);
        }
      }
    };

    const runDetection = async () => {
      await detect();
      intervalRef.current = setInterval(detect, interval);
    };
    const timer = setTimeout(() => {
      if (video.readyState >= 2) runDetection();
      else {
        const readyCheck = setInterval(() => {
          if (video.readyState >= 2) {
            clearInterval(readyCheck);
            runDetection();
          }
        }, 500);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, modelLoaded, stream, interval]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    if (!dataUrl || dataUrl.length < 1000) return null;
    return dataUrl;
  }, []);

  return {
    detectedObjects, suspiciousObjects, dangerousObjects,
    phoneDetected: phoneDetectedRef.current,
    secondPersonDetected: secondPersonDetectedRef.current,
    bookDetected: bookDetectedRef.current,
    earphoneDetected: earphoneDetectedRef.current,
    smartwatchDetected: smartwatchDetectedRef.current,
    modelLoaded, modelLoading, modelError,
    canvasRef,
    captureFrame,
  };
}
