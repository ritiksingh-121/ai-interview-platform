import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CameraContextValue {
  stream: MediaStream | null;
  setStream: (s: MediaStream | null) => void;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  return (
    <CameraContext.Provider value={{ stream, setStream }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraStream() {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCameraStream must be used within CameraProvider");
  return ctx;
}
