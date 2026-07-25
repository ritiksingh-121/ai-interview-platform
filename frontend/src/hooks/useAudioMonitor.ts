import { useState, useRef, useCallback, useEffect } from "react";

interface AudioLevel {
  rms: number;
  peak: number;
  isSilent: boolean;
  isLoud: boolean;
}

interface UseAudioMonitorOptions {
  onViolation?: (type: string, message: string) => void;
}

const SILENCE_THRESHOLD = 0.02;
const LOUD_THRESHOLD = 0.8;
const SILENCE_WARN_MS = 15000;
const NOISE_THRESHOLD = 1500;

export function useAudioMonitor(options: UseAudioMonitorOptions = {}) {
  const { onViolation } = options;
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<AudioLevel>({ rms: 0, peak: 0, isSilent: true, isLoud: false });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isHighNoise, setIsHighNoise] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setInterval>>();
  const enabledRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const micDeadRef = useRef(false);
  const checkMicIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof Worker !== "undefined") {
      const worker = new Worker(
        new URL("../workers/proctoringWorker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === "audio-result") {
          setAudioLevel({ ...e.data.data });
          setSilenceDuration(e.data.data.isSilent ? silenceStartRef.current ? Date.now() - silenceStartRef.current : 0 : 0);
          setIsSpeaking(!e.data.data.isSilent);
          if (e.data.data.isSilent && enabledRef.current) {
            if (!silenceStartRef.current) silenceStartRef.current = Date.now();
            const dur = Date.now() - silenceStartRef.current;
            if (dur > SILENCE_WARN_MS) {
              onViolation?.("MIC_MUTED", `Microphone silence detected for ${Math.round(dur / 1000)}s`);
              silenceStartRef.current = Date.now();
            }
          } else {
            silenceStartRef.current = null;
          }
        }
        if (e.data.type === "noise-result") {
          setNoiseLevel(e.data.data.variance);
          setIsHighNoise(e.data.data.isHighNoise);
          if (e.data.data.isHighNoise && enabledRef.current) {
            onViolation?.("AUDIO_NOISE", "High background noise detected");
          }
        }
      };
    }
    return () => workerRef.current?.terminate();
  }, [onViolation]);

  const checkMicStatus = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((d) => d.kind === "audioinput");
      if (audioInputs.length === 0) {
        if (!micDeadRef.current) {
          micDeadRef.current = true;
          onViolation?.("MIC_DISCONNECTED", "Microphone device disconnected");
          setIsMicActive(false);
        }
      } else {
        micDeadRef.current = false;
      }
    } catch {}
  }, [onViolation]);

  const startMicrophone = useCallback(async () => {
    try {
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsMicActive(true);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const analyze = () => {
        if (!analyserRef.current || !workerRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        workerRef.current.postMessage({ type: "audio-analyze", data: { samples: Array.from(dataArray) } });
        workerRef.current.postMessage({ type: "noise-detection", data: { samples: Array.from(dataArray) } });
      };

      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = setInterval(analyze, 200);

      checkMicIntervalRef.current = setInterval(checkMicStatus, 5000);
      return stream;
    } catch (err: any) {
      onViolation?.("MIC_DISCONNECTED", err.message || "Microphone access denied");
      return null;
    }
  }, [audioStream, checkMicStatus, onViolation]);

  const stopMicrophone = useCallback(() => {
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    if (checkMicIntervalRef.current) clearInterval(checkMicIntervalRef.current);
    setAudioStream(null);
    setIsMicActive(false);
    setAudioLevel({ rms: 0, peak: 0, isSilent: true, isLoud: false });
    setIsSpeaking(false);
  }, [audioStream]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  useEffect(() => {
    return () => {
      if (audioStream) audioStream.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (checkMicIntervalRef.current) clearInterval(checkMicIntervalRef.current);
    };
  }, [audioStream]);

  return {
    audioStream, isMicActive, isMicMuted, audioLevel, isSpeaking,
    silenceDuration, noiseLevel, isHighNoise,
    startMicrophone, stopMicrophone, enable, disable,
  };
}
