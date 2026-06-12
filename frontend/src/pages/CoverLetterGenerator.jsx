import { motion } from "framer-motion";
import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion } from "../api/api";

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

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim() || !skills.trim()) {
      setError("Please fill in all fields.");
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
    } catch (err) {
      setError("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "concise", label: "Concise" },
    { value: "storytelling", label: "Storytelling" },
  ];

  return (
    <div className="min-h-screen bg-darkbg text-white pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto selection:bg-accent-500/30">
      <div className="hidden md:block absolute top-[10vh] left-10 w-[500px] h-[250px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="hidden md:block absolute bottom-[10vh] right-10 w-[400px] h-[200px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Cover Letter Generator
            </span>
          </h1>
          <p className="text-white/60 mt-2 text-sm sm:text-base max-w-2xl">
            Generate high-converting cover letters customized to specific job roles, companies, and your unique skill set.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Job Title
              </label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Your Key Skills (comma separated)
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, System Design, Team Leadership"
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Tone
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                      tone === t.value
                        ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
            >
              Generate Cover Letter
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
              Generated Cover Letter
            </label>
            <Card variant="glass" className="p-4 sm:p-6 min-h-[250px] sm:min-h-[360px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : coverLetter ? (
                <>
                  <div className="flex-1 whitespace-pre-wrap text-xs sm:text-sm text-white/80 leading-relaxed font-serif">
                    {coverLetter}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm text-center">
                    Your cover letter will appear here
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
