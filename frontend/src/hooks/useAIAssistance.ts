import { useState, useRef, useCallback } from "react";

interface UseAIAssistanceOptions {
  onViolation?: (type: string, message: string) => void;
}

interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useAIAssistance(options: UseAIAssistanceOptions = {}) {
  const { onViolation } = options;
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [eyeMovementPattern, setEyeMovementPattern] = useState<"normal" | "suspicious" | "highly_suspicious">("normal");
  const [frequentSideReading, setFrequentSideReading] = useState(false);
  const [lookingBelowScreen, setLookingBelowScreen] = useState(false);
  const [continuousLipMovement, setContinuousLipMovement] = useState(false);
  const [rapidGazeSwitching, setRapidGazeSwitching] = useState(false);
  const gazeHistoryRef = useRef<GazePoint[]>([]);
  const sideReadCountRef = useRef(0);
  const enabledRef = useRef(false);

  const trackGaze = useCallback((x: number, y: number) => {
    if (!enabledRef.current) return;

    const now = Date.now();
    gazeHistoryRef.current.push({ x, y, timestamp: now });

    if (gazeHistoryRef.current.length > 100) {
      gazeHistoryRef.current = gazeHistoryRef.current.slice(-50);
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const sideThreshold = screenWidth * 0.2;
    const bottomThreshold = screenHeight * 0.7;

    if (x < sideThreshold || x > screenWidth - sideThreshold) {
      sideReadCountRef.current++;
      if (sideReadCountRef.current > 10 && !frequentSideReading) {
        setFrequentSideReading(true);
        onViolation?.("FREQUENT_SIDE_READING", "Frequent side reading detected - possible second monitor");
      }
    } else {
      sideReadCountRef.current = Math.max(0, sideReadCountRef.current - 1);
    }

    if (y > bottomThreshold && !lookingBelowScreen) {
      setLookingBelowScreen(true);
      onViolation?.("AI_ASSISTANCE_SUSPICION", "Looking below screen - possible hidden materials");
    } else if (y <= bottomThreshold) {
      setLookingBelowScreen(false);
    }

    if (gazeHistoryRef.current.length >= 5) {
      const recent = gazeHistoryRef.current.slice(-5);
      let switches = 0;
      for (let i = 1; i < recent.length; i++) {
        const dx = Math.abs(recent[i].x - recent[i - 1].x);
        if (dx > screenWidth * 0.15) switches++;
      }
      if (switches >= 3 && !rapidGazeSwitching) {
        setRapidGazeSwitching(true);
        onViolation?.("RAPID_GAZE_SWITCHING", "Rapid gaze switching detected");
      } else if (switches < 2) {
        setRapidGazeSwitching(false);
      }
    }

    let score = 0;
    if (frequentSideReading) score += 25;
    if (lookingBelowScreen) score += 25;
    if (rapidGazeSwitching) score += 20;
    if (continuousLipMovement) score += 15;
    score = Math.min(100, score);
    setSuspicionScore(score);

    if (score >= 60) setEyeMovementPattern("highly_suspicious");
    else if (score >= 30) setEyeMovementPattern("suspicious");
    else setEyeMovementPattern("normal");
  }, [frequentSideReading, lookingBelowScreen, rapidGazeSwitching, continuousLipMovement, onViolation]);

  const simulateLipMovement = useCallback((active: boolean) => {
    if (!enabledRef.current) return;
    setContinuousLipMovement(active);
    if (active) {
      onViolation?.("AI_ASSISTANCE_SUSPICION", "Continuous lip movement detected - possible subvocalization");
    }
  }, [onViolation]);

  const reset = useCallback(() => {
    gazeHistoryRef.current = [];
    sideReadCountRef.current = 0;
    setSuspicionScore(0);
    setEyeMovementPattern("normal");
    setFrequentSideReading(false);
    setLookingBelowScreen(false);
    setContinuousLipMovement(false);
    setRapidGazeSwitching(false);
  }, []);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    reset();
  }, [reset]);

  return {
    suspicionScore,
    eyeMovementPattern,
    frequentSideReading,
    lookingBelowScreen,
    continuousLipMovement,
    rapidGazeSwitching,
    trackGaze,
    simulateLipMovement,
    reset,
    enable,
    disable,
  };
}
