import { useCallback, useRef, useEffect } from "react";

interface UseScreenCaptureOptions {
  onViolation?: (type: string, message: string) => void;
}

export function useScreenCapture(options: UseScreenCaptureOptions = {}) {
  const { onViolation } = options;
  const enabledRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const captureScreenshot = useCallback((): string | null => {
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px monospace";
      ctx.fillText(`Screen: ${window.innerWidth}x${window.innerHeight}`, 10, 30);
      ctx.fillText(`URL: ${window.location.href}`, 10, 50);
      ctx.fillText(`Time: ${new Date().toISOString()}`, 10, 70);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
      if (!dataUrl || dataUrl.length < 500) return null;
      return dataUrl;
    } catch {
      return null;
    }
  }, []);

  const captureCameraFrame = useCallback((videoElement: HTMLVideoElement | null): string | null => {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) return null;
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(videoElement, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonEmpty = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 5 || imageData.data[i + 1] > 5 || imageData.data[i + 2] > 5) nonEmpty++;
      }
      if (nonEmpty === 0) return null;
      return canvas.toDataURL("image/jpeg", 0.6);
    } catch {
      return null;
    }
  }, []);

  const captureInitial = useCallback((videoElement: HTMLVideoElement | null): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!videoElement) {
        resolve(null);
        return;
      }
      let attempts = 0;
      const tryCapture = () => {
        attempts++;
        const result = captureCameraFrame(videoElement);
        if (result && result.length > 2000) {
          resolve(result);
          return;
        }
        if (attempts < 10) {
          setTimeout(tryCapture, 300);
        } else {
          resolve(null);
        }
      };
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
        tryCapture();
      } else {
        videoElement.onloadeddata = tryCapture;
        setTimeout(tryCapture, 2000);
      }
    });
  }, [captureCameraFrame]);

  useEffect(() => {
    if (!enabledRef.current) return;
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        onViolation?.("PRINT_SCREEN", "PrintScreen key pressed");
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onViolation]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    canvasRef.current = null;
  }, []);

  return {
    captureScreenshot,
    captureCameraFrame,
    captureInitial,
    enable,
    disable,
  };
}
