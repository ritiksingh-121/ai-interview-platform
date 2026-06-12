export default function RoleSelector({ role, setRole, disabled }) {
  return (
    <div className="relative inline-block select-none">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-zinc-900/60 border border-zinc-800 text-zinc-100 pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all focus:outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/10 hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option className="bg-zinc-950 text-zinc-100">Frontend Developer</option>
        <option className="bg-zinc-950 text-zinc-100">Backend Developer</option>
        <option className="bg-zinc-950 text-zinc-100">Full Stack Developer</option>
        <option className="bg-zinc-950 text-zinc-100">DSA</option>
        <option className="bg-zinc-950 text-zinc-100">HR</option>
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
