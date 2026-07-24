import { useState, useEffect, useCallback, useRef } from "react";

const FULLSCREEN_ELEMENT_ID = "secure-interview-root";

interface UseFullscreenOptions {
  maxExits?: number;
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

export function useFullscreen(options: UseFullscreenOptions = {}) {
  const { maxExits = 3, onViolation, onTerminate } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const exitCountRef = useRef(0);
  const enabledRef = useRef(false);

  const checkFullscreen = useCallback(() => {
    const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    setIsFullscreen(fs);
    return fs;
  }, []);

  const requestFullscreen = useCallback(async () => {
    try {
      const el = document.getElementById(FULLSCREEN_ELEMENT_ID) || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return;

    const handleChange = () => {
      const fs = checkFullscreen();
      if (!fs && enabledRef.current) {
        exitCountRef.current += 1;
        setExitCount(exitCountRef.current);
        onViolation?.("FULLSCREEN_EXIT", `Fullscreen exited (${exitCountRef.current}/${maxExits})`);
        if (exitCountRef.current >= maxExits) {
          onTerminate?.("Exceeded maximum fullscreen exits");
        }
      }
    };

    const handleError = () => {
      onViolation?.("FULLSCREEN_ERROR", "Fullscreen request denied");
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("fullscreenerror", handleError);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("fullscreenerror", handleError);
    };
  }, [checkFullscreen, maxExits, onViolation, onTerminate, requestFullscreen]);

  const enable = useCallback(async () => {
    enabledRef.current = true;
    await requestFullscreen();
  }, [requestFullscreen]);

  const disable = useCallback(() => {
    enabledRef.current = false;
    exitFullscreen();
  }, [exitFullscreen]);

  const reset = useCallback(() => {
    exitCountRef.current = 0;
    setExitCount(0);
  }, []);

  const needsFullscreen = exitCountRef.current > 0 && exitCountRef.current < maxExits;

  return {
    isFullscreen,
    exitCount,
    needsFullscreen,
    requestFullscreen,
    exitFullscreen,
    enable,
    disable,
    reset,
    FULLSCREEN_ELEMENT_ID,
  };
}
