const COMPANIES = [
  { value: "GENERAL", label: "General", icon: "🌐" },
  { value: "GOOGLE", label: "Google", icon: "🔍" },
  { value: "AMAZON", label: "Amazon", icon: "📦" },
  { value: "MICROSOFT", label: "Microsoft", icon: "🪟" },
  { value: "META", label: "Meta", icon: "👤" },
  { value: "ADOBE", label: "Adobe", icon: "🎨" },
  { value: "UBER", label: "Uber", icon: "🚗" },
  { value: "FLIPKART", label: "Flipkart", icon: "🛒" },
  { value: "MEESHO", label: "Meesho", icon: "🛍️" },
  { value: "ORACLE", label: "Oracle", icon: "🗄️" },
  { value: "TCS", label: "TCS", icon: "💼" },
  { value: "INFOSYS", label: "Infosys", icon: "🏢" },
  { value: "JOSH_TECHNOLOGY", label: "Josh Technology", icon: "⚡" },
];

export default function CompanySelector({ company, setCompany, disabled }) {
  return (
    <div className="relative inline-block select-none">
      <select
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-zinc-900/60 border border-zinc-800 text-zinc-100 pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 hover:bg-zinc-800/60 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
      >
        {COMPANIES.map((c) => (
          <option key={c.value} value={c.value} className="bg-zinc-950 text-zinc-100">
            {c.icon} {c.label}
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

export { COMPANIES };
