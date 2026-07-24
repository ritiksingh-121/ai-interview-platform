import { useState, useEffect, useRef, useCallback } from "react";

interface UseTabFocusOptions {
  gracePeriod?: number;
  maxSwitches?: number;
  onViolation?: (type: string, message: string) => void;
  onTerminate?: (reason: string) => void;
}

export function useTabFocus(options: UseTabFocusOptions = {}) {
  const {
    gracePeriod = 5,
    maxSwitches = 3,
    onViolation,
    onTerminate,
  } = options;

  const [isFocused, setIsFocused] = useState(true);
  const [switchCount, setSwitchCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [lastBlurTime, setLastBlurTime] = useState<number | null>(null);
  const switchCountRef = useRef(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const enabledRef = useRef(false);
  const blurredAtRef = useRef<number | null>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowCountdown(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = undefined;
    }
    const elapsed = blurredAtRef.current ? (Date.now() - blurredAtRef.current) / 1000 : 0;
    if (elapsed > gracePeriod && enabledRef.current) {
      switchCountRef.current += 1;
      setSwitchCount(switchCountRef.current);
      onViolation?.("TAB_SWITCH", `Tab switched for ${Math.round(elapsed)}s (${switchCountRef.current}/${maxSwitches})`);
      if (switchCountRef.current >= maxSwitches) {
        onTerminate?.("Exceeded maximum tab switches");
      }
    }
    blurredAtRef.current = null;
  }, [gracePeriod, maxSwitches, onViolation, onTerminate]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    blurredAtRef.current = Date.now();
    setLastBlurTime(Date.now());
    if (enabledRef.current) {
      setShowCountdown(true);
      setCountdown(gracePeriod);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [gracePeriod]);

  useEffect(() => {
    if (!enabledRef.current) return;

    const onVisibility = () => {
      if (document.hidden) handleBlur();
      else handleFocus();
    };

    const onWindowBlur = () => handleBlur();
    const onWindowFocus = () => handleFocus();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [handleBlur, handleFocus]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setShowCountdown(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = undefined;
    }
  }, []);
  const reset = useCallback(() => {
    switchCountRef.current = 0;
    setSwitchCount(0);
    setCountdown(0);
    setShowCountdown(false);
  }, []);

  return {
    isFocused,
    switchCount,
    countdown,
    showCountdown,
    lastBlurTime,
    enable,
    disable,
    reset,
  };
}
