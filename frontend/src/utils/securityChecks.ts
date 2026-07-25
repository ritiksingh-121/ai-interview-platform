export function checkBrowserSecurity(): {
  secure: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (!navigator.mediaDevices?.getUserMedia) issues.push("Camera/Microphone not available");
  if (!("Fullscreen API" in document || "webkitFullscreenElement" in document || "mozFullScreenElement" in document)) issues.push("Fullscreen API not supported");
  if (!navigator.onLine) issues.push("Browser is offline");
  if (!window.crypto?.subtle) issues.push("Secure crypto not available");
  if (!("serviceWorker" in navigator)) issues.push("Service Workers not supported");
  if (typeof localStorage === "undefined") issues.push("Local storage not available");
  if (typeof sessionStorage === "undefined") issues.push("Session storage not available");
  return { secure: issues.length === 0, issues };
}

export function checkSuspiciousTiming(): boolean {
  const startTime = performance.now();
  let result = 0;
  for (let i = 0; i < 100000; i++) result += Math.sqrt(i);
  return performance.now() - startTime > 500;
}

export function checkWebDriver(): boolean {
  return !!(navigator as any).webdriver;
}

export function checkHeadless(): boolean {
  const checks = [
    !navigator.plugins?.length,
    !(navigator as any).mimeTypes?.length,
    !("chrome" in window) && !("InstallTrigger" in window),
    navigator.hardwareConcurrency === 0,
    (navigator as any).deviceMemory === 0,
  ];
  return checks.filter(Boolean).length >= 3;
}

export function checkEmulator(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const patterns = ["android.*emulator", "android.*avd", "iphone simulator", "ios simulator", "genymotion", "bluestacks", "nox player", "memu"];
  return patterns.some((p) => new RegExp(p).test(userAgent));
}

export function checkDebugger(): boolean {
  const start = performance.now();
  debugger;
  return performance.now() - start > 100;
}

export function getBrowserFingerprint(): string {
  const components = [
    navigator.userAgent, navigator.language, navigator.platform,
    navigator.hardwareConcurrency, (navigator as any).deviceMemory,
    screen.colorDepth, screen.width, screen.height,
    new Date().getTimezoneOffset(),
  ];
  const str = components.join("|||");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
