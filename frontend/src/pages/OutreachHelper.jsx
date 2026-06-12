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

const platforms = [
  { value: "linkedin", label: "LinkedIn Message" },
  { value: "email", label: "Email" },
  { value: "twitter", label: "X / Twitter DM" },
];

const goals = [
  { value: "referral", label: "Ask for Referral" },
  { value: "informational", label: "Informational Interview" },
  { value: "job", label: "Express Interest in Role" },
  { value: "advice", label: "Seek Career Advice" },
];

export default function OutreachHelper() {
  const [platform, setPlatform] = useState("linkedin");
  const [goal, setGoal] = useState("referral");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("");
  const [company, setCompany] = useState("");
  const [yourBackground, setYourBackground] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!recipientName.trim() || !recipientRole.trim() || !company.trim() || !yourBackground.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    setMessage("");

    try {
      const res = await getCompletion({
        systemPrompt: `You are an expert networking and outreach coach. Write a concise, high-converting ${platform} outreach message for a ${goal}. The message should be personalized, respectful of the recipient's time, and include a clear call to action. Return ONLY the message text — no preamble, no explanation, no markdown formatting.`,
        userPrompt: `Platform: ${platform}
Goal: ${goal}
Recipient Name: ${recipientName}
Recipient Role: ${recipientRole}
Company: ${company}
My Background: ${yourBackground}

Write a ${platform} outreach message to ${recipientName} to ${goal.replace("_", " ")}.`,
      });

      setMessage(res.reply);
    } catch (err) {
      setError("Failed to generate message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="min-h-screen bg-darkbg text-white pt-24 pb-16 px-6 max-w-7xl mx-auto selection:bg-accent-500/30">
      <div className="absolute top-[10vh] left-10 w-[500px] h-[250px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10vh] right-10 w-[400px] h-[200px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Outreach Assistant
            </span>
          </h1>
          <p className="text-white/60 mt-2 text-sm sm:text-base max-w-2xl">
            Generate high-converting LinkedIn pitches, emails, and DMs to managers and recruiters for referrals and opportunities.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Platform
              </label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                      platform === p.value
                        ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Goal
              </label>
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                      goal === g.value
                        ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Recipient Name
              </label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Recipient Role
              </label>
              <input
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="e.g. Engineering Manager at Google"
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Target Company
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
                Your Background
              </label>
              <textarea
                value={yourBackground}
                onChange={(e) => setYourBackground(e.target.value)}
                placeholder="Briefly describe your current role, experience, and what you're looking for..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-darkbg-input border border-white/10 text-white placeholder-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-accent-500/40 focus:ring-accent-500/15 hover:border-white/20 resize-y text-sm leading-relaxed"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
            >
              Generate Message
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
              Generated Message
            </label>
            <Card variant="glass" className="p-6 min-h-[360px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : message ? (
                <>
                  <div className="flex-1 whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                    {message}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
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
                    Your outreach message will appear here
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
