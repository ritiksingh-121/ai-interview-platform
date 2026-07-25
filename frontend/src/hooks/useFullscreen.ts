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
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const reEnteringRef = useRef(false);

  const checkFullscreen = useCallback(() => {
    const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
    setIsFullscreen(fs);
    return fs;
  }, []);

  const requestFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      const el = document.getElementById(FULLSCREEN_ELEMENT_ID) || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        await (el as any).mozRequestFullScreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      } else {
        return false;
      }
      setIsFullscreen(true);
      retryCountRef.current = 0;
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
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch {}
  }, []);

  const retryFullscreen = useCallback(() => {
    if (retryCountRef.current >= 3) {
      onViolation?.("FULLSCREEN_ERROR", "Failed to re-enter fullscreen after 3 retries");
      return;
    }
    retryCountRef.current++;
    retryTimerRef.current = setTimeout(async () => {
      const success = await requestFullscreen();
      if (!success) {
        retryFullscreen();
      }
    }, Math.min(1000 * retryCountRef.current, 3000));
  }, [requestFullscreen, onViolation]);

  const reEnterFullscreen = useCallback(async () => {
    if (reEnteringRef.current) return;
    reEnteringRef.current = true;
    retryCountRef.current = 0;
    const success = await requestFullscreen();
    if (!success) {
      retryFullscreen();
    }
    setTimeout(() => { reEnteringRef.current = false; }, 500);
  }, [requestFullscreen, retryFullscreen]);

  useEffect(() => {
    if (!enabledRef.current) return;

    const handleChange = () => {
      const fs = checkFullscreen();
      if (!fs && enabledRef.current && !reEnteringRef.current) {
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
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);
    document.addEventListener("fullscreenerror", handleError);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
      document.removeEventListener("fullscreenerror", handleError);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [checkFullscreen, maxExits, onViolation, onTerminate, reEnterFullscreen]);

  const enable = useCallback(async () => {
    enabledRef.current = true;
    retryCountRef.current = 0;
    const success = await requestFullscreen();
    if (!success) {
      retryFullscreen();
    }
  }, [requestFullscreen, retryFullscreen]);

  const disable = useCallback(() => {
    enabledRef.current = false;
    exitFullscreen();
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  }, [exitFullscreen]);

  const reset = useCallback(() => {
    exitCountRef.current = 0;
    setExitCount(0);
    retryCountRef.current = 0;
  }, []);

  return {
    isFullscreen,
    exitCount,
    requestFullscreen,
    exitFullscreen,
    reEnterFullscreen,
    enable,
    disable,
    reset,
    FULLSCREEN_ELEMENT_ID,
  };
}
