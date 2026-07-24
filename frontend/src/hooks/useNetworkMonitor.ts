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
}

export function useNetworkMonitor(options: UseNetworkMonitorOptions = {}) {
  const { onViolation } = options;
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    latency: null,
  });
  const wasOfflineRef = useRef(false);
  const enabledRef = useRef(false);

  const checkLatency = useCallback(async () => {
    if (!enabledRef.current) return;
    const start = performance.now();
    try {
      await fetch("/api/health", { method: "HEAD", cache: "no-store" });
      const latency = Math.round(performance.now() - start);
      setNetworkInfo((prev) => ({ ...prev, latency }));
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabledRef.current) return;

    const handleOnline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: true }));
      if (wasOfflineRef.current) {
        onViolation?.("NETWORK_RECONNECT", "Network reconnected after being offline");
      }
      wasOfflineRef.current = false;
      checkLatency();
    };

    const handleOffline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: false }));
      wasOfflineRef.current = true;
      onViolation?.("NETWORK_OFFLINE", "Network connection lost");
    };

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
          if (conn.rtt && conn.rtt > 1000) {
            onViolation?.("HIGH_LATENCY", `High latency detected: ${conn.rtt}ms`);
          }
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

    const interval = setInterval(checkLatency, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkLatency, onViolation]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  return {
    ...networkInfo,
    enable,
    disable,
  };
}
