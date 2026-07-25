import { useState, useEffect, useCallback, useRef } from "react";

interface UseNetworkMonitorOptions {
  onViolation?: (type: string, message: string) => void;
}

interface NetworkInfo {
  isOnline: boolean;
  latency: number | null;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  latencySpikes: number;
}

export function useNetworkMonitor(options: UseNetworkMonitorOptions = {}) {
  const { onViolation } = options;
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    latency: null,
    latencySpikes: 0,
  });
  const wasOfflineRef = useRef(false);
  const enabledRef = useRef(false);
  const spikeCountRef = useRef(0);
  const latencyHistoryRef = useRef<number[]>([]);
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const checkLatency = useCallback(async () => {
    if (!enabledRef.current) return;
    const start = performance.now();
    try {
      await fetch("/api/health", { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(5000) });
      const latency = Math.round(performance.now() - start);
      latencyHistoryRef.current.push(latency);
      if (latencyHistoryRef.current.length > 10) {
        latencyHistoryRef.current = latencyHistoryRef.current.slice(-10);
      }
      const avgLatency = latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length;
      if (latency > avgLatency * 3 && latency > 1000) {
        spikeCountRef.current++;
        onViolationRef.current?.("NETWORK_LATENCY", `Latency spike: ${latency}ms (avg: ${Math.round(avgLatency)}ms)`);
      }
      setNetworkInfo((prev) => ({
        ...prev, latency,
        latencySpikes: spikeCountRef.current,
      }));
    } catch {
      setNetworkInfo((prev) => ({ ...prev, latency: null }));
    }
  }, []);

  const handleOnlineRef = useRef<(e: Event) => void>();
  const handleOfflineRef = useRef<(e: Event) => void>();

  useEffect(() => {
    if (!enabledRef.current) return;

    const handleOnline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: true }));
      if (wasOfflineRef.current) {
        onViolationRef.current?.("NETWORK_RECONNECT", "Network reconnected after being offline");
      }
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: false }));
      wasOfflineRef.current = true;
      onViolationRef.current?.("NETWORK_OFFLINE", "Network connection lost");
    };

    handleOnlineRef.current = handleOnline;
    handleOfflineRef.current = handleOffline;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("connection" in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const updateConnection = () => {
          setNetworkInfo((prev) => ({
            ...prev,
            downlink: conn.downlink,
            effectiveType: conn.effectiveType,
            rtt: conn.rtt,
          }));
        };
        updateConnection();
        conn.addEventListener("change", updateConnection);
        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
          conn.removeEventListener("change", updateConnection);
        };
      }
    }

    const interval = setInterval(checkLatency, 15000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const enable = useCallback(() => {
    enabledRef.current = true;
    checkLatency();
  }, [checkLatency]);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  return { ...networkInfo, enable, disable };
}
