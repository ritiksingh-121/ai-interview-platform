import { useState, useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";
import RoleSelector from "../components/RoleSelector";
import { sendInterviewMessage, getFeedback } from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { useNavigate } from "react-router-dom";

export default function InterviewPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const bottomRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

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
        if (videoRef.current) videoRef.current.srcObject = stream;
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
      const data = await sendInterviewMessage({ role, message: "Start interview", history: [] });
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
      const data = await sendInterviewMessage({ role, message: text, history: messages });
      const aiMsg = { role: "assistant", content: data.reply };
      speak(data.reply);
      const lastQuestion = messages[messages.length - 1]?.content;
      try { await getFeedback({ question: lastQuestion, answer: text }); } catch {}
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) { console.error("API transmission error:", err); }
    setLoading(false);
  };

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* HEADER */}
      <header className="shrink-0 mt-16 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="primary" className="flex items-center gap-1 font-bold tracking-wide text-xs whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="hidden xs:inline">AI Interview</span>
              <span className="xs:hidden">AI</span>
            </Badge>
            {isInterviewStarted && messages.length > 0 && (
              <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">
                <span className="text-zinc-100 font-medium">{formatTime(timeElapsed)}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <RoleSelector role={role} setRole={setRole} disabled={isInterviewStarted} />
            {isInterviewStarted && (
              <Button variant="outline" size="sm" onClick={() => {
                if (confirm("End current interview session? Progress will be reset.")) {
                  setIsInterviewStarted(false);
                  setMessages([]);
                  setTimeElapsed(0);
                  if (timerRef.current) clearInterval(timerRef.current);
                }
              }} className="text-xs px-2.5 py-1.5 whitespace-nowrap">
                End
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {!isInterviewStarted ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <Card variant="glass" className="p-5 sm:p-8 md:p-12 max-w-xl w-full text-center space-y-5 sm:space-y-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Ready to begin?</h2>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">Confirm your target role. Ensure camera and microphone are ready.</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-left space-y-1.5 sm:space-y-2 max-w-sm mx-auto">
                <div className="flex items-center gap-2 text-xs text-zinc-400"><span className="text-emerald-400 font-medium shrink-0">✔</span><span>Speech synthesis enabled</span></div>
                <div className="flex items-center gap-2 text-xs text-zinc-400"><span className="text-emerald-400 font-medium shrink-0">✔</span><span>Role: <span className="font-medium text-pink-400">{role}</span></span></div>
              </div>
              <Button variant="gradient" size="lg" onClick={startInterview} loading={loading} className="w-full max-w-sm justify-center py-3 text-sm">Start Session</Button>
            </Card>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-zinc-800 p-5 flex flex-col gap-5 bg-zinc-900/40 overflow-y-auto shrink-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider"><span>Candidate Feed</span><span className="relative flex h-2 w-2"><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span></div>
                <div className="aspect-video rounded-lg bg-black border border-zinc-800 overflow-hidden relative">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-zinc-100">Live</div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Speech</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${listening ? "bg-pink-500/10 text-pink-300 border-pink-500/20" : "bg-zinc-900/60 text-zinc-500 border-zinc-800"}`}>{listening ? "LIVE" : "STANDBY"}</span>
                </div>
                <div className="h-5 flex items-center justify-center gap-0.5">
                  {listening ? (
                    Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-pink-400 w-1 rounded-full" style={{ height: `${Math.floor(Math.random() * 16) + 6}px` }} />)
                  ) : (
                    <div className="w-full bg-zinc-800/60 h-0.5 rounded-full" />
                  )}
                </div>
              </div>
              <div className="text-xs text-zinc-500 space-y-1.5">
                <p className="font-medium text-zinc-500 uppercase tracking-wider">Tips</p>
                <p>Speak clearly and use STAR method (Situation, Task, Action, Result).</p>
                <p>Click the microphone to start speech detection.</p>
              </div>
            </div>

            {/* Chat + Input */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/30">
              <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                <div className="max-w-3xl mx-auto">
                  <ChatBox messages={messages} />
                  {loading && (
                    <div className="flex items-center gap-3 mt-6 p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg mr-auto max-w-md">
                      <LoadingSpinner size="sm" />
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">AI thinking...</span>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3 items-center">
                  <input
                    className="flex-1 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={loading}
                  />
                  <button
                    onClick={listening ? stopListening : startListening}
                    disabled={loading}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center shrink-0 cursor-pointer ${listening ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {listening ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
                    </svg>
                  </button>
                  <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} variant="primary" className="py-3 px-5 text-sm font-medium">Send</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE ACTIVE INTERVIEW */}
        {isInterviewStarted && (
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-3 pt-2 pb-1.5 bg-zinc-900/60 border-b border-zinc-800">
              <div className="flex items-start gap-2">
                <div className="relative w-[30%] shrink-0">
                  <div className="aspect-video rounded-lg bg-black border border-zinc-800 overflow-hidden relative">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 border border-zinc-800 text-[8px] uppercase font-bold tracking-widest text-zinc-100">Live</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-3 pt-0.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-100 truncate">{role}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-zinc-500">{formatTime(timeElapsed)}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${listening ? "bg-pink-500/15 text-pink-300" : "bg-zinc-900/60 text-zinc-500"}`}>
                        <span className={`w-1 h-1 rounded-full ${listening ? "bg-pink-400" : "bg-zinc-600"}`} />
                        {listening ? "LIVE" : "MIC"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowTips(!showTips)} className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors" aria-label="Toggle tips">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>
              </div>
              {showTips && <div className="mt-1.5 px-2.5 py-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">Use STAR method. Click mic to speak, then Send.</div>}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
              <div className="max-w-3xl mx-auto">
                <ChatBox messages={messages} />
                {loading && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded mr-auto max-w-xs">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-zinc-500 font-medium">AI thinking...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="shrink-0 px-3 py-2.5 border-t border-zinc-800 bg-zinc-900/80 pb-safe">
              <div className="flex gap-2 items-center max-w-3xl mx-auto">
                <input
                  className="flex-1 px-3.5 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all min-h-[42px]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type or tap mic..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading}
                />
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={loading}
                  className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg border transition-all shrink-0 cursor-pointer ${listening ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"}`}
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {listening ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
                  </svg>
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg transition-all shrink-0 cursor-pointer ${loading || !input.trim() ? "bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white/40" : "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 shadow-lg shadow-pink-500/20"}`}
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
