const PERSONALITIES = [
  { value: "FRIENDLY", label: "Friendly", desc: "Warm & encouraging", icon: "😊" },
  { value: "STRICT", label: "Strict", desc: "Formal & demanding", icon: "🎯" },
  { value: "AGGRESSIVE", label: "Aggressive", desc: "High pressure stress test", icon: "🔥" },
  { value: "SENIOR_ENGINEER", label: "Senior Engineer", desc: "Technical depth focus", icon: "👨‍💻" },
  { value: "ENGINEERING_MANAGER", label: "Engineering Manager", desc: "Leadership & process", icon: "👔" },
  { value: "HR", label: "HR", desc: "Cultural & behavioral", icon: "🤝" },
  { value: "PRINCIPAL_ENGINEER", label: "Principal Engineer", desc: "Architecture & vision", icon: "🏛️" },
];

export default function PersonalitySelector({ personality, setPersonality, disabled }) {
  return (
    <div className="relative inline-block select-none">
      <select
        value={personality}
        onChange={(e) => setPersonality(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-zinc-900/60 border border-zinc-800 text-zinc-100 pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
      >
        {PERSONALITIES.map((p) => (
          <option key={p.value} value={p.value} className="bg-zinc-950 text-zinc-100">
            {p.icon} {p.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export { PERSONALITIES };
