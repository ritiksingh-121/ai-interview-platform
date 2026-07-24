import { useState, useRef, useCallback, useEffect } from "react";

interface UseCameraOptions {
  onViolation?: (type: string, message: string) => void;
}

interface CameraInfo {
  deviceId: string;
  label: string;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { onViolation } = options;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 640, height: 480, frameRate: 30 }
          : { width: 640, height: 480, frameRate: 30 },
        audio: false,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      setStream(s);
      setIsCameraActive(true);
      setError(null);
      const videoTrack = s.getVideoTracks()[0];
      if (videoTrack) setActiveCameraId(videoTrack.getSettings().deviceId || null);
      return s;
    } catch (err: any) {
      setError(err.message || "Camera access denied");
      setIsCameraActive(false);
      onViolation?.("CAMERA_ERROR", err.message || "Camera access denied");
      return null;
    }
  }, [onViolation]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsCameraActive(false);
    setActiveCameraId(null);
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    return startCamera(deviceId);
  }, [startCamera]);

  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }));
      setCameras(videoDevices);
      return videoDevices;
    } catch {
      return [];
    }
  }, []);

  const checkCameraConnected = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((d) => d.kind === "videoinput");
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleDeviceChange = async () => {
      const hasCamera = await checkCameraConnected();
      if (!hasCamera && isCameraActive) {
        onViolation?.("CAMERA_DISCONNECTED", "Camera device disconnected");
        setIsCameraActive(false);
      }
    };
    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [isCameraActive, checkCameraConnected, onViolation]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    stream,
    isCameraActive,
    error,
    cameras,
    activeCameraId,
    startCamera,
    stopCamera,
    switchCamera,
    getCameras,
    checkCameraConnected,
  };
}
