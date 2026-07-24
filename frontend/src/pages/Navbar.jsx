import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { const unsub = onAuthStateChanged(auth, (u) => setUser(u)); return () => unsub(); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);

  const handleLogout = () => { signOut(auth); navigate("/login"); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
      isActive(path)
        ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/30"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-base font-extrabold text-zinc-100 tracking-tight">AI Interview</span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              <Link to="/" className={linkClass("/")}>Home</Link>
              <Link to="/pricing" className={linkClass("/pricing")}>Pricing</Link>
              {user && (
                <>
                  <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                  <Link to="/history" className={linkClass("/history")}>History</Link>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              {!user ? (
                <>
                  <Link to="/login" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all py-2 px-3">
                    Log in
                  </Link>
                  <Button variant="green" size="sm" onClick={() => navigate("/signup")} className="uppercase tracking-wider text-xs">
                    Get Started
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500 truncate max-w-[140px] hidden lg:block">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
                    Logout
                  </Button>
                </div>
              )}
            </div>

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-4 h-3">
                <span className={`absolute left-0 w-full h-[1.5px] bg-current transition-all duration-200 rounded-full ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 w-full h-[1.5px] bg-current transition-all duration-200 rounded-full ${menuOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 w-full h-[1.5px] bg-current transition-all duration-200 rounded-full ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
              </div>
            </button>
          </div>
        </div>

        <div className={`fixed inset-0 z-40 md:hidden transition-all duration-200 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className={`absolute top-14 left-0 right-0 border-b border-zinc-800 transition-all duration-200 ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"} bg-zinc-950/95 backdrop-blur-md`}>
            <div className="px-4 py-4 space-y-2 max-h-[calc(100dvh-3.5rem)] overflow-y-auto no-scrollbar">
              <Link to="/" className={`block px-3 py-2 rounded-lg text-xs font-semibold ${isActive("/") ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-400 hover:text-zinc-200"}`}>Home</Link>
              <Link to="/pricing" className={`block px-3 py-2 rounded-lg text-xs font-semibold ${isActive("/pricing") ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-400 hover:text-zinc-200"}`}>Pricing</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className={`block px-3 py-2 rounded-lg text-xs font-semibold ${isActive("/dashboard") ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-400 hover:text-zinc-200"}`}>Dashboard</Link>
                  <hr className="border-zinc-800 my-3" />
                  <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">Logout</button>
                </>
              ) : (
                <div className="space-y-2 mt-3 pt-3 border-t border-zinc-800">
                  <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer">{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
                  <Link to="/login" className="block px-3 py-2 rounded-lg text-xs text-center text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all">Log in</Link>
                  <Button variant="green" onClick={() => navigate("/signup")} className="w-full justify-center uppercase tracking-wider text-xs">Get Started</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around px-2 py-2">
          <Link to="/" className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${isActive("/") ? "text-emerald-500" : "text-zinc-500"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${isActive("/dashboard") ? "text-emerald-500" : "text-zinc-500"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="text-[10px] font-semibold">Dashboard</span>
          </Link>
          <Link to={user ? "/interview" : "/login"} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${isActive("/interview") ? "text-emerald-500" : "text-zinc-500"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <span className="text-[10px] font-semibold">Interview</span>
          </Link>
          <Link to="/pricing" className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${isActive("/pricing") ? "text-emerald-500" : "text-zinc-500"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[10px] font-semibold">Pricing</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
