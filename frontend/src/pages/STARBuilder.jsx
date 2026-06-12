import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion, safeParseJSON } from "../api/api";

export default function STARBuilder() {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">STAR Story Builder</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">Build, refine, and score behavioral interview stories using the Situation-Task-Action-Result format.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2"><Badge variant="primary" className="mr-2">S</Badge> Situation</label>
            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Describe the context and background..." rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2"><Badge variant="warning" className="mr-2">T</Badge> Task</label>
            <textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder="What was your responsibility or goal?" rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2"><Badge variant="primary" className="mr-2">A</Badge> Action</label>
            <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="What specific steps did you take?" rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2"><Badge variant="success" className="mr-2">R</Badge> Result</label>
            <textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="What was the outcome? Use measurable data if possible." rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <Button variant="gradient" onClick={handleAnalyze} loading={loading} disabled={loading}>Analyze STAR Story</Button>
          {error && <p className="text-xs text-red-400 flex items-center gap-1.5"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">AI Analysis</label>
          <Card variant="glass" className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full py-16"><LoadingSpinner size="lg" /></div>
            ) : feedback ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Score</h3>
                  <span className={`text-2xl font-bold ${feedback.score >= 8 ? "text-emerald-400" : feedback.score >= 5 ? "text-amber-400" : "text-red-400"}`}>{feedback.score}/10</span>
                </div>
                <div className="w-full bg-zinc-800/60 rounded-full h-1.5"><div className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${feedback.score * 10}%` }} /></div>
                {feedback.strengths?.length > 0 && <div><h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4><ul className="space-y-1">{feedback.strengths.map((s, i) => <li key={i} className="text-sm text-zinc-400 flex items-start gap-2"><span className="text-emerald-400 shrink-0">✔</span>{s}</li>)}</ul></div>}
                {feedback.improvements?.length > 0 && <div><h4 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">Improvements</h4><ul className="space-y-1">{feedback.improvements.map((imp, i) => <li key={i} className="text-sm text-zinc-400 flex items-start gap-2"><span className="text-amber-400 shrink-0">→</span>{imp}</li>)}</ul></div>}
                <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Action Metrics:</span><Badge variant={feedback.actionMetrics ? "success" : "error"}>{feedback.actionMetrics ? "Present" : "Missing"}</Badge></div>
                {feedback.verbalPacingFeedback && <div><h4 className="text-xs font-medium text-pink-400 uppercase tracking-wider mb-2">Verbal Pacing</h4><p className="text-sm text-zinc-400">{feedback.verbalPacingFeedback}</p></div>}
                {feedback.improvedStory && <div><h4 className="text-xs font-medium text-pink-400 uppercase tracking-wider mb-2">Improved Story</h4><p className="text-sm text-zinc-100 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 leading-relaxed">{feedback.improvedStory}</p></div>}
                {feedback.followUpQuestions?.length > 0 && <div><h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Follow-up Questions to Expect</h4><ul className="space-y-1">{feedback.followUpQuestions.map((q, i) => <li key={i} className="text-sm text-zinc-400 flex items-start gap-2"><span className="text-pink-400 shrink-0">?</span>{q}</li>)}</ul></div>}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full"><p className="text-zinc-500 text-sm text-center">Your STAR analysis will appear here</p></div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
