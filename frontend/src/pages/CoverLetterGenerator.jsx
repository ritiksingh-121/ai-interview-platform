import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Toast from "../components/ui/Toast";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion } from "../api/api";

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim() || !skills.trim()) {
      setError("Please fill in all input fields.");
      return;
    }
    setError("");
    setLoading(true);
    setCoverLetter("");

    try {
      const res = await getCompletion({
        systemPrompt: `You are an expert cover letter writer. Write a high-converting, ${tone} cover letter tailored to the given role and company. Use the candidate's skills to craft compelling narratives. Return ONLY the cover letter text — no preamble, no explanation, no markdown formatting.`,
        userPrompt: `Job Title: ${jobTitle}\nCompany: ${company}\nKey Skills: ${skills}\n\nWrite a ${tone} cover letter.`,
      });
      setCoverLetter(res.reply);
    } catch {
      setError("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "concise", label: "Concise" },
    { value: "storytelling", label: "Storytelling" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      <Toast show={toast} message="Cover Letter copied to clipboard!" type="success" />

      {/* HERO HEADER */}
      <section className="relative pt-32 pb-10 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-950/20 to-transparent" />
          <div className="absolute top-10 right-1/4 w-64 h-40 rounded-full bg-indigo-600/8 blur-[80px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Badge variant="cyan" className="px-3 py-1 uppercase tracking-wider text-[10px]">
            ✉️ AI Letter Generator
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Cover Letter <span className="gradient-accent-text">Generator</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Craft high-converting, role-specific cover letters tailored to your target company and skills in seconds.
          </p>
        </motion.div>
      </section>

      <div className="px-4 sm:px-8 max-w-7xl mx-auto pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* INPUT FORM */}
          <Card variant="glass" className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Target Job Title
              </label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Vercel, Google"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Your Top Skills &amp; Highlights
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, GraphQL, System Design, Team Mentorship"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15 resize-y leading-relaxed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Letter Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      tone === t.value
                        ? "bg-cyan-500/20 border-cyan-400 text-emerald-400 glow-cyan"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="green"
              size="lg"
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
              className="w-full justify-center uppercase tracking-wider text-xs py-3.5"
            >
              Generate Cover Letter
            </Button>

            {error && <p className="text-xs text-red-400">⚠️ {error}</p>}
          </Card>

          {/* OUTPUT DISPLAY */}
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/10 to-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 min-h-[400px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Output Preview
                  </span>
                </div>
                {coverLetter && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                    📋 Copy Text
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs text-zinc-500 animate-pulse">Crafting your cover letter…</p>
                </div>
              ) : coverLetter ? (
                <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[450px] overflow-y-auto pr-2">
                  {coverLetter}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-64 text-zinc-500 text-xs space-y-3">
                  <span className="text-4xl">✉️</span>
                  <p>Fill out the form and click generate to craft your customized cover letter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
