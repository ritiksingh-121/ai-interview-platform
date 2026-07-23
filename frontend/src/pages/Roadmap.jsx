import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { generateRoadmap, getRoadmaps, updateRoadmapItem} from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/Loading";
import { fadeUp, staggerContainer } from "../lib/motion";

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [duration, setDuration] = useState(30);
  const [focusArea, setFocusArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const res = await getRoadmaps(user.uid);
        if (res?.roadmaps?.length) {
          setRoadmaps(res.roadmaps);
          setActiveRoadmap(res.roadmaps[0]);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleGenerate = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setGenerating(true);
    const result = await generateRoadmap({
      userId: user.uid,
      duration,
      focusArea: focusArea || undefined,
    });
    if (result?.roadmap) {
      setRoadmaps((prev) => [result.roadmap, ...prev]);
      setActiveRoadmap(result.roadmap);
    }
    setGenerating(false);
  };

  const toggleItem = async (itemId, current) => {
    const res = await updateRoadmapItem(itemId, !current);
    if (res?.item) {
      setActiveRoadmap((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? res.item : i)),
      }));
    }
  };

  const progress = activeRoadmap?.items
    ? Math.round((activeRoadmap.items.filter((i) => i.completed).length / activeRoadmap.items.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-safe">
      <section className="relative pt-32 pb-10 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Badge variant="success" className="px-3 py-1 uppercase tracking-wider text-[10px]">
            AI Learning Path
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Learning <span className="gradient-accent-text">Roadmap</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Generate a personalized study plan based on your weaknesses and interview goals.
          </p>
        </motion.div>
      </section>

      <div className="px-4 sm:px-8 max-w-7xl mx-auto pb-20 space-y-10">
        {roadmaps.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roadmaps.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoadmap(r)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeRoadmap?.id === r.id
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                }`}
              >
                {r.title || `${r.duration}-Day Roadmap`}
              </button>
            ))}
          </div>
        )}

        {activeRoadmap ? (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <Card variant="highlight" className="p-6 flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
                  <circle
                    cx="36" cy="36" r="30" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-emerald-400">{progress}%</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{activeRoadmap.title}</h2>
                <p className="text-sm text-zinc-400">{activeRoadmap.focusArea || "General Preparation"}</p>
                <p className="text-xs text-zinc-500">{activeRoadmap.items.length} days · Created {new Date(activeRoadmap.createdAt).toLocaleDateString()}</p>
              </div>
            </Card>

            <div className="space-y-3">
              {activeRoadmap.items.map((item, i) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <Card
                    variant="glass"
                    hover
                    className={`p-4 flex items-start gap-4 cursor-pointer transition-all ${
                      item.completed ? "border-emerald-500/30 bg-emerald-950/10" : ""
                    }`}
                    onClick={() => toggleItem(item.id, item.completed)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      item.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {item.completed ? "✓" : item.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${item.completed ? "text-emerald-300 line-through" : "text-zinc-200"}`}>
                          {item.title}
                        </h3>
                        {item.completed && <Badge variant="success">Done</Badge>}
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.topics && JSON.parse(item.topics).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {JSON.parse(item.topics).map((t, ti) => (
                            <Badge key={ti} variant="neutral" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <Card variant="glass" className="p-8 space-y-6 max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-white text-center">Generate Your Roadmap</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Duration</label>
                <div className="flex gap-2">
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        duration === d ? "bg-cyan-500/15 text-emerald-400 border border-cyan-500/30" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Focus Area (optional)</label>
                <input
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g., System Design, DSA, Frontend..."
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-500/40"
                />
              </div>
              <Button variant="green" className="w-full justify-center" onClick={handleGenerate} loading={generating}>
                Generate AI Roadmap
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
