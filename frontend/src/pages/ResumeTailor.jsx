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

export default function ResumeTailor() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await getCompletion({
        systemPrompt: `You are an expert ATS resume analyst and career coach. Analyze the given resume against the job description and return structured JSON only — no markdown, no code fences, no explanation. Use this exact format:
{
  "atsScore": <number 0-100>,
  "keywordsFound": [<strings>],
  "keywordsMissing": [<strings>],
  "bulletRewrites": [
    { "original": "...", "optimized": "..." }
  ],
  "skillsGap": [<strings>],
  "suggestions": [<strings>]
}`,
        userPrompt: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDesc}`,
      });

      const parsed = safeParseJSON(res.reply);
      if (!parsed) {
        setError("Failed to parse AI response. Please try again.");
        return;
      }
      setResult(parsed);
    } catch (err) {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkbg text-white pt-24 pb-16 px-6 max-w-7xl mx-auto selection:bg-accent-500/30">
      <div className="absolute top-[10vh] left-10 w-[500px] h-[250px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10vh] right-10 w-[400px] h-[200px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Resume Tailor
            </span>
          </h1>
          <p className="text-white/60 mt-2 text-sm sm:text-base max-w-2xl">
            Paste your resume and a target job description. Our AI will analyze ATS fit, rewrite bullet points, and surface missing keywords.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid lg:grid-cols-2 gap-6 mb-8"
        >
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Your Resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={14}
              className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Job Description
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
              rows={14}
              className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
          <Button
            variant="primary"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading}
          >
            Analyze & Optimize
          </Button>
          {error && (
            <p className="text-xs text-error-light flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </motion.div>

        {loading && (
          <motion.div variants={itemVariants} className="flex justify-center py-20">
            <LoadingSpinner size="xl" />
          </motion.div>
        )}

        {result && (
          <motion.div variants={itemVariants} className="space-y-8">
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-4">ATS Match Score</h2>
              <Card variant="glass" className="p-8">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.08" />
                      <circle
                        cx="18" cy="18" r="15.5"
                        fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth="3"
                        strokeDasharray={`${result.atsScore}, 100`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-3xl font-bold">{result.atsScore}%</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">
                      {result.atsScore >= 80
                        ? "Strong match — your resume is well-aligned with this role."
                        : result.atsScore >= 60
                          ? "Moderate match — some optimization needed."
                          : "Low match — significant improvements recommended."}
                    </p>
                    <div className="w-full bg-white/5 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${result.atsScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {result.keywordsFound.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4">Keyword Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card variant="glass" className="p-6">
                    <h3 className="text-sm font-semibold text-success-light mb-3 flex items-center gap-2">
                      <span>✔</span> Keywords Found
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsFound.map((kw, i) => (
                        <Badge key={i} variant="success">{kw}</Badge>
                      ))}
                    </div>
                  </Card>
                  <Card variant="glass" className="p-6">
                    <h3 className="text-sm font-semibold text-warning-light mb-3 flex items-center gap-2">
                      <span>!</span> Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsMissing.map((kw, i) => (
                        <Badge key={i} variant="warning">{kw}</Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </section>
            )}

            {result.bulletRewrites.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4">Optimized Bullet Points</h2>
                <div className="space-y-4">
                  {result.bulletRewrites.map((item, i) => (
                    <Card key={i} variant="glass" className="p-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Original</p>
                          <p className="text-sm text-white/70 bg-white/[0.02] p-3 rounded-lg border border-white/5">{item.original}</p>
                        </div>
                        <div className="flex items-center gap-2 text-white/20">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-1.5">Optimized</p>
                          <p className="text-sm text-white bg-accent-500/5 p-3 rounded-lg border border-accent-500/20">{item.optimized}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {result.skillsGap.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4">Skills Gap</h2>
                <Card variant="glass" className="p-6">
                  <ul className="space-y-2">
                    {result.skillsGap.map((skill, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                        <span className="text-error-light">✘</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            {result.suggestions.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4">Suggestions</h2>
                <Card variant="glass" className="p-6">
                  <ul className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                        <span className="text-accent-400 mt-0.5 shrink-0">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
