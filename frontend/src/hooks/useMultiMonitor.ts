import { useState, useEffect, useCallback, useRef } from "react";

interface UseMultiMonitorOptions {
  onViolation?: (type: string, message: string) => void;
}

interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  isExtended: boolean;
}

export function useMultiMonitor(options: UseMultiMonitorOptions = {}) {
  const { onViolation } = options;
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null);
  const [multiMonitorDetected, setMultiMonitorDetected] = useState(false);
  const previousWidthRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const detectMultiMonitor = useCallback(() => {
    if (!enabledRef.current) return;

    const s = window.screen;
    const info: ScreenInfo = {
      width: s.width,
      height: s.height,
      availWidth: s.availWidth,
      availHeight: s.availHeight,
      colorDepth: s.colorDepth,
      pixelDepth: s.pixelDepth,
      isExtended: (s as any).isExtended || false,
    };
    setScreenInfo(info);

    const isExtended = (s as any).isExtended || false;
    if (isExtended) {
      setMultiMonitorDetected(true);
      onViolationRef.current?.("MULTI_MONITOR", "Multiple displays detected");
    }

    if (previousWidthRef.current !== null && Math.abs(s.width - previousWidthRef.current) > 100) {
      onViolationRef.current?.("MULTI_MONITOR", `Resolution change detected: ${previousWidthRef.current}x -> ${s.width}`);
    }
    previousWidthRef.current = s.width;
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return;
    detectMultiMonitor();

    const handleResize = () => detectMultiMonitor();
    window.addEventListener("resize", handleResize);

    let checkInterval: ReturnType<typeof setInterval>;
    if (enabledRef.current) {
      checkInterval = setInterval(detectMultiMonitor, 5000);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [detectMultiMonitor]);

  useEffect(() => {
    if (!enabledRef.current) return;
    const handleMove = () => {
      if ((window.screen as any).isExtended) {
        setMultiMonitorDetected(true);
        onViolationRef.current?.("MULTI_MONITOR", "Window moved to another display");
      }
    };
    let moveTimer: ReturnType<typeof setTimeout>;
    const throttledMove = () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(handleMove, 500);
    };
    window.addEventListener("resize", throttledMove);
    return () => {
      window.removeEventListener("resize", throttledMove);
      clearTimeout(moveTimer);
    };
  }, []);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  return {
    screenInfo,
    multiMonitorDetected,
    enable,
    disable,
  };
}
