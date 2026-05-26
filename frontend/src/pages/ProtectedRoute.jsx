import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // ⛔ WAIT until auth loads
  if (user === undefined) return <h2>Loading...</h2>;

  // 🔐 BLOCK access
  if (!user) return <Navigate to="/login" replace />;

  return children;
}