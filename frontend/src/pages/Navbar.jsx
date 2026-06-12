import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const openTools = () => {
    if (toolsTimer.current) clearTimeout(toolsTimer.current);
    setToolsOpen(true);
  };

  const closeTools = () => {
    toolsTimer.current = setTimeout(() => setToolsOpen(false), 150);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Track scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    signOut(auth);
    navigate("/login");
    setMenuOpen(false);
  }

  const isActive = (path) => location.pathname === path;
  const isToolsActive = () => ["/resume", "/coverletter", "/star", "/outreach"].includes(location.pathname);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-darkbg/75 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg shadow-black/40"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-pink-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-4.5 h-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-md font-bold tracking-tight bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
              AI Interview
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2.5 relative">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                isActive("/")
                  ? "text-white bg-white/[0.04]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                isActive("/pricing")
                  ? "text-white bg-white/[0.04]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              Pricing
            </Link>
            {user && (
              <>
                <Link
                  to="/service"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isActive("/service")
                      ? "text-white bg-white/[0.04]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  Dashboard
                </Link>

                {/* Career Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={openTools}
                  onMouseLeave={closeTools}
                >
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      isToolsActive()
                        ? "text-white bg-white/[0.04]"
                        : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    Career Tools
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {toolsOpen && (
                    <div className="absolute top-full right-0 w-52 mt-1.5 bg-darkbg-elevated/95 backdrop-blur-2xl border border-white/5 p-2 rounded-xl shadow-2xl animate-scale-in"
                      onMouseEnter={openTools}
                      onMouseLeave={closeTools}
                    >
                      <Link
                        to="/resume"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        📄 Resume Tailor
                      </Link>
                      <Link
                        to="/coverletter"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        ✉ Cover Letter
                      </Link>
                      <Link
                        to="/star"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        🎯 STAR Builder
                      </Link>
                      <Link
                        to="/outreach"
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        📣 Outreach Copy
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold tracking-wide text-white/70 hover:text-white transition-colors py-2 px-3"
                >
                  Log in
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-white/40 max-w-[140px] truncate hidden lg:block border border-white/5 bg-white/[0.02] px-2.5 py-1 rounded-md">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger menu */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-3.5">
              <span
                className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  menuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setMenuOpen(false)}
        />

        <div
          className={`absolute top-16 left-0 right-0 bg-darkbg-elevated/95 backdrop-blur-2xl border-b border-white/5 transition-all duration-300 ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="px-6 py-8 space-y-4 max-w-7xl mx-auto overflow-y-auto max-h-[80vh] no-scrollbar">
            <Link
              to="/"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                isActive("/")
                  ? "text-white bg-white/5"
                  : "text-white/70 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                isActive("/pricing")
                  ? "text-white bg-white/5"
                  : "text-white/70 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              Pricing
            </Link>

            {user ? (
              <>
                <Link
                  to="/service"
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                    isActive("/service")
                      ? "text-white bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  Dashboard
                </Link>

                {/* Mobile Career Tools Submenu */}
                <div className="px-4 py-2 border-l border-white/10 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-white/40 font-bold">Career Tools</p>
                  <Link
                    to="/resume"
                    className="block text-sm text-white/60 hover:text-white"
                  >
                    📄 Resume Tailor
                  </Link>
                  <Link
                    to="/coverletter"
                    className="block text-sm text-white/60 hover:text-white"
                  >
                    ✉ Cover Letter Tailor
                  </Link>
                  <Link
                    to="/star"
                    className="block text-sm text-white/60 hover:text-white"
                  >
                    🎯 STAR story Builder
                  </Link>
                  <Link
                    to="/outreach"
                    className="block text-sm text-white/60 hover:text-white"
                  >
                    📣 Outreach Copywriter
                  </Link>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4">
                  <div className="px-4 pb-4">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">
                      Account email
                    </p>
                    <p className="text-sm font-semibold text-white/80 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-white/5 mt-4 space-y-3">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                >
                  {theme === "dark" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 rounded-lg text-sm font-semibold text-center text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                >
                  Log in
                </Link>
                <Button
                  variant="primary"
                  onClick={() => navigate("/signup")}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;