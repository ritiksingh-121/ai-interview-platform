import { useState, useEffect, useCallback, useRef } from "react";

interface UseBrowserIntegrityOptions {
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

export function useBrowserIntegrity(options: UseBrowserIntegrityOptions = {}) {
  const { onViolation, onTerminate } = options;
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [undockedDetected, setUndockedDetected] = useState(false);
  const [isAutomated, setIsAutomated] = useState(false);

  const enabledRef = useRef(false);
  const checkCountRef = useRef(0);
  const lastWidthRef = useRef(window.outerWidth);
  const lastHeightRef = useRef(window.outerHeight);
  const devToolViolationsRef = useRef(0);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;
  const onTerminateRef = useRef(onTerminate);
  onTerminateRef.current = onTerminate;

  const detectDevTools = useCallback((): boolean => {
    if (!enabledRef.current) return false;
    checkCountRef.current++;

    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthCheck = widthDiff > threshold;
    const heightCheck = heightDiff > threshold;

    if (widthCheck || heightCheck) {
      devToolViolationsRef.current++;
      if (devToolViolationsRef.current === 1 || devToolViolationsRef.current % 3 === 0) {
        setDevToolsOpen(true);
        onViolationRef.current?.("DEVELOPER_TOOLS", `Developer tools detected (w:${widthDiff}, h:${heightDiff})`);
      }
      return true;
    }
    devToolViolationsRef.current = Math.max(0, devToolViolationsRef.current - 1);

    const startTime = performance.now();
    debugger;
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      setDevToolsOpen(true);
      onViolationRef.current?.("DEBUGGER_PAUSE", "Debugger pause detected");
      return true;
    }

    const firefoxCheck = () => {
      let debug = false;
      const elem = document.createElement("div");
      Object.defineProperty(elem, "id", {
        get: () => { debug = true; return ""; },
      });
      console.log(elem);
      return debug;
    };

    if (firefoxCheck()) {
      setDevToolsOpen(true);
      onViolationRef.current?.("DEVELOPER_TOOLS", "Developer tools detected (Firefox check)");
      return true;
    }

    const img = new Image();
    Object.defineProperty(img, "id", {
      get: () => {
        setDevToolsOpen(true);
        onViolationRef.current?.("CONSOLE_OPEN", "DevTools console open detected");
        return "";
      },
    });
    console.debug(img);

    if (undockedDetected) {
      const currentWidth = window.outerWidth;
      const currentHeight = window.outerHeight;
      if (Math.abs(currentWidth - lastWidthRef.current) > 50 || Math.abs(currentHeight - lastHeightRef.current) > 50) {
        onViolationRef.current?.("DEVELOPER_TOOLS", "Undocked DevTools window detected via resize");
        setUndockedDetected(true);
      }
      lastWidthRef.current = currentWidth;
      lastHeightRef.current = currentHeight;
    }

    return false;
  }, []);

  const detectAutomation = useCallback(() => {
    if (!enabledRef.current) return;
    const checks = [
      { test: (navigator as any).webdriver, name: "webdriver" },
      { test: !("chrome" in window) && !("InstallTrigger" in window) && !navigator.plugins?.length, name: "noPlugins" },
      { test: navigator.hardwareConcurrency === 0, name: "noConcurrency" },
      { test: (navigator as any).deviceMemory === 0, name: "noDeviceMemory" },
    ];
    const detected = checks.filter((c) => c.test);
    if (detected.length > 1) {
      setIsAutomated(true);
      onViolationRef.current?.("AUTOMATION_DETECTED", `Automation detected: ${detected.map((d) => d.name).join(", ")}`);
      onTerminateRef.current?.("Automation/headless browser detected");
    }
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return;

    const debugInterval = setInterval(() => {
      detectDevTools();
    }, 2000);

    detectAutomation();

    const resizeHandler = () => {
      const currentWidth = window.outerWidth;
      const currentHeight = window.outerHeight;
      const dw = Math.abs(currentWidth - lastWidthRef.current);
      const dh = Math.abs(currentHeight - lastHeightRef.current);
      const suspiciousResize = (dw > 200 && dh < 20) || (dh > 200 && dw < 20);
      if (suspiciousResize && enabledRef.current) {
        setUndockedDetected(true);
        onViolationRef.current?.("DEVELOPER_TOOLS", "Suspicious window resize pattern - undocked DevTools");
      }
      lastWidthRef.current = currentWidth;
      lastHeightRef.current = currentHeight;
    };
    window.addEventListener("resize", resizeHandler);

    return () => {
      clearInterval(debugInterval);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setDevToolsOpen(false);
    setUndockedDetected(false);
    setIsAutomated(false);
  }, []);

  const runIntegrityCheck = useCallback(() => {
    detectDevTools();
    detectAutomation();
    return { devToolsOpen, undockedDetected, isAutomated };
  }, []);

  return {
    devToolsOpen,
    undockedDetected,
    isAutomated,
    enable,
    disable,
    runIntegrityCheck,
  };
}
