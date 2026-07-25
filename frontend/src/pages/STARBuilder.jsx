import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ScoreGauge from "../components/ui/ScoreGauge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion, safeParseJSON } from "../api/api";
import ExitConfirmationModal from "../components/ui/ExitConfirmationModal";
import useExitHandler from "../hooks/useExitHandler";

export default function STARBuilder() {
  const navigate = useNavigate();
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!situation.trim() || !task.trim() || !action.trim() || !result.trim()) {
      setError("Please fill in all four STAR components.");
      return;
    }
    setError("");
    setLoading(true);
    setFeedback(null);

    try {
      const starStory = `Situation: ${situation}\nTask: ${task}\nAction: ${action}\nResult: ${result}`;
      const res = await getCompletion({
        systemPrompt: `You are an expert behavioral interview coach specializing in the STAR method. Analyze the given STAR story and return structured JSON only — no markdown, no code fences, no explanation. Use this exact format:
{
  "score": <number 0-10>,
  "strengths": [<strings>],
  "improvements": [<strings>],
  "actionMetrics": <boolean>,
  "verbalPacingFeedback": "<string>",
  "improvedStory": "<string>",
  "followUpQuestions": [<strings>]
}`,
        userPrompt: starStory,
      });

      const parsed = safeParseJSON(res.reply);
      if (!parsed) {
        setError("Failed to parse AI response. Please try again.");
        return;
      }
      setFeedback(parsed);
    } catch {
      setError("Failed to analyze STAR story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { showExitDialog, openExitDialog, closeExitDialog, handleConfirmExit } = useExitHandler({
    navigateTo: "/dashboard",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32 pb-safe px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 flex-1">
        <Badge variant="cyan" className="px-3 py-1 uppercase tracking-wider text-[10px]">
          🎯 Behavioral Story Coach
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">STAR Story Builder</h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Refine your behavioral experience stories using the Situation-Task-Action-Result methodology. Receive real-time AI scoring and improved narrative scripts.
        </p>
      </motion.div>
        <button onClick={openExitDialog} className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-medium shrink-0 self-start">Exit</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* INPUT FORM */}
        <Card variant="glass" className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              S — Situation (Context & Challenge)
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe the company context, team setup, and specific project problem..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              T — Task (Your Responsibility)
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What was your specific goal or assignment in this situation?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              A — Action (Steps You Personally Took)
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Detail the technical decisions, code implementations, or leadership actions..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              R — Result (Measurable Outcome & Impact)
            </label>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="What changed? Quantify metric improvements (e.g. reduced latency by 35%)..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
            />
          </div>

          <Button
            variant="green"
            size="lg"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading}
            className="w-full justify-center uppercase tracking-wider text-xs py-3.5"
          >
            Analyze & Score STAR Story
          </Button>

          {error && <p className="text-xs text-red-400">⚠️ {error}</p>}
        </Card>

        {/* OUTPUT ANALYSIS */}
        <Card variant="highlight" className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Behavioral Analysis Report
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : feedback ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center py-2">
                  <ScoreGauge score={feedback.score} max={10} size={130} strokeWidth={9} label="STAR Score" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Strengths</h4>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {feedback.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Suggested Improvements</h4>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {feedback.improvements?.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400">→</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>

                {feedback.improvedStory && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Polished Story Script</h4>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">{feedback.improvedStory}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-64 text-zinc-500 text-xs space-y-2">
                <span className="text-3xl">🎯</span>
                <p>Fill out Situation, Task, Action, and Result to receive a detailed STAR score report.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <ExitConfirmationModal
        isOpen={showExitDialog}
        onContinue={closeExitDialog}
        onExit={handleConfirmExit}
      />
    </div>
  );
}
