import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const openTools = () => { if (toolsTimer.current) clearTimeout(toolsTimer.current); setToolsOpen(true); };
  const closeTools = () => { toolsTimer.current = setTimeout(() => setToolsOpen(false), 150); };

  useEffect(() => { const unsub = onAuthStateChanged(auth, (u) => setUser(u)); return () => unsub(); }, []);
  useEffect(() => { setMenuOpen(false); setToolsOpen(false); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);

  const handleLogout = () => { signOut(auth); navigate("/login"); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;
  const isTools = () => ["/resume", "/coverletter", "/star", "/outreach"].includes(location.pathname);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800/80 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-11 sm:h-12">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-100">AI Interview</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"}`}>Home</Link>
            <Link to="/pricing" className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/pricing") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"}`}>Pricing</Link>
            {user && (
              <>
                <Link to="/service" className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/service") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"}`}>Dashboard</Link>
                <div className="relative" onMouseEnter={openTools} onMouseLeave={closeTools}>
                  <button className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${isTools() ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"}`}>
                    Career Tools
                    <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {toolsOpen && (
                    <div className="absolute top-full right-0 w-48 mt-1.5 glass rounded-xl p-1.5 shadow-xl shadow-black/40" onMouseEnter={openTools} onMouseLeave={closeTools}>
                      <Link to="/resume" className="block px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-all">Resume Tailor</Link>
                      <Link to="/coverletter" className="block px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-all">Cover Letter</Link>
                      <Link to="/star" className="block px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-all">STAR Builder</Link>
                      <Link to="/outreach" className="block px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-all">Outreach Copy</Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg glass text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer" aria-label="Toggle theme">
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            {!user ? (
              <>
                <Link to="/login" className="text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-all py-2 px-2">Log in</Link>
                <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>Get Started</Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 truncate max-w-[120px] hidden lg:block">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>

          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg glass text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <div className="relative w-4 h-3">
              <span className={`absolute left-0 w-full h-[1.5px] bg-zinc-300 transition-all duration-200 rounded-full ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 w-full h-[1.5px] bg-zinc-300 transition-all duration-200 rounded-full ${menuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 w-full h-[1.5px] bg-zinc-300 transition-all duration-200 rounded-full ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-200 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-14 left-0 right-0 border-b border-zinc-800 transition-all duration-200 ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`} style={{ background: "rgba(10,10,11,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <div className="px-4 py-4 space-y-2 max-h-[calc(100dvh-3.5rem)] overflow-y-auto no-scrollbar">
            <Link to="/" className={`block px-3 py-2 rounded-lg text-xs font-medium ${isActive("/") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200"}`}>Home</Link>
            <Link to="/pricing" className={`block px-3 py-2 rounded-lg text-xs font-medium ${isActive("/pricing") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200"}`}>Pricing</Link>
            {user ? (
              <>
                <Link to="/service" className={`block px-3 py-2 rounded-lg text-xs font-medium ${isActive("/service") ? "text-zinc-100 bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-200"}`}>Dashboard</Link>
                <div className="pl-3 border-l border-zinc-800 space-y-2 my-3">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Career Tools</p>
                  <Link to="/resume" className="block text-xs text-zinc-400 hover:text-zinc-200">Resume Tailor</Link>
                  <Link to="/coverletter" className="block text-xs text-zinc-400 hover:text-zinc-200">Cover Letter</Link>
                  <Link to="/star" className="block text-xs text-zinc-400 hover:text-zinc-200">STAR Builder</Link>
                  <Link to="/outreach" className="block text-xs text-zinc-400 hover:text-zinc-200">Outreach Copy</Link>
                </div>
                <hr className="border-zinc-800 my-3" />
                <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all cursor-pointer">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">Logout</button>
              </>
            ) : (
              <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800">
                <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all cursor-pointer">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
                <Link to="/login" className="block px-3 py-2 rounded-lg text-xs text-center text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all">Log in</Link>
                <Button variant="primary" onClick={() => navigate("/signup")} className="w-full justify-center">Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around px-2 py-1.5">
        <Link to="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive("/") ? "text-pink-400" : "text-zinc-500"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to={user ? "/service" : "/login"} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive("/service") ? "text-pink-400" : "text-zinc-500"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link to={user ? "/interview" : "/login"} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive("/interview") ? "text-pink-400" : "text-zinc-500"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          <span className="text-[10px] font-medium">Interview</span>
        </Link>
        <Link to="/pricing" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive("/pricing") ? "text-pink-400" : "text-zinc-500"}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-medium">Pricing</span>
        </Link>
      </div>
    </div>
    </>
  );
}

export default Navbar;
