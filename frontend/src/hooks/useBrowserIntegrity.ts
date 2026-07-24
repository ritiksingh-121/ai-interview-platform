import { useState, useEffect, useCallback, useRef } from "react";

interface UseBrowserIntegrityOptions {
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

export function useBrowserIntegrity(options: UseBrowserIntegrityOptions = {}) {
  const { onViolation, onTerminate } = options;
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isAutomated, setIsAutomated] = useState(false);
  const enabledRef = useRef(false);
  const checkCountRef = useRef(0);

  const detectDevTools = useCallback(() => {
    if (!enabledRef.current) return false;

    checkCountRef.current++;

    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        setDevToolsOpen(true);
        onViolation?.("DEVELOPER_TOOLS", "Developer tools detected via viewport size");
      }
      return true;
    }

    const firefoxCheck = () => {
      let debug = false;
      const elem = document.createElement("div");
      Object.defineProperty(elem, "id", {
        get: () => {
          debug = true;
          return "";
        },
      });
      console.log(elem);
      return debug;
    };

    const startTime = performance.now();
    debugger;
    const endTime = performance.now();
    if (endTime - startTime > 100) {
      if (!devToolsOpen) {
        setDevToolsOpen(true);
        onViolation?.("DEBUGGER_PAUSE", "Debugger pause detected");
      }
      return true;
    }

    return false;
  }, [devToolsOpen, onViolation]);

  const detectAutomation = useCallback(() => {
    if (!enabledRef.current) return;

    const checks = [
      { test: (navigator as any).webdriver, name: "webdriver" },
      { test: (navigator as any).plugins?.length === 0 && (navigator as any).mimeTypes?.length === 0, name: "noPlugins" },
      { test: !("chrome" in window), name: "noChrome" },
      { test: (navigator as any).languages?.length === 0, name: "noLanguages" },
      { test: !("onbeforeunload" in window), name: "noOnBeforeUnload" },
      { test: (navigator as any).hardwareConcurrency === 0, name: "noConcurrency" },
      { test: (navigator as any).deviceMemory === 0, name: "noDeviceMemory" },
      { test: !navigator.mediaDevices?.enumerateDevices, name: "noEnumerateDevices" },
    ];

    const detected = checks.filter((c) => c.test);
    if (detected.length > 1) {
      setIsAutomated(true);
      onViolation?.("AUTOMATION_DETECTED", `Automation detected: ${detected.map((d) => d.name).join(", ")}`);
      onTerminate?.("Automation/headless browser detected");
    }
  }, [onViolation, onTerminate]);

  const detectConsoleOpen = useCallback(() => {
    if (!enabledRef.current) return;

    const elem = new Image();
    Object.defineProperty(elem, "id", {
      get: () => {
        setConsoleOpen(true);
        onViolation?.("CONSOLE_OPEN", "Console inspection detected");
        return "";
      },
    });
    try {
      console.log("%c", elem);
    } catch {}

    const img = new Image();
    Object.defineProperty(img, "id", {
      get: () => {
        onViolation?.("CONSOLE_OPEN", "DevTools console open detected");
        return "";
      },
    });
    console.debug(img);
  }, [onViolation]);

  useEffect(() => {
    if (!enabledRef.current) return;

    const debugInterval = setInterval(() => {
      detectDevTools();
      detectConsoleOpen();
    }, 2000);

    detectAutomation();

    const resizeHandler = () => detectDevTools();
    window.addEventListener("resize", resizeHandler);

    return () => {
      clearInterval(debugInterval);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [detectDevTools, detectAutomation, detectConsoleOpen]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setDevToolsOpen(false);
    setConsoleOpen(false);
  }, []);

  const runIntegrityCheck = useCallback(() => {
    detectDevTools();
    detectAutomation();
    detectConsoleOpen();
    return { devToolsOpen, consoleOpen, isAutomated };
  }, [detectDevTools, detectAutomation, detectConsoleOpen, devToolsOpen, consoleOpen, isAutomated]);

  return {
    devToolsOpen,
    consoleOpen,
    isAutomated,
    enable,
    disable,
    runIntegrityCheck,
  };
}
