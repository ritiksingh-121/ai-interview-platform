import { useState, useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";
import RoleSelector from "../components/RoleSelector";
import CompanySelector from "../components/CompanySelector";
import PersonalitySelector from "../components/PersonalitySelector";
import { sendInterviewMessage, getFeedback } from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import AudioWaveform from "../components/ui/AudioWaveform";
import TypingIndicator from "../components/ui/TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function InterviewPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("Frontend Developer");
  const [company, setCompany] = useState("GENERAL");
  const [personality, setPersonality] = useState("STRICT");
  const [loading, setLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const bottomRef = useRef(null);
  const videoRefDesktop = useRef(null);
  const videoRefMobile = useRef(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); }, []);

  useEffect(() => {
    if (isInterviewStarted && messages.length > 0) {
      timerRef.current = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isInterviewStarted, messages]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isInterviewStarted) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRefDesktop.current) videoRefDesktop.current.srcObject = stream;
        if (videoRefMobile.current) videoRefMobile.current.srcObject = stream;
      } catch (err) { console.error("Camera access error:", err); }
    };
    startCamera();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop()); };
  }, [isInterviewStarted]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { setListening(true); listeningRef.current = true; };
    recognition.onend = () => { setListening(false); listeningRef.current = false; };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (!event.results[0].isFinal) return;
      if (text === lastTranscriptRef.current) return;
      lastTranscriptRef.current = text;
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    recognition.onerror = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      try { recognition.abort(); } catch {}
      recognition = null;
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; }
    };
  }, []);

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
      if (wasListening) setTimeout(() => { if (!isSpeakingRef.current) startListening(); }, 400);
      isSpeakingRef.current = false;
    };
  };

  const abortListening = () => { try { recognitionRef.current?.abort(); } catch {} };

  const startListening = () => {
    lastTranscriptRef.current = "";
    if (recognitionRef.current) { try { recognitionRef.current.start(); return; } catch { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; } }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const fresh = new SpeechRecognition();
    fresh.lang = "en-US";
    fresh.continuous = false;
    fresh.interimResults = false;
    fresh.onstart = () => { setListening(true); listeningRef.current = true; };
    fresh.onend = () => { setListening(false); listeningRef.current = false; };
    fresh.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (!event.results[0].isFinal) return;
      if (text === lastTranscriptRef.current) return;
      lastTranscriptRef.current = text;
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    fresh.onerror = () => { if (recognitionRef.current === fresh) recognitionRef.current = null; };
    recognitionRef.current = fresh;
    try { fresh.start(); } catch {}
  };

  const stopListening = () => { try { recognitionRef.current?.stop(); } catch {} };

  const startInterview = async () => {
    setLoading(true);
    setIsInterviewStarted(true);
    try {
      const data = await sendInterviewMessage({
        role,
        message: "Start interview",
        history: [],
        company,
        personality,
      });
      setMessages([{ role: "assistant", content: data.reply }]);
      speak(data.reply);
    } catch (err) { console.error("Failed to start session:", err); }
    setLoading(false);
  };

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
        company,
        personality,
      });
      const aiMsg = { role: "assistant", content: data.reply };
      speak(data.reply);
      const lastQuestion = messages[messages.length - 1]?.content;
      try { await getFeedback({ question: lastQuestion, answer: text }); } catch {}
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) { console.error("API transmission error:", err); }
    setLoading(false);
  };

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden pt-16">
      <header className="shrink-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <Badge variant={isInterviewStarted ? "live" : "primary"} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isInterviewStarted ? "bg-cyan-400 animate-ping" : "bg-indigo-400"}`} />
              <span className="font-bold uppercase tracking-wider">{isInterviewStarted ? "Live Session" : "AI Mock Workspace"}</span>
            </Badge>
            {isInterviewStarted && (
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
                ⏱ {formatTime(timeElapsed)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isInterviewStarted && (
              <>
                <CompanySelector company={company} setCompany={setCompany} disabled={isInterviewStarted} />
                <PersonalitySelector personality={personality} setPersonality={setPersonality} disabled={isInterviewStarted} />
              </>
            )}
            <RoleSelector role={role} setRole={setRole} disabled={isInterviewStarted} />
            {isInterviewStarted && (
              <>
                <Button
                  variant="green"
                  size="sm"
                  onClick={() => {
                    navigate("/feedback", {
                      state: {
                        messages,
                        interviewId: null,
                      },
                    });
                  }}
                >
                  Get Feedback
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("End current interview session? Progress will be reset.")) {
                      setIsInterviewStarted(false);
                      setMessages([]);
                      setTimeElapsed(0);
                      if (timerRef.current) clearInterval(timerRef.current);
                    }
                  }}
                >
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {!isInterviewStarted ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto bg-glow-accent">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl w-full"
            >
              <Card variant="highlight" className="p-8 sm:p-12 text-center space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-green flex items-center justify-center mx-auto shadow-2xl glow-cyan">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Start AI Interview</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
                    Select your target role, company, and interviewer personality. The AI will adapt questions and style accordingly.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-left space-y-2.5 max-w-md mx-auto text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500 font-medium">Role:</span>
                    <Badge variant="cyan">{role}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500 font-medium">Company:</span>
                    <Badge variant="green">{company}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500 font-medium">Personality:</span>
                    <Badge variant="accent">{personality}</Badge>
                  </div>
                </div>

                <Button variant="live" size="lg" onClick={startInterview} loading={loading} className="w-full justify-center text-sm uppercase tracking-wider py-3.5">
                  Launch Interview Environment
                </Button>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 md:flex-row overflow-hidden">
            <div className="w-80 border-r border-zinc-800/80 p-5 flex flex-col gap-6 bg-zinc-950/60 overflow-y-auto shrink-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Candidate Feed</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                </div>
                <div className="aspect-video rounded-xl bg-black border border-zinc-800 overflow-hidden relative shadow-lg">
                  <video ref={videoRefDesktop} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                </div>
              </div>

              <AudioWaveform active={listening} label="Speech Visualizer" />

              <Card variant="glass" className="p-4 space-y-2 text-xs text-zinc-400">
                <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">Session Info</h4>
                <p>Company: <span className="text-zinc-300">{company}</span></p>
                <p>Personality: <span className="text-zinc-300">{personality}</span></p>
                <p>Role: <span className="text-zinc-300">{role}</span></p>
              </Card>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/40">
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                <div className="max-w-3xl mx-auto space-y-4">
                  <ChatBox messages={messages} />
                  {loading && (
                    <div className="mt-4">
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3 items-center">
                  <input
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response or use voice input..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={loading}
                  />
                  <button
                    onClick={listening ? stopListening : startListening}
                    disabled={loading}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      listening
                        ? "bg-cyan-500/20 border-cyan-400 text-emerald-400 glow-cyan animate-pulse"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                    }`}
                    title={listening ? "Stop voice input" : "Start voice input"}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} variant="green" className="py-3 px-6 text-sm font-semibold">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isInterviewStarted && (
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-3 pt-2 pb-2 bg-zinc-900/80 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-24 aspect-video rounded-lg bg-black border border-zinc-800 overflow-hidden relative shrink-0">
                  <video ref={videoRefMobile} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{role}</p>
                  <p className="text-[11px] font-mono text-zinc-400">⏱ {formatTime(timeElapsed)}</p>
                </div>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`p-2.5 rounded-lg border ${listening ? "bg-cyan-500/20 border-cyan-400 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              <ChatBox messages={messages} />
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950 pb-safe">
              <div className="flex gap-2 items-center">
                <input
                  className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading}
                />
                <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} variant="green" className="py-2.5 px-4 text-xs">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
