import React from "react";

export default function RoleSelector({ role, setRole, disabled }) {
  return (
    <div className="relative inline-block select-none">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-white/5 border border-white/10 text-white pl-4 pr-10 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option className="bg-[#0c0c0e] text-white">Frontend Developer</option>
        <option className="bg-[#0c0c0e] text-white">Backend Developer</option>
        <option className="bg-[#0c0c0e] text-white">Full Stack Developer</option>
        <option className="bg-[#0c0c0e] text-white">DSA</option>
        <option className="bg-[#0c0c0e] text-white">HR</option>
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/40">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}