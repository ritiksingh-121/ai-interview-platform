import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/service");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={container}>
      
      {/* LEFT PANEL */}
      <div style={leftPanel}>
        <h1 style={logo}>AI Interview</h1>
        <p style={tagline}>
          Practice smarter. Crack interviews faster.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={formStyle}
      >
        <h2 style={title}>Welcome Back</h2>
        <p style={subtitle}>Login to continue</p>

        {error && <p style={errorText}>{error}</p>}

        <input
          name="email"
          placeholder="Email address"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={footerText}>
          Don’t have an account?{" "}
          <span style={link} onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </motion.form>
    </div>
  );
}
const container = {
  minHeight: "100vh",
  display: "flex",
  flexWrap: "wrap",
  fontFamily: "sans-serif"
};

const leftPanel = {
  flex: "1 1 400px",
  minHeight: "40vh",
  background: "linear-gradient(135deg, #4f46e5, #9333ea)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const logo = {
  fontSize: "36px",
  fontWeight: "bold"
};

const tagline = {
  marginTop: "10px",
  opacity: 0.8,
  textAlign: "center"
};

const formStyle = {
  flex: "1 1 400px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "40px",
  background: "#fff"
};

const title = {
  fontSize: "26px",
  fontWeight: "bold"
};

const subtitle = {
  marginBottom: "20px",
  color: "#666"
};

const inputStyle = {
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px"
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  opacity: 1
};

const footerText = {
  marginTop: "15px",
  fontSize: "14px",
  color: "#666"
};

const link = {
  color: "#4f46e5",
  cursor: "pointer",
  fontWeight: "500"
};

const errorText = {
  color: "red",
  fontSize: "13px",
  marginBottom: "10px"
};