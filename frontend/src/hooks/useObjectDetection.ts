import { useState, useRef, useCallback, useEffect } from "react";

export interface DetectedObject {
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  classId?: number;
}

interface UseObjectDetectionOptions {
  stream: MediaStream | null;
  enabled?: boolean;
  interval?: number;
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

const SUSPICIOUS_OBJECTS = [
  "cell phone", "mobile phone", "phone", "smartphone",
  "laptop", "notebook", "tablet",
  "book", "booklet", "magazine", "newspaper", "paper", "document",
  "headphones", "earphone", "headset",
  "tv", "television", "monitor",
  "remote", "remote control",
  "bottle", "cup", "glass",
  "food",
];

const DANGEROUS_OBJECTS = [
  "cell phone", "mobile phone", "phone", "smartphone",
  "tablet", "ipad",
];

export function useObjectDetection(options: UseObjectDetectionOptions) {
  const {
    stream,
    enabled = false,
    interval = 2000,
    onViolation,
    onTerminate,
  } = options;

  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [suspiciousObjects, setSuspiciousObjects] = useState<DetectedObject[]>([]);
  const [dangerousObjects, setDangerousObjects] = useState<DetectedObject[]>([]);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [secondPersonDetected, setSecondPersonDetected] = useState(false);
  const [bookDetected, setBookDetected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const enabledRef = useRef(enabled);
  const phoneWarningCountRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const simulateDetection = useCallback((objects: DetectedObject[]) => {
    if (!enabledRef.current) return;

    setDetectedObjects(objects);

    const suspicious = objects.filter((obj) =>
      SUSPICIOUS_OBJECTS.some((s) => obj.label.toLowerCase().includes(s))
    );
    setSuspiciousObjects(suspicious);

    const dangerous = objects.filter((obj) =>
      DANGEROUS_OBJECTS.some((d) => obj.label.toLowerCase().includes(d))
    );
    setDangerousObjects(dangerous);

    const phone = objects.some((obj) =>
      ["cell phone", "mobile phone", "phone", "smartphone"].includes(obj.label.toLowerCase())
    );
    if (phone && !phoneDetected) {
      setPhoneDetected(true);
      phoneWarningCountRef.current++;
      onViolation?.("PHONE_DETECTED", "Mobile phone detected in camera frame");
      if (phoneWarningCountRef.current >= 3) {
        onTerminate?.("Mobile phone detected persistently");
      }
    }

    const personCount = objects.filter((obj) =>
      obj.label.toLowerCase().includes("person")
    ).length;
    if (personCount >= 2 && !secondPersonDetected) {
      setSecondPersonDetected(true);
      onViolation?.("SECOND_PERSON", "Second person detected in frame");
      setTimeout(() => {
        if (enabledRef.current) {
          onTerminate?.("Multiple people detected in interview area");
        }
      }, 5000);
    }

    const book = objects.some((obj) =>
      ["book", "booklet", "magazine", "newspaper", "paper", "document"].includes(obj.label.toLowerCase())
    );
    if (book && !bookDetected) {
      setBookDetected(true);
      onViolation?.("BOOK_DETECTED", "Book or paper detected in camera frame");
    }
  }, [phoneDetected, secondPersonDetected, bookDetected, onViolation, onTerminate]);

  const captureFrame = useCallback((): string | null => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL("image/jpeg", 0.4);
  }, []);

  const reset = useCallback(() => {
    setDetectedObjects([]);
    setSuspiciousObjects([]);
    setDangerousObjects([]);
    setPhoneDetected(false);
    setSecondPersonDetected(false);
    setBookDetected(false);
    phoneWarningCountRef.current = 0;
  }, []);

  return {
    detectedObjects,
    suspiciousObjects,
    dangerousObjects,
    phoneDetected,
    secondPersonDetected,
    bookDetected,
    canvasRef,
    simulateDetection,
    captureFrame,
    reset,
  };
}
