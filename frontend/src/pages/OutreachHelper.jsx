import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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
        userPrompt: `Platform: ${platform}\nGoal: ${goal}\nRecipient Name: ${recipientName}\nRecipient Role: ${recipientRole}\nCompany: ${company}\nMy Background: ${yourBackground}\n\nWrite a ${platform} outreach message to ${recipientName} to ${goal.replace("_", " ")}.`,
      });
      setMessage(res.reply);
    } catch {
      setError("Failed to generate message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(message);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-safe px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Outreach Assistant</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">Generate high-converting LinkedIn pitches, emails, and DMs to managers and recruiters.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Platform</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {platforms.map((p) => (
                <button key={p.value} onClick={() => setPlatform(p.value)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${platform === p.value ? "bg-pink-500/15 border-pink-500/40 text-pink-300" : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"}`}>{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Goal</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {goals.map((g) => (
                <button key={g.value} onClick={() => setGoal(g.value)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${goal === g.value ? "bg-pink-500/15 border-pink-500/40 text-pink-300" : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"}`}>{g.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Recipient Name</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Recipient Role</label>
            <input value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)} placeholder="e.g. Engineering Manager at Google" className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Target Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Your Background</label>
            <textarea value={yourBackground} onChange={(e) => setYourBackground(e.target.value)} placeholder="Briefly describe your current role, experience, and what you're looking for..." rows={3} className="w-full px-4 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 resize-y leading-relaxed" />
          </div>
          <Button variant="gradient" onClick={handleGenerate} loading={loading} disabled={loading}>Generate Message</Button>
          {error && <p className="text-xs text-red-400 flex items-center gap-1.5"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Generated Message</label>
          <Card variant="glass" className="p-4 sm:p-6 min-h-[250px] sm:min-h-[360px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
            ) : message ? (
              <>
                <div className="flex-1 whitespace-pre-wrap text-sm text-zinc-100 leading-relaxed">{message}</div>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center"><p className="text-zinc-500 text-sm text-center">Your outreach message will appear here</p></div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
