import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../firebase";
import AudioWaveform from "../components/ui/AudioWaveform";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function VoiceInterview() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => { if (u) { setUser(u); setUid(u.uid); } });
    return () => unsub();
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Speech recognition not supported in this browser"); return; }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = () => { setListening(false); };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimTranscript("");
  }, []);

  const speak = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    synthRef.current.speak(utterance);
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/voice/questions`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setPhase("interview");
        setCurrentQ(0);
        setTranscript("");
        setResults([]);
        setTimeout(() => speak(data.questions[0].question), 500);
      } else setError("Failed to load questions");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/voice/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim(), question: questions[currentQ]?.question }),
      });
      const data = await res.json();
      if (data.analysis) {
        setResults((prev) => [...prev, { ...data.analysis, question: questions[currentQ]?.question, transcript: transcript.trim() }]);
      }
    } catch { setError("Failed to analyze"); }
    setTranscript("");
    setLoading(false);

    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      setTimeout(() => speak(questions[next].question), 300);
    } else {
      setPhase("results");
    }
  };

  const retryQuestion = () => {
    setTranscript("");
    speak(questions[currentQ]?.question);
  };

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Interview</h1>
          <p className="text-zinc-400 text-sm mt-1">Practice answering interview questions aloud with real-time speech analysis</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>}

        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center text-4xl">🎤</div>
            <p className="text-zinc-300 text-sm max-w-md mx-auto">Practice answering interview questions using your voice. Get feedback on content, clarity, and filler words.</p>
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
              <span>🎧 5 questions</span>
              <span>🎯 Real-time feedback</span>
              <span>📊 Speech analysis</span>
            </div>
            <button onClick={loadQuestions} disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mx-auto">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</> : "Start Voice Interview"}
            </button>
          </div>
        )}

        {/* Interview Phase */}
        {phase === "interview" && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-zinc-500">Question {currentQ + 1} of {questions.length}</span>
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < currentQ ? "bg-emerald-500" : i === currentQ ? "bg-cyan-500" : "bg-zinc-700"}`} />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm shrink-0">🎤</div>
                <div>
                  <p className="text-sm text-zinc-100 font-medium leading-relaxed">{questions[currentQ]?.question}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">{questions[currentQ]?.category}</span>
                  {questions[currentQ]?.tip && <p className="text-xs text-zinc-500 mt-2">💡 {questions[currentQ].tip}</p>}
                </div>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
              <AudioWaveform active={listening} label={listening ? "Recording..." : "Tap to speak"} />

              <div className="flex items-center justify-center gap-3">
                <button onClick={toggleListening}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    listening ? "bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/20" : "bg-zinc-800 border-2 border-zinc-700 hover:border-cyan-500/50"
                  }`}>
                  {listening ? <span className="text-red-400 text-xl">⏹</span> : <span className="text-emerald-400 text-xl">🎤</span>}
                </button>
                <button onClick={retryQuestion} className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all" title="Repeat question">
                  🔄
                </button>
              </div>

              {/* Live Transcript */}
              <div className="min-h-[80px] p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                {transcript || interimTranscript ? (
                  <p className="text-sm text-zinc-300">
                    {transcript}<span className="text-zinc-500">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600 italic">Your speech will appear here...</p>
                )}
              </div>

              {transcript.trim() && !listening && (
                <button onClick={submitAnswer} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : currentQ < questions.length - 1 ? "Next Question →" : "See Results"}
                </button>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Previous Answers</p>
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                      <span className="text-xs text-zinc-400 truncate max-w-[200px]">Q{i + 1}</span>
                      <span className="text-xs font-bold text-emerald-400">{r.overallScore}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && results.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Interview Complete</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{Math.round(results.reduce((a, r) => a + (r.overallScore || 0), 0) / results.length)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Avg Score</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{Math.round(results.reduce((a, r) => a + (r.contentScore || 0), 0) / results.length)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Content</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                  <p className="text-2xl font-bold text-amber-400">{Math.round(results.reduce((a, r) => a + (r.clarityScore || 0), 0) / results.length)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Clarity</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-center">
                  <p className="text-2xl font-bold text-teal-400">{Math.round(results.reduce((a, r) => a + (r.confidenceScore || 0), 0) / results.length)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Confidence</p>
                </div>
              </div>

              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-zinc-300">Q{i + 1}: {r.question}</p>
                      <span className="text-sm font-bold text-emerald-400">{r.overallScore}/10</span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{r.transcript}</p>
                    {r.fillerWordCount > 0 && (
                      <p className="text-[10px] text-amber-400">⚠ {r.fillerWordCount} filler words detected</p>
                    )}
                    {r.feedback && <p className="text-xs text-zinc-300">{r.feedback}</p>}
                    {r.strengths?.length > 0 && (
                      <div className="flex flex-wrap gap-1">{r.strengths.map((s, j) => <span key={j} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{s}</span>)}</div>
                    )}
                    {r.suggestedAnswer && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-indigo-500/20">
                        <p className="text-[10px] text-emerald-400 font-semibold mb-1">Suggested Answer</p>
                        <p className="text-xs text-zinc-300">{r.suggestedAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => { setPhase("setup"); setQuestions([]); setResults([]); setTranscript(""); }}
                className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition-all">
                Practice Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceInterview;
