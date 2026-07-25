import { useState, useEffect, useCallback, useRef } from "react";

interface UseZoomDetectionOptions {
  onViolation?: (type: string, message: string) => void;
}

export function useZoomDetection(options: UseZoomDetectionOptions = {}) {
  const { onViolation } = options;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const enabledRef = useRef(false);
  const lastZoomRef = useRef(1);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const checkZoom = useCallback(() => {
    if (!enabledRef.current) return;
    const level = Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
    setZoomLevel(level);
    if (level > 1.05 || level < 0.95) {
      setIsZoomed(true);
      if (Math.abs(level - lastZoomRef.current) > 0.02) {
        onViolationRef.current?.("VIEWPORT_ZOOM", `Browser zoom changed to ${Math.round(level * 100)}%`);
      }
    } else {
      setIsZoomed(false);
    }
    lastZoomRef.current = level;
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return;
    checkZoom();

    const resizeHandler = () => checkZoom();
    window.addEventListener("resize", resizeHandler);
    const interval = setInterval(checkZoom, 2000);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearInterval(interval);
    };
  }, []);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setIsZoomed(false);
    setZoomLevel(1);
  }, []);

  return { zoomLevel, isZoomed, enable, disable };
}
