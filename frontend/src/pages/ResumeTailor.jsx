import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion, safeParseJSON } from "../api/api";

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
    } catch {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Resume Tailor</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">Paste your resume and a target job description. Our AI will analyze ATS fit, rewrite bullet points, and surface missing keywords.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Your Resume</label>
          <textarea value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste your resume content here..." rows={8} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed min-h-[200px]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Job Description</label>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the job description here..." rows={8} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed min-h-[200px]" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <Button variant="gradient" onClick={handleAnalyze} loading={loading} disabled={loading}>Analyze & Optimize</Button>
        {error && <p className="text-xs text-red-400 flex items-center gap-1.5"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</p>}
      </div>

      {loading && <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>}

      {result && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">ATS Match Score</h2>
            <Card variant="glass" className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#grad)" strokeWidth="3" strokeDasharray={`${result.atsScore}, 100`} strokeLinecap="round" />
                    <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                  </svg>
                  <span className="absolute text-xl sm:text-3xl font-bold text-zinc-100">{result.atsScore}%</span>
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <p className="text-sm text-zinc-400">
                    {result.atsScore >= 80 ? "Strong match — your resume is well-aligned with this role." : result.atsScore >= 60 ? "Moderate match — some optimization needed." : "Low match — significant improvements recommended."}
                  </p>
                  <div className="w-full bg-zinc-800/60 rounded-full h-2 max-w-xs">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full" style={{ width: `${result.atsScore}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {result.keywordsFound?.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Keyword Analysis</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card variant="glass" className="p-4 sm:p-6">
                  <h3 className="text-xs font-medium text-emerald-400 mb-3 flex items-center gap-2"><span>✔</span> Keywords Found</h3>
                  <div className="flex flex-wrap gap-2">{result.keywordsFound.map((kw, i) => <Badge key={i} variant="success">{kw}</Badge>)}</div>
                </Card>
                <Card variant="glass" className="p-4 sm:p-6">
                  <h3 className="text-xs font-medium text-amber-400 mb-3 flex items-center gap-2"><span>!</span> Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">{result.keywordsMissing.map((kw, i) => <Badge key={i} variant="warning">{kw}</Badge>)}</div>
                </Card>
              </div>
            </section>
          )}

          {result.bulletRewrites?.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Optimized Bullet Points</h2>
              <div className="space-y-4">
                {result.bulletRewrites.map((item, i) => (
                  <Card key={i} variant="glass" className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Original</p>
                        <p className="text-sm text-zinc-400 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">{item.original}</p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                      <div>
                        <p className="text-xs font-medium text-pink-400 uppercase tracking-wider mb-1.5">Optimized</p>
                        <p className="text-sm text-zinc-100 bg-pink-500/5 p-3 rounded-lg border border-pink-500/20">{item.optimized}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {result.skillsGap?.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Skills Gap</h2>
              <Card variant="glass" className="p-4 sm:p-6">
                <ul className="space-y-2">{result.skillsGap.map((skill, i) => <li key={i} className="flex items-center gap-3 text-sm text-zinc-400"><span className="text-red-400 shrink-0">✘</span>{skill}</li>)}</ul>
              </Card>
            </section>
          )}

          {result.suggestions?.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">Suggestions</h2>
              <Card variant="glass" className="p-4 sm:p-6">
                <ul className="space-y-3">{result.suggestions.map((s, i) => <li key={i} className="flex items-start gap-3 text-sm text-zinc-400"><span className="text-pink-400 mt-0.5 shrink-0">→</span>{s}</li>)}</ul>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
