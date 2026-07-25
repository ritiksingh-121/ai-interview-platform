import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import ExitConfirmationModal from "../components/ui/ExitConfirmationModal";
import useExitHandler from "../hooks/useExitHandler";
import {
  getTodayChallenge,
  submitChallenge,
  getChallengeStreak,
  getChallengeHistory,
} from "../api/api";

const TYPE_COLORS = {
  INTERVIEW: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  CODING: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  HR: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  CS_FUNDAMENTALS: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const TYPE_ICONS = {
  INTERVIEW: "🎤",
  CODING: "💻",
  HR: "🤝",
  CS_FUNDAMENTALS: "🧠",
};

function DailyChallenge() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const answerRef = useRef(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        setUid(u.uid);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    loadAll();
  }, [uid]);

  const loadAll = async () => {
    setLoading(true);
    const [challengeRes, streakRes, historyRes] = await Promise.all([
      getTodayChallenge(uid),
      getChallengeStreak(uid),
      getChallengeHistory(uid),
    ]);
    if (challengeRes) {
      setChallenge(challengeRes.challenge);
      if (challengeRes.challenge.completed) {
        setSubmitted(true);
        const subs = challengeRes.challenge.submissions;
        if (subs?.length) {
          try {
            const fb = JSON.parse(subs[0].feedback);
            setResult(fb);
          } catch {
            setResult({ feedback: subs[0].feedback, score: subs[0].score });
          }
        }
      }
    }
    if (streakRes) setStreakData(streakRes);
    if (historyRes) setHistory(historyRes.challenges || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !challenge) return;
    setSubmitting(true);
    setError("");
    const res = await submitChallenge({
      challengeId: challenge.id,
      firebaseUid: uid,
      answer: answer.trim(),
    });
    if (res) {
      setSubmitted(true);
      setResult({
        score: res.score,
        feedback: res.feedback,
        strengths: res.strengths,
        improvements: res.improvements,
      });
      setStreakData((prev) => ({
        ...prev,
        currentStreak: res.streak,
        completedToday: true,
        totalCompleted: (prev?.totalCompleted || 0) + 1,
      }));
    } else {
      setError("Failed to submit. Try again.");
    }
    setSubmitting(false);
  };

  const last7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const found = history.find((h) => {
        const hd = new Date(h.date);
        hd.setHours(0, 0, 0, 0);
        return hd.getTime() === d.getTime() && h.completed;
      });
      const isToday = i === 0;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.push({
        label: isToday ? "Today" : dayNames[d.getDay()],
        date: d,
        completed: !!found,
        score: found?.score || null,
        isToday,
      });
    }
    return days;
  };

  const navigate = useNavigate();

  const { showExitDialog, openExitDialog, closeExitDialog, handleConfirmExit } = useExitHandler({
    navigateTo: "/dashboard",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Streak Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
            <p className="text-zinc-400 text-sm mt-1">Complete today's challenge to keep your streak</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openExitDialog} className="px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-medium">Exit</button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-2xl font-bold text-orange-400">{streakData?.currentStreak || 0}</p>
                <p className="text-[10px] text-orange-400/60 uppercase tracking-wider">Day Streak</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center">
              <p className="text-2xl font-bold text-emerald-400">{streakData?.totalCompleted || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Done</p>
            </div>
          </div>
        </div>

        {/* Last 7 Days Mini Calendar */}
        <div className="flex items-center gap-2 justify-center">
          {last7Days().map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                day.isToday
                  ? "bg-cyan-500/10 border-cyan-500/40"
                  : day.completed
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-zinc-800/30 border-zinc-800/50"
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${day.isToday ? "text-emerald-400" : "text-zinc-500"}`}>
                {day.label}
              </span>
              {day.completed ? (
                <span className="text-emerald-400 text-lg">✓</span>
              ) : day.isToday ? (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-800" />
              )}
              {day.score && (
                <span className="text-[10px] text-zinc-400">{day.score}/10</span>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Today's Challenge Card */}
        {challenge && !submitted && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  TYPE_COLORS[challenge.type] || "text-zinc-400 bg-zinc-800 border-zinc-700"
                }`}
              >
                {TYPE_ICONS[challenge.type] || "📝"} {challenge.type.replace("_", " ")}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{challenge.title}</h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{challenge.description}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300">Your Answer</label>
              <textarea
                ref={answerRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        )}

        {/* Results Card */}
        {submitted && result && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Results</h2>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-emerald-400">{result.score}</span>
                <span className="text-zinc-500 text-sm">/10</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 via-cyan-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${(result.score || 0) * 10}%` }}
              />
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-2">Feedback</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{result.feedback}</p>
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Strengths</h3>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Improvements</h3>
                <ul className="space-y-1.5">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-amber-400 mt-0.5">→</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setSubmitted(false);
                setAnswer("");
                setResult(null);
                loadAll();
              }}
              className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-700 transition-all"
            >
              Next Challenge
            </button>
          </div>
        )}

        {/* Already Completed */}
        {challenge?.completed && submitted && !result && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold text-white mb-1">Today's Challenge Completed</h2>
            <p className="text-zinc-400 text-sm">Come back tomorrow for a new challenge!</p>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span>{TYPE_ICONS[h.type] || "📝"}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{h.title}</p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(h.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" · "}
                        {h.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.completed ? (
                      <>
                        <span className="text-sm font-bold text-emerald-400">{h.score}/10</span>
                        <span className="text-emerald-400 text-sm">✓</span>
                      </>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ExitConfirmationModal
        isOpen={showExitDialog}
        onContinue={closeExitDialog}
        onExit={handleConfirmExit}
      />
    </div>
  );
}

export default DailyChallenge;
