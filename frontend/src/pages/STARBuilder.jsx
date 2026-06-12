import { motion } from "framer-motion";
import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion, safeParseJSON } from "../api/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

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
    } catch (err) {
      setError("Failed to analyze STAR story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkbg text-white pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto selection:bg-accent-500/30">
      <div className="hidden md:block absolute top-[10vh] left-10 w-[500px] h-[250px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="hidden md:block absolute bottom-[10vh] right-10 w-[400px] h-[200px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              STAR Story Builder
            </span>
          </h1>
          <p className="text-white/60 mt-2 text-sm sm:text-base max-w-2xl">
            Build, refine, and score behavioral interview stories using the Situation-Task-Action-Result format.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                <Badge variant="accent" className="mr-2">S</Badge> Situation
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Describe the context and background..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                <Badge variant="warning" className="mr-2">T</Badge> Task
              </label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What was your responsibility or goal?"
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                <Badge variant="primary" className="mr-2">A</Badge> Action
              </label>
              <textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What specific steps did you take?"
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                <Badge variant="success" className="mr-2">R</Badge> Result
              </label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What was the outcome? Use measurable data if possible."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAnalyze}
              loading={loading}
              disabled={loading}
            >
              Analyze STAR Story
            </Button>
            {error && (
              <p className="text-xs text-error-light flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              AI Analysis
            </label>
            <Card variant="glass" className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : feedback ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Score</h3>
                    <span className={`text-2xl font-bold ${
                      feedback.score >= 8 ? "text-success-light" : feedback.score >= 5 ? "text-warning-light" : "text-error-light"
                    }`}>
                      {feedback.score}/10
                    </span>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-accent-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${feedback.score * 10}%` }}
                    />
                  </div>

                  {feedback.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-success-light uppercase tracking-wider mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {feedback.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-success-light shrink-0">✔</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.improvements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-warning-light uppercase tracking-wider mb-2">Improvements</h4>
                      <ul className="space-y-1">
                        {feedback.improvements.map((imp, i) => (
                          <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-warning-light shrink-0">→</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Action Metrics:</span>
                    <Badge variant={feedback.actionMetrics ? "success" : "error"}>
                      {feedback.actionMetrics ? "Present" : "Missing"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-2">Verbal Pacing</h4>
                    <p className="text-sm text-white/70">{feedback.verbalPacingFeedback}</p>
                  </div>

                  {feedback.improvedStory && (
                    <div>
                      <h4 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Improved Story</h4>
                      <p className="text-sm text-white/80 bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed">
                        {feedback.improvedStory}
                      </p>
                    </div>
                  )}

                  {feedback.followUpQuestions && feedback.followUpQuestions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Follow-up Questions to Expect</h4>
                      <ul className="space-y-1">
                        {feedback.followUpQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                            <span className="text-accent-400 shrink-0">?</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/30 text-sm text-center">
                    Your STAR analysis will appear here
                  </p>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
