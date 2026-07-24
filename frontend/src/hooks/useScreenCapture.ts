import { useState, useCallback, useRef, useEffect } from "react";

interface UseScreenCaptureOptions {
  onViolation?: (type: string, message: string) => void;
}

export function useScreenCapture(options: UseScreenCaptureOptions = {}) {
  const { onViolation } = options;
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDisplayCaptureActive, setIsDisplayCaptureActive] = useState(false);
  const enabledRef = useRef(false);

  const checkScreenRecording = useCallback(async () => {
    if (!enabledRef.current) return;
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia?.({ video: true });
      if (stream) {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        onViolation?.("SCREEN_RECORDING", "Screen recording/display capture detected");
      }
    } catch {}
  }, [onViolation]);

  useEffect(() => {
    if (!enabledRef.current) return;
    const interval = setInterval(checkScreenRecording, 10000);
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        onViolation?.("SCREENSHOT", "PrintScreen key pressed");
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [checkScreenRecording, onViolation]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  return {
    isCapturing,
    isDisplayCaptureActive,
    enable,
    disable,
  };
}
