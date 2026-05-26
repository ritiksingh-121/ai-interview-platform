import React, { useState, useEffect, useRef } from "react";
import ChatBox from "../components/ChatBox";
import RoleSelector from "../components/RoleSelector";
import { sendInterviewMessage, getFeedback } from "../api/api";

export default function InterviewPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // 🔽 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🎥 CAMERA FIXED
  useEffect(() => {
    if (!isInterviewStarted) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // 🔥 IMPORTANT
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    // 🔥 CLEANUP
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInterviewStarted]);

  // 🎤 Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);

      setTimeout(() => sendMessage(text), 500);
    };

    recognitionRef.current = recognition;
  }, []);

  // 🔊 Speak
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const cleanText = text.replace(/📌|⚡|🚀|\*|\n/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => recognitionRef.current?.start();
  const stopListening = () => recognitionRef.current?.stop();

  // 🚀 Start Interview
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
      console.error(err);
    }

    setLoading(false);
  };

  // 💬 Send Message (FIXED STATE BUG)
  const sendMessage = async (customInput) => {
    const text = customInput || input;
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated;
    });

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

      const lastQuestion = messages[messages.length - 1]?.content;

      try {
        await getFeedback({
          question: lastQuestion,
          answer: text,
        });
      } catch {}

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
        <h1 className="text-xl font-bold text-pink-500">AI Interview</h1>

        <RoleSelector
          role={role}
          setRole={setRole}
          disabled={messages.length > 0}
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 flex flex-col items-center">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center mt-20 gap-6">
            <h2 className="text-4xl font-bold text-pink-500">
              Start Your AI Interview 🚀
            </h2>

            <button
              onClick={startInterview}
              className="px-8 py-3 bg-purple-600 rounded-xl"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl flex gap-6">
            {/* 🎥 CAMERA */}
            <div className="w-72 bg-gray-900 p-3 rounded-xl">
              <p className="text-gray-400 mb-2">You</p>

             <video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  className="w-full h-48 object-cover rounded-lg bg-black"
/>
            </div>

            {/* 💬 CHAT */}
            <div className="flex-1 bg-gray-900 p-4 rounded-xl overflow-y-auto max-h-[70vh]">
              <ChatBox messages={messages} />

              {loading && (
                <p className="text-gray-400 mt-2 animate-pulse">
                  AI is thinking...
                </p>
              )}

              <div ref={bottomRef}></div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      {messages.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <input
            className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak or type..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={listening ? stopListening : startListening}
            className="px-4 bg-purple-600 rounded-lg"
          >
            🎤
          </button>

          <button
            onClick={() => sendMessage()}
            className="px-6 bg-pink-500 rounded-lg"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}