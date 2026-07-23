import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Toast from "../components/ui/Toast";
import { LoadingSpinner } from "../components/ui/Loading";
import { getCompletion } from "../api/api";

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
  const [toast, setToast] = useState(false);

  const handleGenerate = async () => {
    if (!recipientName.trim() || !recipientRole.trim() || !company.trim() || !yourBackground.trim()) {
      setError("Please fill in all input fields.");
      return;
    }
    setError("");
    setLoading(true);
    setMessage("");

    try {
      const res = await getCompletion({
        systemPrompt: `You are an expert networking and outreach coach. Write a concise, high-converting ${platform} outreach message for a ${goal}. The message should be personalized, respectful of the recipient's time, and include a clear call to action. Return ONLY the message text — no preamble, no explanation, no markdown formatting.`,
        userPrompt: `Platform: ${platform}\nGoal: ${goal}\nRecipient Name: ${recipientName}\nRecipient Role: ${recipientRole}\nCompany: ${company}\nMy Background: ${yourBackground}\n\nWrite a ${platform} outreach message to ${recipientName} to ${goal.replace("_", " ")}.`,
      });
      setMessage(res.reply);
    } catch {
      setError("Failed to generate message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32 pb-safe px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      <Toast show={toast} message="Outreach pitch copied to clipboard!" type="success" />

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Badge variant="cyan" className="px-3 py-1 uppercase tracking-wider text-[10px]">
          📣 Cold Outreach Assistant
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Cold Outreach Generator</h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Generate high-converting LinkedIn connection pitches, cold emails, and Twitter DMs for recruiters, hiring managers, and engineers.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* INPUT FORM */}
        <Card variant="glass" className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Target Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    platform === p.value
                      ? "bg-cyan-500/20 border-cyan-400 text-emerald-400 glow-cyan"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Outreach Goal</label>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    goal === g.value
                      ? "bg-cyan-500/20 border-cyan-400 text-emerald-400 glow-cyan"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Recipient Name</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Recipient Role</label>
              <input
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="e.g. Engineering Lead"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Target Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Meta, Uber"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Your Background & Hook</label>
            <textarea
              value={yourBackground}
              onChange={(e) => setYourBackground(e.target.value)}
              placeholder="Briefly state your current stack, experience level, and mutual interest..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 resize-y leading-relaxed"
            />
          </div>

          <Button
            variant="green"
            size="lg"
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
            className="w-full justify-center uppercase tracking-wider text-xs py-3.5"
          >
            Generate Outreach Pitch
          </Button>

          {error && <p className="text-xs text-red-400">⚠️ {error}</p>}
        </Card>

        {/* OUTPUT DISPLAY */}
        <Card variant="highlight" className="p-6 sm:p-8 flex flex-col justify-between space-y-6 min-h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Personalized Message Draft
              </span>
              {message && (
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                  📋 Copy Pitch
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : message ? (
              <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[450px] overflow-y-auto pr-2">
                {message}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-64 text-zinc-500 text-xs space-y-2">
                <span className="text-3xl">📣</span>
                <p>Fill out the recipient details and click generate to craft your personalized cold message.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
