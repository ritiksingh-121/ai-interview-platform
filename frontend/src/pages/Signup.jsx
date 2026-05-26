import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
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

  async function handleSignup(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      // 🔥 Save user data
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        role: "user"
      });

      navigate("/service");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={container}>
      
      {/* LEFT SIDE */}
      <div style={leftPanel}>
        <h1 style={logo}>AI Interview</h1>
        <p style={tagline}>
          Practice smarter. Crack interviews faster.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <motion.form
        onSubmit={handleSignup}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={formStyle}
      >
        <h2 style={title}>Create Account</h2>
        <p style={subtitle}>Join and start practicing</p>

        {error && <p style={errorText}>{error}</p>}

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="email"
          placeholder="Email"
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
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={footerText}>
          Already have an account?{" "}
          <span style={link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </motion.form>
    </div>
  );
}

/* 🎨 SAME STYLES */

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
  cursor: "pointer"
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