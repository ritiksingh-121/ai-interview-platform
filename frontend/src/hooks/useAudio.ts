import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioOptions {
  onViolation?: (type: string, message: string) => void;
}

interface AudioLevel {
  rms: number;
  peak: number;
  isSilent: boolean;
  isLoud: boolean;
}

const SILENCE_THRESHOLD = 0.02;
const LOUD_THRESHOLD = 0.8;
const SILENCE_DURATION_MS = 10000;

export function useAudio(options: UseAudioOptions = {}) {
  const { onViolation } = options;
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState<AudioLevel>({ rms: 0, peak: 0, isSilent: true, isLoud: false });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setInterval>>();
  const enabledRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const voiceCountRef = useRef(0);

  const startMicrophone = useCallback(async () => {
    try {
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

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silentFrames = 0;
      let totalFrames = 0;

      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
          peak = Math.max(peak, Math.abs(value));
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const isSilent = rms < SILENCE_THRESHOLD;
        const isLoud = rms > LOUD_THRESHOLD;

        totalFrames++;
        if (isSilent) silentFrames++;
        else silentFrames = 0;

        const isCurrentlySpeaking = rms > SILENCE_THRESHOLD * 2;
        setIsSpeaking(isCurrentlySpeaking);

        setAudioLevel({ rms, peak, isSilent, isLoud });

        if (isSilent && enabledRef.current) {
          if (!silenceStartRef.current) silenceStartRef.current = Date.now();
          const dur = Date.now() - silenceStartRef.current;
          setSilenceDuration(dur);
          if (dur > SILENCE_DURATION_MS) {
            onViolation?.("LONG_SILENCE", `Silence detected for ${Math.round(dur / 1000)}s`);
            silenceStartRef.current = Date.now();
          }
        } else {
          silenceStartRef.current = null;
          setSilenceDuration(0);
        }
      };

      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = setInterval(analyze, 200);
      return stream;
    } catch (err: any) {
      onViolation?.("MICROPHONE_ERROR", err.message || "Microphone access denied");
      return null;
    }
  }, [onViolation]);

  const stopMicrophone = useCallback(() => {
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
    }
    setAudioStream(null);
    setIsMicActive(false);
    setAudioLevel({ rms: 0, peak: 0, isSilent: true, isLoud: false });
    setIsSpeaking(false);
  }, [audioStream]);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  const simulateSecondVoice = useCallback(() => {
    if (!enabledRef.current) return;
    voiceCountRef.current++;
    if (voiceCountRef.current <= 3) {
      onViolation?.("SECOND_VOICE", "Potential second voice detected in background");
    }
  }, [onViolation]);

  const simulateBackgroundSpeech = useCallback(() => {
    if (!enabledRef.current) return;
    onViolation?.("BACKGROUND_SPEECH", "Background speech detected");
  }, [onViolation]);

  const simulateNoiseSpike = useCallback(() => {
    if (!enabledRef.current) return;
    setAudioLevel({ rms: 0.9, peak: 1.0, isSilent: false, isLoud: true });
    setTimeout(() => {
      setAudioLevel({ rms: 0, peak: 0, isSilent: true, isLoud: false });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (audioStream) audioStream.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    };
  }, [audioStream]);

  return {
    audioStream,
    isMicActive,
    audioLevel,
    isSpeaking,
    silenceDuration,
    startMicrophone,
    stopMicrophone,
    enable,
    disable,
    simulateSecondVoice,
    simulateBackgroundSpeech,
    simulateNoiseSpike,
  };
}
