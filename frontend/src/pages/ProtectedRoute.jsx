import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import Loading from "../components/ui/Loading";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loading fullScreen text="Authenticating..." /></div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
