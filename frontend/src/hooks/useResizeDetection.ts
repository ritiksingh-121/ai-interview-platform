import { useState, useEffect, useCallback, useRef } from "react";

interface UseResizeDetectionOptions {
  onViolation?: (type: string, message: string) => void;
}

export function useResizeDetection(options: UseResizeDetectionOptions = {}) {
  const { onViolation } = options;
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hasResized, setHasResized] = useState(false);
  const enabledRef = useRef(false);
  const lastSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const checkResize = useCallback(() => {
    if (!enabledRef.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    setWindowSize({ width: w, height: h });

    if (w !== lastSizeRef.current.width || h !== lastSizeRef.current.height) {
      setHasResized(true);
      const dw = Math.abs(w - lastSizeRef.current.width);
      const dh = Math.abs(h - lastSizeRef.current.height);
      if (dw > 100 || dh > 100) {
        onViolation?.("VIEWPORT_RESIZE", `Window resized from ${lastSizeRef.current.width}x${lastSizeRef.current.height} to ${w}x${h}`);
      }
      lastSizeRef.current = { width: w, height: h };
    }

    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => setHasResized(false), 1000);
  }, [onViolation]);

  useEffect(() => {
    if (!enabledRef.current) return;
    window.addEventListener("resize", checkResize);
    return () => {
      window.removeEventListener("resize", checkResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [checkResize]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setHasResized(false);
  }, []);

  return { windowSize, hasResized, enable, disable };
}
