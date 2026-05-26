import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  function handleLogout() {
    signOut(auth);
    navigate("/login");
    setMenuOpen(false);
  }

  return (
    <nav className="fixed top-0 w-full bg-black/70 backdrop-blur-md border-b border-white/10 z-50">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 py-4">
        
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-violet-600 font-bold text-xl">
          RoxDev
        </h2>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-6 text-white items-center">
          <Link to="/" className="hover:text-violet-500 transition">
            Home
          </Link>
           <Link to="/pricing" className="hover:text-violet-500 transition">
            pricing
          </Link>

          {!user && (
            <>
              <Link to="/signup" className="hover:text-red-500 transition">
                Signup
              </Link>
              <Link to="/login" className="hover:text-violet-500 transition">
                Login
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/service" className="hover:text-violet-500 transition">
                Service
              </Link>

              <span className="text-sm text-gray-400">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-4 text-white bg-black/90">
          
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {!user && (
            <>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                Signup
              </Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/service" onClick={() => setMenuOpen(false)}>
                Service
              </Link>

              <span className="text-gray-400 text-sm">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;