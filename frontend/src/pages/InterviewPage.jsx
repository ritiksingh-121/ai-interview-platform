import React, { useState, useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";
import RoleSelector from "../components/RoleSelector";
import { sendInterviewMessage, getFeedback } from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";

export default function InterviewPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const bottomRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Session Timer
  useEffect(() => {
    if (isInterviewStarted && messages.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInterviewStarted, messages]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 🎥 CAMERA INITIALIZATION
  useEffect(() => {
    if (!isInterviewStarted) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInterviewStarted]);

  // 🎤 Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    let recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      listeningRef.current = true;
    };

    recognition.onend = () => {
      setListening(false);
      listeningRef.current = false;
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      if (!event.results[0].isFinal) return;

      if (text === lastTranscriptRef.current) return;
      lastTranscriptRef.current = text;

      setInput((prev) => (prev ? prev + " " + text : text));
    };

    recognition.onerror = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      try { recognition.abort(); } catch {}
      recognition = null;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // 🔊 TTS Speak — with echo-safe mic control
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const cleanText = text.replace(/📌|⚡|🚀|\*|\n/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    isSpeakingRef.current = true;

    const wasListening = listeningRef.current;
    if (wasListening) abortListening();

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      if (wasListening) {
        setTimeout(() => {
          if (!isSpeakingRef.current) startListening();
        }, 400);
      }
      isSpeakingRef.current = false;
    };
  };

  const abortListening = () => {
    try { recognitionRef.current?.abort(); } catch {}
  };

  const startListening = () => {
    lastTranscriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const fresh = new SpeechRecognition();
    fresh.lang = "en-US";
    fresh.continuous = false;
    fresh.interimResults = false;

    fresh.onstart = () => {
      setListening(true);
      listeningRef.current = true;
    };
    fresh.onend = () => {
      setListening(false);
      listeningRef.current = false;
    };
    fresh.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (!event.results[0].isFinal) return;
      if (text === lastTranscriptRef.current) return;
      lastTranscriptRef.current = text;
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    fresh.onerror = () => {
      if (recognitionRef.current === fresh) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = fresh;
    try { fresh.start(); } catch {}
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
  };

  // Start Interview Action
  const startInterview = async () => {
    setLoading(true);
    setIsInterviewStarted(true);

    try {
      const data = await sendInterviewMessage({
        role,
        message: "Start interview",
        history: [],
      });

      setMessages([{ role: "assistant", content: data.reply }]);
      speak(data.reply);
    } catch (err) {
      console.error("Failed to start session:", err);
    }

    setLoading(false);
  };

  // Send Message
  const sendMessage = async (customInput) => {
    const text = customInput || input;
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendInterviewMessage({
        role,
        message: text,
        history: messages,
      });

      const aiMsg = { role: "assistant", content: data.reply };
      speak(data.reply);

      // Async fetch feedback
      const lastQuestion = messages[messages.length - 1]?.content;
      try {
        await getFeedback({
          question: lastQuestion,
          answer: text,
        });
      } catch {}

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("API transmission error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-darkbg text-white overflow-hidden selection:bg-accent-500/30">
      {/* Sleek header */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-darkbg-elevated z-10 shrink-0 mt-16">
        <div className="flex items-center gap-3">
          <Badge variant="accent" className="flex items-center gap-1.5 font-bold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            AI Interview Panel
          </Badge>
          {isInterviewStarted && messages.length > 0 && (
            <span className="text-xs font-mono text-white/40">
              Duration: <span className="text-white/80 font-bold">{formatTime(timeElapsed)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <RoleSelector
            role={role}
            setRole={setRole}
            disabled={isInterviewStarted}
          />
          {isInterviewStarted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("End current interview session? Progress will be reset.")) {
                  setIsInterviewStarted(false);
                  setMessages([]);
                  setTimeElapsed(0);
                  if (timerRef.current) clearInterval(timerRef.current);
                }
              }}
              className="text-xs"
            >
              End Session
            </Button>
          )}
        </div>
      </header>

      {/* Main Simulation Arena */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Glow gradients inside workspace */}
        <div className="absolute top-10 right-10 w-[300px] h-[150px] bg-accent-500/5 rounded-full blur-[80px] pointer-events-none" />

        {!isInterviewStarted ? (
          /* PRE-INTERVIEW SETUP VIEW */
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <Card variant="glass" className="p-8 sm:p-12 max-w-xl w-full text-center space-y-8 relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/10 animate-pulse-slow">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to begin your session?</h2>
                <p className="text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
                  Confirm your target position role. Ensure your camera is clear and voice parameters are active.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-left space-y-3 max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <span className="text-success-light font-bold">✔</span>
                  <span>Audio Speech Synthesis enabled</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <span className="text-success-light font-bold">✔</span>
                  <span>Web Speech Voice API checked</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <span className="text-success-light font-bold">✔</span>
                  <span>Simulated role: <span className="font-semibold text-accent-300">{role}</span></span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={startInterview}
                loading={loading}
                className="w-full max-w-sm justify-center py-3.5"
              >
                Initiate AI Session
              </Button>
            </Card>
          </div>
        ) : (
          /* ACTIVE INTERVIEW PANE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column - User Feed & Control Info */}
            <div className="w-full md:w-80 border-r border-white/5 p-6 flex flex-col gap-6 bg-darkbg-elevated/40 overflow-y-auto shrink-0">
              {/* Camera Frame */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white/50 tracking-wider uppercase">
                  <span>Candidate Feed</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
                <div className="aspect-[4/3] rounded-2xl bg-black border border-white/10 overflow-hidden relative shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] uppercase font-bold tracking-widest text-white/80">
                    Live Video
                  </div>
                </div>
              </div>

              {/* Speech Voice Decibel Waveform Indicator */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Speech Detector</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    listening ? "bg-accent-500/10 text-accent-300 border-accent-500/20" : "bg-white/5 text-white/40 border-white/10"
                  }`}>
                    {listening ? "LISTENING" : "STANDBY"}
                  </span>
                </div>

                {/* Simulated decibel sound wave bar */}
                <div className="h-6 flex items-center justify-center gap-1">
                  {listening ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-accent-500 w-1.5 rounded-full animate-bounce-slow"
                        style={{
                          height: `${Math.floor(Math.random() * 20) + 8}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))
                  ) : (
                    <div className="w-full bg-white/5 h-1 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Mic Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="text-xs text-white/40 space-y-2 mt-auto">
                <p className="font-semibold text-white/60 uppercase tracking-wider">Useful tips:</p>
                <p>💡 Speak clearly and structure your answers with the STAR method (Situation, Task, Action, Result).</p>
                <p>💡 Click the microphone button to activate speech detection, and click send once finished.</p>
              </div>
            </div>

            {/* Right Column - Chat Terminal */}
            <div className="flex-1 flex flex-col overflow-hidden bg-darkbg-elevated">
              {/* Message scroll workspace */}
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                <div className="max-w-3xl mx-auto">
                  <ChatBox messages={messages} />
                  
                  {loading && (
                    <div className="flex items-center gap-3 mt-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl mr-auto max-w-md animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">AI is processing feedback...</span>
                    </div>
                  )}

                  <div ref={bottomRef}></div>
                </div>
              </div>

              {/* Input console */}
              <div className="p-4 border-t border-white/5 bg-darkbg-elevated shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3 items-center relative">
                  <input
                    className="flex-1 px-4 py-3.5 bg-darkbg-input border border-white/5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/10 transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response or activate speech mic..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={loading}
                  />

                  {/* Speech Trigger */}
                  <button
                    onClick={listening ? stopListening : startListening}
                    disabled={loading}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      listening
                        ? "bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                    title={listening ? "Stop Speech Detection" : "Start Speech Detection"}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {listening ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      )}
                    </svg>
                  </button>

                  {/* Send Button */}
                  <Button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    variant="primary"
                    className="py-3 px-5 text-sm font-semibold rounded-xl"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}