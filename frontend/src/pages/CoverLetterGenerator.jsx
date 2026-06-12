import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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
    } catch {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cover Letter Generator</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          Generate high-converting cover letters customized to specific job roles, companies, and your unique skill set.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Job Title</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Company Name</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Your Key Skills (comma separated)</label>
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, TypeScript, System Design, Team Leadership" rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tone</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    tone === t.value
                      ? "bg-pink-500/15 border-pink-500/40 text-pink-300"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="gradient" onClick={handleGenerate} loading={loading} disabled={loading}>
            Generate Cover Letter
          </Button>
          {error && <p className="text-xs text-red-400 flex items-center gap-1.5"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Generated Cover Letter</label>
          <Card variant="glass" className="p-4 sm:p-6 min-h-[250px] sm:min-h-[360px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
            ) : coverLetter ? (
              <>
                <div className="flex-1 whitespace-pre-wrap text-sm text-zinc-100 leading-relaxed">{coverLetter}</div>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center"><p className="text-zinc-500 text-sm text-center">Your cover letter will appear here</p></div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
