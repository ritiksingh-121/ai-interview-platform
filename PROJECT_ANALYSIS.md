# AI Interview Mock Platform — Complete Technical Analysis

> Full-stack AI-powered interview preparation platform built with React, Express, Firebase, Groq AI, and Stripe.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Frontend Deep Dive](#3-frontend-deep-dive)
4. [Backend Deep Dive](#4-backend-deep-dive)
5. [Database](#5-database)
6. [Authentication](#6-authentication)
7. [AI Integration](#7-ai-integration)
8. [API Reference](#8-api-reference)
9. [Complete User Flow](#9-complete-user-flow)
10. [Interview Questions & Answers](#10-interview-questions--answers)
11. [Challenges & Improvements](#11-challenges--improvements)
12. [Security Analysis](#12-security-analysis)
13. [Performance Analysis](#13-performance-analysis)
14. [Deployment](#14-deployment)
15. [Every File Explained](#15-every-file-explained)
16. [Execution Flow: Start Interview to AI Feedback](#16-execution-flow-start-interview-to-ai-feedback)
17. [Code Walkthrough: Key Functions](#17-code-walkthrough-key-functions)
18. [Future Improvements](#18-future-improvements)
19. [Resume Explanation Guide](#19-resume-explanation-guide)
20. [Mock Interview Section](#20-mock-interview-section)

---

## 1. Project Overview

### What Problem Does This Project Solve?

Job seekers struggle to practice realistic technical interviews. Existing solutions (Pramp, Interviewing.io) require scheduling with peers, have limited availability, lack instant feedback, and can be expensive.

### Target Users

Software engineers, full-stack developers, and CS students preparing for technical interviews at FAANG/big-tech companies.

### Real-World Use Case

A developer preparing for a Frontend role opens the platform, selects "Frontend Developer", and gets a live AI interviewer that:
- Asks technical questions one at a time
- Listens to spoken answers via speech recognition
- Evaluates responses with scores (0-10)
- Provides strengths, weaknesses, and improved answers
- Generates the next question based on performance

### Why Was This Project Built?

To create an on-demand, 24/7, zero-scheduling interview practice environment that simulates a **strict, realistic** technical interviewer using Groq AI (Llama 3.1 8B).

### Key Features

| Feature | Description |
|---------|-------------|
| AI Mock Interviews | Real-time Q&A with role-specific AI interviewers |
| Speech-to-Text | Answer verbally via Web Speech API |
| Text-to-Speech | Hear questions spoken aloud via SpeechSynthesis |
| Live Video Feed | Camera feed simulates real interview pressure |
| Timer | Tracks elapsed interview time |
| Feedback Scoring | AI scores answers 0-10 with actionable feedback |
| Role Selection | Frontend, Backend, Full Stack, DSA, HR |
| Resume Tailor | ATS score + keyword analysis + bullet rewrites |
| Cover Letter Generator | Tone-customizable cover letters |
| STAR Builder | Behavioral story scoring and improvement |
| Outreach Assistant | LinkedIn/Email/DM message generator |
| Stripe Subscriptions | Free / Pro (₹199) / Advanced (₹499) plans |
| Dark/Light Theme | Persistent theme toggle with system detection |
| Responsive Design | Mobile-first with bottom nav on mobile |

---

## 2. Architecture

### Overall System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                    │
│  ┌────────────────────────────────────────────────┐  │
│  │            React SPA (Vite + Tailwind)          │  │
│  │  Firebase Auth SDK  │  Stripe SDK              │  │
│  │  Web Speech API     │  SpeechSynthesis          │  │
│  │  getUserMedia (Camera)                         │  │
│  └──────────────┬─────────────────────────────────┘  │
│                 │ HTTP/JSON                          │
└─────────────────┼────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │ Vite Proxy (Dev) │  /api → localhost:5000
         └────────┬────────┘
                  │
┌─────────────────┴────────────────────────────────────┐
│              Express.js Backend (ES Modules)           │
│                                                       │
│  POST /api/interview   → Groq AI (Llama 3.1 8B)      │
│  POST /api/feedback    → Groq AI (Llama 3.1 8B)      │
│  POST /api/completion  → Groq AI (Llama 3.1 8B)      │
│  POST /create-checkout  → Stripe API                  │
│  POST /webhook          → Stripe Webhook Verification │
│                                                       │
│  ┌─────────┐  ┌────────────┐  ┌─────────┐  ┌──────┐ │
│  │  Routes  │→ │Controllers │→ │ Config  │  │Utils │ │
│  └─────────┘  └────────────┘  └─────────┘  └──────┘ │
└──────────────────────────────────────────────────────┘
         │                          │
   ┌─────┴──────┐           ┌──────┴──────┐
   │  Firebase   │           │   Stripe    │
   │ Auth + DB   │           │  Payments   │
   └────────────┘           └─────────────┘
```

### Frontend Architecture

**Tech Stack**: React 19, Vite 8, Tailwind CSS 4, Framer Motion 12, Firebase 12, React Router 7, React Markdown 10, Stripe JS 9

**Component Tree**:
```
index.html
└── main.jsx
    └── BrowserRouter
        └── ThemeProvider (ThemeContext)
            └── App.jsx
                ├── Navbar
                │   ├── Logo + Navigation Links
                │   ├── Career Tools Dropdown
                │   ├── Search (future)
                │   ├── Theme Toggle
                │   ├── Auth Buttons (Login/Signup or Logout)
                │   └── Mobile Bottom Nav
                └── Routes
                    ├── / → Home
                    │   ├── Hero Section (Framer Motion)
                    │   ├── Features Grid (6 cards)
                    │   ├── Comparison Table (AI vs Pramp vs Interviewing.io)
                    │   └── CTA Section
                    ├── /signup → Signup
                    ├── /login → Login
                    ├── /service → ProtectedRoute → Dashboard
                    │   ├── Welcome Header + Stats Grid
                    │   ├── Career Acceleration Suite (4 tool cards)
                    │   ├── Recent Sessions Table
                    │   └── Focus Milestones
                    ├── /pricing → Pricing (3 plan cards)
                    ├── /success → Success (payment confirmation)
                    ├── /interview → ProtectedRoute → InterviewPage
                    │   ├── Header (RoleSelector + Timer + End)
                    │   ├── Desktop Layout:
                    │   │   ├── Sidebar (Camera + Speech Visualizer + Tips)
                    │   │   └── ChatArea (ChatBox → MessageBubble + Input + Mic + Send)
                    │   └── Mobile Layout:
                    │       ├── Compact Video Thumbnail
                    │       └── Full Chat Area
                    ├── /resume → ProtectedRoute → ResumeTailor
                    ├── /coverletter → ProtectedRoute → CoverLetterGenerator
                    ├── /star → ProtectedRoute → STARBuilder
                    └── /outreach → ProtectedRoute → OutreachHelper
```

### State Management

**No global state library** (no Redux, Zustand, or Context beyond theme).

- **Component-local state** via `useState` for all pages
- **ThemeContext** provides dark/light mode globally via React Context
- **Auth state** derived from `onAuthStateChanged` Firebase listener (not in global store)
- **Interview messages** stored in local `useState` array — **lost on page refresh**

### Backend Architecture

**Tech Stack**: Express 5, Groq SDK 1.1, Stripe SDK 22, dotenv, cors

**Pattern**: Route → Controller → AI Service
- No database on backend (Firebase accessed directly from frontend)
- No middleware chain (no auth, no rate limiting, no validation middleware)
- Simple 3-route structure mirroring 3 AI features

### Folder Structure

```
AI_Interview_Prep/
├── package.json                    # Root orchestration (concurrently)
├── package-lock.json
├── .gitignore
├── README.md
├── skills-lock.json
│
├── backend/
│   ├── .env                        # ⚠️ Committed to repo (security risk)
│   ├── package.json                # ES Modules, deps
│   ├── server.js                   # Express entry, Stripe routes, webhook
│   ├── config/
│   │   └── groq.js                 # Groq SDK singleton
│   ├── controllers/
│   │   ├── interviewController.js  # Handle interview Q&A
│   │   ├── feedbackController.js   # Handle answer feedback
│   │   └── completionController.js # Generic AI completions
│   ├── routes/
│   │   ├── interviewRoutes.js      # POST /api/interview
│   │   ├── feedbackRoutes.js       # POST /api/feedback
│   │   └── completionRoutes.js     # POST /api/completion
│   └── utils/
│       └── cleanJSON.js            # JSON stripper/parser
│
├── frontend/
│   ├── .env                        # VITE_API_URL, VITE_BACKEND_URL
│   ├── .gitignore
│   ├── .nvmrc
│   ├── index.html                  # HTML shell
│   ├── eslint.config.js
│   ├── package.json
│   ├── vite.config.js              # Proxy /api → 5000
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── dist/                       # Production build output
│   └── src/
│       ├── main.jsx                # React entry
│       ├── App.jsx                 # Route definitions
│       ├── App.css                 # Legacy (unused)
│       ├── index.css               # Tailwind + theme
│       ├── firebase.js             # Firebase init
│       ├── api/
│       │   ├── api.js              # Fetch wrappers
│       │   └── stripe.js           # Checkout helper
│       ├── context/
│       │   └── ThemeContext.jsx     # Dark/Light theme
│       ├── components/
│       │   ├── ChatBox.jsx         # Message list
│       │   ├── MessageBubble.jsx   # Single message w/ Markdown
│       │   ├── RoleSelector.jsx    # Role dropdown
│       │   └── ui/                 # Reusable UI kit
│       │       ├── Badge.jsx
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── Input.jsx
│       │       └── Loading.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx
│           ├── InterviewPage.jsx
│           ├── Navbar.jsx
│           ├── ProtectedRoute.jsx
│           ├── Pricing.jsx
│           ├── Success.jsx
│           ├── ResumeTailor.jsx
│           ├── CoverLetterGenerator.jsx
│           ├── STARBuilder.jsx
│           └── OutreachHelper.jsx
```

### Why This Architecture?

- **MVP speed**: Firebase handles auth + DB serverlessly, backend is thin AI proxy
- **JAMstack-like**: Frontend handles most logic, backend is specialized AI gateway
- **Monorepo simplicity**: Single `npm run dev` starts both servers
- **Vite proxy**: Eliminates CORS issues in development
- **UI component library**: Custom reusable kit reduces duplication

---

## 3. Frontend Deep Dive

### Home Page (`pages/Home.jsx`)

**Purpose**: Marketing landing page to acquire users.

**State**: None (static content).

**Hooks**: `useNavigate()` for programmatic navigation.

**API Calls**: None.

**Styling**: Tailwind CSS + Framer Motion for scroll-triggered animations.

**Components Used**: `Button`, `Card` from UI library.

**Sections**:
1. **Hero**: Animated gradient text "Crack Interviews with Real-time AI", two CTAs
2. **Features Grid**: 6 feature cards with icons
3. **Comparison Table**: Feature comparison vs Pramp and Interviewing.io
4. **CTA Section**: Final conversion prompt

**Responsive**: Full responsive with `sm:`, `lg:` breakpoints. Grid goes single column on mobile.

### Login Page (`pages/Login.jsx`)

**Purpose**: User authentication.

**State**: `email`, `password`, `error`.

**Flow**:
```
handleLogin(e)
→ e.preventDefault()
→ signInWithEmailAndPassword(auth, email, password)
→ On success: navigate("/dashboard")
→ On error: setError("Invalid email or password.")
```

**Components**: `Card`, `Button`.

**Validation**: Firebase handles validation (empty fields use HTML `required` attribute).

### Signup Page (`pages/Signup.jsx`)

**Purpose**: User registration.

**State**: `name`, `email`, `password`, `error`.

**Flow**:
```
handleSignup(e)
→ e.preventDefault()
→ createUserWithEmailAndPassword(auth, email, password)
→ updateProfile(res.user, { displayName: name })
→ setDoc(doc(db, "users", res.user.uid), { name, email, createdAt })
→ navigate("/dashboard")
```

**Key Detail**: Creates a Firestore document for the new user with their name, email, and timestamp.

### Dashboard (`pages/Dashboard.jsx`)

**Purpose**: Main user hub after login.

**State**: `userData` (fetched from Firestore).

**Hooks**:
- `useEffect` with `onAuthStateChanged` → fetches `doc(db, "users", user.uid)`
- `useNavigate` for navigation

**Loading State**: Shows `<Loading text="Loading dashboard data...">` until `userData` resolves.

**Sections**:
1. **Header**: "Welcome back, {name}" + "Start Mock Interview" button
2. **Stats Grid**: 4 cards (Preparation Index 68%, Interviews 7, Vocal Clarity 84/100, Free Plan)
3. **Career Acceleration Suite**: 4 tool cards (Resume, Cover Letter, STAR, Outreach)
4. **Recent Sessions**: Table with 4 hardcoded entries
5. **Focus Milestones**: 3 progress bars (React 80%, System Design 40%, Graph Theory 65%)

**⚠️ Critical**: Stats, sessions, and milestones are **all hardcoded mock data**. No actual data is fetched from any database. This is placeholder UI.

### InterviewPage (`pages/InterviewPage.jsx`) — Core Feature

**Purpose**: Live AI interview session with speech, video, and chat.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `messages` | Array | Chat history `[{role, content}]` |
| `input` | String | Current text input |
| `role` | String | Selected interview role |
| `loading` | Boolean | API request in progress |
| `isInterviewStarted` | Boolean | Session active |
| `listening` | Boolean | Speech recognition active |
| `timeElapsed` | Number | Seconds since session start |
| `showTips` | Boolean | Mobile tips toggle |

**Refs**:
| Ref | Type | Purpose |
|-----|------|---------|
| `bottomRef` | DOM | Auto-scroll chat |
| `videoRef` | DOM | Camera feed element |
| `recognitionRef` | SpeechRecognition | Speech API instance |
| `listeningRef` | Boolean | Tracking listening across renders |
| `isSpeakingRef` | Boolean | TTS active state |
| `lastTranscriptRef` | String | Dedup speech results |
| `streamRef` | MediaStream | Camera stream cleanup |
| `timerRef` | Interval | Timer interval ID |

**Key Effects**:

```javascript
// Effect 1: Auto-scroll
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);

// Effect 2: Timer
useEffect(() => {
  if (isInterviewStarted && messages.length > 0) {
    timerRef.current = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
  }
  return () => { if (timerRef.current) clearInterval(timerRef.current); };
}, [isInterviewStarted, messages]);

// Effect 3: Camera
useEffect(() => {
  if (!isInterviewStarted) return;
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    })
    .catch(err => console.error("Camera access error:", err));
  return () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  };
}, [isInterviewStarted]);

// Effect 4: Speech Recognition
useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  // ... setup recognition instance
}, []);
```

**startInterview()**:
```javascript
const startInterview = async () => {
  setLoading(true);
  setIsInterviewStarted(true);
  try {
    const data = await sendInterviewMessage({
      role,
      message: "Start interview",
      history: []
    });
    setMessages([{ role: "assistant", content: data.reply }]);
    speak(data.reply); // TTS reads question aloud
  } catch (err) {
    console.error("Failed to start session:", err);
  }
  setLoading(false);
};
```

**sendMessage()**:
```javascript
const sendMessage = async (customInput) => {
  const text = customInput || input;
  if (!text.trim()) return;

  const userMsg = { role: "user", content: text };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const data = await sendInterviewMessage({
      role,
      message: text,
      history: messages  // Full conversation history
    });
    const aiMsg = { role: "assistant", content: data.reply };
    speak(data.reply);  // TTS reads feedback + next question

    // Fire-and-forget feedback (response discarded!)
    const lastQuestion = messages[messages.length - 1]?.content;
    try {
      await getFeedback({ question: lastQuestion, answer: text });
    } catch {}

    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    console.error("API transmission error:", err);
  }
  setLoading(false);
};
```

**Speech Recognition** (`startListening`):
- Uses `window.SpeechRecognition || window.webkitSpeechRecognition`
- `continuous: false`, `interimResults: false`
- On final result: appends transcript to input with dedup check
- Creates fresh instance if previous one died

**Speech Synthesis** (`speak`):
- Uses `window.speechSynthesis`
- Cleans text (removes emojis, markdown symbols)
- Pauses listening while AI speaks, resumes after with 400ms delay

**Layout**:
- **Desktop**: Sidebar (camera + speech visualizer + tips) + Chat area (messages + input)
- **Mobile**: Collapsed header with video thumbnail + full chat area + bottom input bar

### Navbar (`pages/Navbar.jsx`)

**Purpose**: Persistent navigation with responsive behavior.

**State**: `user`, `menuOpen` (mobile menu), `toolsOpen` (dropdown).

**Hooks**:
- `onAuthStateChanged` to track user
- `useLocation` to close menus on route change
- `useTheme` for dark/light toggle

**Features**:
- Desktop: Full nav links + Career Tools dropdown + theme toggle + auth buttons
- Mobile: Hamburger menu with slide-down panel + fixed bottom nav bar
- **Bottom Nav** (mobile): Home, Dashboard, Interview, Pricing

**Career Tools Dropdown**: Uses `onMouseEnter`/`onMouseLeave` with 150ms delay for smooth hover.

### ProtectedRoute (`pages/ProtectedRoute.jsx`)

**Purpose**: Auth guard for protected pages.

**Logic**:
```javascript
// user === undefined → loading state (auth not resolved yet)
// user === null → redirect to /login
// user exists → render children
```

**States**:
1. `user === undefined`: Fullscreen loading spinner with "Authenticating..."
2. `user === null`: `<Navigate to="/login" replace />`
3. `user exists`: `{children}`

### Pricing Page (`pages/Pricing.jsx`)

**Purpose**: Subscription plan selection.

**Plans**:
| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 5 daily interviews, 1 category, basic feedback |
| Pro | ₹199 | Unlimited, advanced feedback, all categories, history |
| Advanced | ₹499 | Everything Pro + voice interviews, clarity analysis, roadmaps |

**Flow**: Click "Upgrade" → `handleCheckout(plan)` → Stripe Checkout → `/success`

### ResumeTailor (`pages/ResumeTailor.jsx`)

**Purpose**: ATS resume analysis.

**Input**: Resume text + Job description text.

**AI Prompt**: System prompt instructs structured JSON output with:
- `atsScore` (0-100)
- `keywordsFound` / `keywordsMissing`
- `bulletRewrites` (original → optimized)
- `skillsGap`
- `suggestions`

**Display**: Circular score gauge, keyword badges, before/after bullet comparison.

### CoverLetterGenerator (`pages/CoverLetterGenerator.jsx`)

**Purpose**: AI cover letter writing.

**Input**: Job title, company, skills, tone (professional/enthusiastic/concise/storytelling).

**Output**: Full cover letter text with copy-to-clipboard.

### STARBuilder (`pages/STARBuilder.jsx`)

**Purpose**: Behavioral story analysis using STAR method.

**Input**: Situation, Task, Action, Result textareas.

**Output**: Score 0-10, strengths, improvements, action metrics flag, verbal pacing feedback, improved story, follow-up questions.

### OutreachHelper (`pages/OutreachHelper.jsx`)

**Purpose**: Cold outreach message generation.

**Input**: Platform (LinkedIn/Email/Twitter), goal (referral/informational/job/advice), recipient info, background.

**Output**: Personalized message with copy-to-clipboard.

---

## 4. Backend Deep Dive

### Server Setup (`server.js`)

```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import interviewRoutes from "./routes/interviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import completionRoutes from "./routes/completionRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  credentials: true,
}));

// ⚠️ Stripe webhook MUST come before express.json()
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// Routes
app.use("/api/interview", interviewRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/completion", completionRoutes);
```

**Key Design Decisions**:

1. **Webhook order**: `express.raw()` on `/webhook` must precede `express.json()` because Stripe needs the raw body for signature verification. If `express.json()` parsed it first, the signature check would fail.

2. **No auth middleware**: Backend trusts all requests. Firebase auth tokens are never verified server-side.

3. **ES Modules**: `"type": "module"` in package.json enables `import` syntax.

### Stripe Checkout Session

```javascript
app.post("/create-checkout-session", async (req, res) => {
  const { plan, userId } = req.body;
  const priceMap = { pro: 19900, advanced: 49900 }; // ₹199, ₹499

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "inr",
        product_data: { name: `${plan.toUpperCase()} Plan` },
        unit_amount: priceMap[plan],
      },
      quantity: 1,
    }],
    metadata: { userId: userId || "unknown", plan },
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
  });

  res.json({ url: session.url });
});
```

### Stripe Webhook

```javascript
app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event = stripe.webhooks.constructEvent(
    req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment Successful", session.metadata.userId, session.metadata.plan);
    // TODO: Update Firestore user subscription here
  }

  res.json({ received: true });
});
```

**⚠️ Incomplete**: The webhook logs success but does NOT update Firestore. The "subscription" is never actually activated in the database.

### Interview Controller (`controllers/interviewController.js`)

```javascript
export const handleInterview = async (req, res) => {
  try {
    const { role, message, history = [] } = req.body;

    const messages = [
      {
        role: "system",
        content: `
You are a strict technical interviewer.
Role: ${role}
STRICT RULES:
- Ask ONLY ONE question at a time
- NEVER give hints, keywords, or partial answers
- NEVER list items
- NEVER guide the candidate
INTERVIEW FLOW:
1. Ask ONE clean question only
2. After answer: Give short feedback (1-2 lines), Ask NEXT question
BEHAVIOR:
- If answer is weak → say it directly
- If user says "next" → respond "Answer properly"
- Be strict, realistic, and slightly critical
OUTPUT:
- Plain text only, no bullet points, no hints`
      },
      ...history,
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.log("GROQ ERROR:", error.message);
    // ⚠️ Silent fallback — user sees no error
    res.json({
      reply: "Something went wrong. Let's continue the interview. Explain time complexity of binary search."
    });
  }
};
```

**Prompt Engineering Strategy**:
- **System prompt**: Encodes the interviewer persona with strict behavioral rules
- **Role interpolation**: `${role}` customizes questions per role
- **History spreading**: `...history` maintains conversation context
- **No temperature/max_tokens**: Uses Groq SDK defaults

**Error Strategy**:
- Catches all errors
- Returns a hardcoded fallback question
- **Problem**: User has no idea anything went wrong

### Feedback Controller (`controllers/feedbackController.js`)

```javascript
export const handleFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Question: ${question}\nAnswer: ${answer}\n\nGive:\n- Score (0-10)\n- Strengths\n- Weaknesses\n- Improved Answer`
      }],
    });

    res.json({ feedback: response.choices[0].message.content });
  } catch (error) {
    console.log("FEEDBACK ERROR:", error.message);
    res.json({ feedback: "Unable to generate feedback" });
  }
};
```

**⚠️ Issue**: Feedback is generated but never displayed to the user. It's a fire-and-forget call in the frontend.

### Completion Controller (`controllers/completionController.js`)

```javascript
export const handleCompletion = async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: userPrompt });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("COMPLETION CONTROLLER ERROR:", error.message);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};
```

**Key Differences from Interview Controller**:
- Accepts custom `systemPrompt` (dynamic per tool)
- `temperature: 0.3` for more deterministic JSON output
- `max_tokens: 2048` limits response length
- Returns 500 on error instead of silent fallback
- Validates `userPrompt` presence

### Routes

All three route files follow identical pattern:

```javascript
import express from "express";
import { handleX } from "../controllers/xController.js";
const router = express.Router();
router.post("/", handleX);
export default router;
```

### CleanJSON Utility (`utils/cleanJSON.js`)

```javascript
export const cleanJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      score: 5,
      strengths: "Parsing failed",
      weaknesses: "Invalid AI format",
      improvedAnswer: "Try again"
    };
  }
};
```

**Limitations**:
- Only removes markdown code fences
- Does not handle: trailing commas, truncated JSON, escaped quotes
- Fallback is always the same generic object

---

## 5. Database

### Schema (Firebase Firestore)

```
Collection: "users"
├── Document ID: {firebaseUID}  ← Primary Key (from Firebase Auth)
│   ├── name: string            ← From signup form
│   ├── email: string           ← From Firebase Auth
│   └── createdAt: string       ← ISO timestamp (new Date().toISOString())
```

### What's MISSING (not implemented):

```
Collection: "interviews"         ← NOT IMPLEMENTED
│   ├── userId: string (ref)
│   ├── role: string
│   ├── date: timestamp
│   ├── messages: array
│   ├── scores: array
│   └── feedback: array

Collection: "subscriptions"      ← NOT IMPLEMENTED
│   ├── userId: string (ref)
│   ├── plan: string
│   ├── stripeSessionId: string
│   ├── active: boolean
│   ├── startDate: timestamp
│   └── endDate: timestamp

Collection: "feedback"           ← NOT IMPLEMENTED
│   ├── userId: string (ref)
│   ├── question: string
│   ├── answer: string
│   ├── score: number
│   ├── strengths: array
│   ├── weaknesses: array
│   └── createdAt: timestamp
```

### Relationships

**None**. Firestore is NoSQL — no foreign keys, no joins. References are manual (storing UIDs as strings).

### Why Each Collection Would Exist

| Collection | Purpose |
|------------|---------|
| `users` | Store user profile metadata (name, email) |
| `interviews` | Persist interview sessions for history/review |
| `subscriptions` | Track Stripe payment status and plan tier |
| `feedback` | Store AI feedback for historical performance analysis |

### ORM Usage

**None**. Using native Firebase SDK (`getDoc`, `setDoc`, `doc`, `collection`). No Prisma, Mongoose, or Firebase Admin SDK.

### Current Data Flow

```
Signup → createUserWithEmailAndPassword (Firebase Auth)
       → setDoc(Firestore, "users/{uid}", { name, email, createdAt })
       
Login → signInWithEmailAndPassword (Firebase Auth) 
      → onAuthStateChanged → getDoc(Firestore, "users/{uid}")
      
Dashboard → getDoc(Firestore, "users/{uid}") — only reads name
```

---

## 6. Authentication

### Login Flow

```
User enters email + password
→ signInWithEmailAndPassword(auth, email, password)
→ Firebase validates credentials (bcrypt comparison)
→ Returns User object with UID
→ onAuthStateChanged triggers → user state updated
→ Navigate to /dashboard
→ Error: setError("Invalid email or password.")
```

### Signup Flow

```
User enters name + email + password
→ createUserWithEmailAndPassword(auth, email, password)
  → Firebase creates Auth user (password hashed with bcrypt)
  → Returns UserCredential with user object
→ updateProfile(user, { displayName: name })
  → Sets display name on Firebase Auth profile
→ setDoc(doc(db, "users", user.uid), { name, email, createdAt })
  → Creates Firestore document for user metadata
→ Navigate to /dashboard
→ Error: setError("Account creation failed. Email may already be in use.")
```

### Session Management

- **Firebase Auth SDK** handles token persistence automatically (IndexedDB)
- **onAuthStateChanged** fires on:
  - Page load
  - Token refresh
  - Login/Signup
  - Logout
- **ProtectedRoute** uses this to gate access

### Token Verification

- **Frontend**: Firebase SDK manages JWT tokens internally
- **Backend**: **No verification**. Any client can call any endpoint without authentication

### Security Flow Diagram

```
┌──────────┐     Firebase Auth SDK     ┌───────────┐     Raw API Call      ┌──────────┐
│  Client  │ ←──────────────────────→ │ Firebase  │ ←────────────────── │ Backend  │
│          │   (JWT managed by SDK)   │   Auth    │   (No JWT sent)     │(No Auth) │
└──────────┘                          └───────────┘                     └──────────┘
      ↑
  onAuthStateChanged
      ↓
  ProtectedRoute
  (client-side only)
```

### Security Concerns

| Issue | Impact | Fix |
|-------|--------|-----|
| No backend auth | Anyone can call APIs, drain Groq quota | Add Firebase token verification middleware |
| API keys in .env committed | Secret keys exposed | Add .env to .gitignore, rotate keys |
| No CSRF protection | Potential cross-site requests | Use SameSite cookies + CSRF tokens |
| No rate limiting | API abuse possible | Add express-rate-limit |

---

## 7. AI Integration

### Model Selection

**Groq Llama 3.1 8B Instant**

| Factor | Assessment |
|--------|------------|
| Speed | ~800+ tokens/sec on Groq LPU |
| Cost | Extremely low ($0.05/1M tokens) |
| Quality | Strong instruction following, good for structured tasks |
| Context Window | 8K tokens |
| Availability | High (Groq's free tier is generous) |

**Why Not GPT-4o?**
- Higher cost per token
- Slower inference
- Overkill for structured interview Q&A

**Why Not Open-Source Self-Hosted?**
- Infrastructure overhead
- GPU cost
- Maintenance burden

### Prompt Engineering Strategy

**Interview Prompt** — Strict Persona:
```
Structure: System prompt + conversation history + user message
Goal: Enforce strict interviewer behavior
Techniques:
- Role definition ("You are a strict technical interviewer")
- Explicit prohibitions ("NEVER give hints")
- Step-by-step flow ("Ask ONE question → feedback → next question")
- Behavior specification ("Be strict, realistic, slightly critical")
- Output constraints ("Plain text only, no bullet points")
```

**Feedback Prompt** — Structured Evaluation:
```
Structure: Question + Answer + format instructions
Goal: Extract score, strengths, weaknesses, improved answer
Format: Simple text with labeled sections
Note: NOT asking for JSON — parsing is expected to fail sometimes
```

**Completion Prompt** — JSON Mode (for Tools):
```
Structure: System prompt with JSON schema + user input
Goal: Parseable structured data
Technique: "Return structured JSON only — no markdown, no code fences"
Fallback: cleanJSON.js strips fences if AI ignores instructions
Temperature: 0.3 (more deterministic)
```

### API Request Flow

```javascript
// Simplified
const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: USER_PROMPT }
  ],
  temperature: 0.3,     // only in completion
  max_tokens: 2048,     // only in completion
});

return response.choices[0].message.content;
```

### Rate Limiting

**None implemented**. Backend has no rate limiting. Groq API has its own tier-based rate limits (requests/min, tokens/min).

### Error Handling

| Controller | Error Behavior | User Experience |
|------------|---------------|-----------------|
| Interview | Silent fallback with generic question | User doesn't know AI failed |
| Feedback | Returns "Unable to generate feedback" | User sees no feedback (but it's fire-and-forget anyway) |
| Completion | Returns 500 with error details | User sees error state in tool UI |

### Response Parsing

**cleanJSON.js** — Strips markdown fences, parses JSON:
```
Input:  "```json\n{\"score\": 8}\n```"
Output: { score: 8 }

Input:  "{\"score\": 8}"
Output: { score: 8 }

Input:  "Some random text"
Output: { score: 5, strengths: "Parsing failed", ... }
```

**safeParseJSON (frontend)** — Same logic duplicated client-side:
```javascript
export function safeParseJSON(text) {
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
```

### Performance Optimization

| Technique | Status | Impact |
|-----------|--------|--------|
| Streaming | ❌ Not implemented | User waits for full response |
| Caching | ❌ Not implemented | Every request hits API |
| Request debouncing | ❌ Not implemented | Rapid sends possible |
| Token limits | ⚠️ Only in completion | Interview has no max_tokens |
| Temperature control | ⚠️ Only in completion | Interview uses SDK default |

---

## 8. API Reference

### `POST /api/interview` — Interview Q&A

**Purpose**: Send a message to the AI interviewer and get a response.

**Authentication**: None (public endpoint).

**Request Body**:
```json
{
  "role": "Frontend Developer",
  "message": "What is closure in JavaScript?",
  "history": [
    { "role": "system", "content": "You are a strict technical interviewer..." },
    { "role": "assistant", "content": "What is the difference between let, const, and var?" },
    { "role": "user", "content": "let and const are block-scoped..." }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | Interview role (Frontend/Backend/Full Stack/DSA/HR) |
| `message` | string | Yes | User's answer or "Start interview" |
| `history` | array | No | Previous conversation messages |

**Response Body**:
```json
{
  "reply": "Your explanation of closures is correct but you missed the concept of memory preservation. Let's move on. Explain the event loop in JavaScript."
}
```

**Error Response**:
```json
{
  "reply": "Something went wrong. Let's continue the interview. Explain time complexity of binary search."
}
```

**Validation**: None server-side.

**Business Logic**:
1. Build system prompt with role
2. Spread history array
3. Append user message
4. Call Groq Llama 3.1 8B
5. Return reply

**Example using curl**:
```bash
curl -X POST http://localhost:5000/api/interview \
  -H "Content-Type: application/json" \
  -d '{"role":"Frontend Developer","message":"Start interview","history":[]}'
```

---

### `POST /api/feedback` — Answer Feedback

**Purpose**: Get AI evaluation of a specific answer.

**Authentication**: None.

**Request Body**:
```json
{
  "question": "What is closure in JavaScript?",
  "answer": "A closure is a function that has access to its outer function's scope..."
}
```

**Response Body**:
```json
{
  "feedback": "Score: 7/10\nStrengths:\n- Good explanation of scope access\n- Correct example\nWeaknesses:\n- Missing explanation of memory implications\nImproved Answer:\nA closure is a function that retains access to its lexical scope even after the outer function has returned..."
}
```

**Error Response**:
```json
{
  "feedback": "Unable to generate feedback"
}
```

---

### `POST /api/completion` — Generic AI Completion

**Purpose**: Custom AI generation for tools (Resume, Cover Letter, STAR, Outreach).

**Authentication**: None.

**Request Body**:
```json
{
  "systemPrompt": "You are an expert ATS resume analyst...Return structured JSON only.",
  "userPrompt": "RESUME:\nExperienced React developer...\n\nJOB DESCRIPTION:\nLooking for Senior Frontend Engineer..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `systemPrompt` | string | No | System behavior instructions |
| `userPrompt` | string | **Yes** | User's input data |

**Response Body**:
```json
{
  "reply": "{\"atsScore\": 82, \"keywordsFound\": [\"React\", \"TypeScript\"], ...}"
}
```

**Error Response** (400):
```json
{
  "error": "userPrompt is required"
}
```

**Error Response** (500):
```json
{
  "error": "Something went wrong while generating response",
  "details": "Insufficient tokens"
}
```

---

### `POST /create-checkout-session` — Stripe Checkout

**Purpose**: Create a Stripe payment session for subscription.

**Authentication**: None.

**Request Body**:
```json
{
  "plan": "pro",
  "userId": "abc123"
}
```

**Response Body**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Error Response** (400):
```json
{
  "error": "Invalid plan"
}
```

**Price Map**:
| Plan | Key | Amount (INR) |
|------|-----|-------------|
| Pro | `pro` | ₹199 (19900 paise) |
| Advanced | `advanced` | ₹499 (49900 paise) |

---

### `POST /webhook` — Stripe Webhook

**Purpose**: Receive payment confirmation from Stripe.

**Authentication**: Stripe signature verification.

**Request**: Raw body (Stripe Event object).

**Response**:
```json
{
  "received": true
}
```

**Processing**: Logs `userId` and `plan` from metadata. **TODO**: Update Firestore.

---

### `GET /` — Health Check

**Response**:
```json
{
  "status": "Backend Running 🚀"
}
```

---

## 9. Complete User Flow

### Step-by-Step Walkthrough

```
USER OPENS WEBSITE
│
├── 1. Browser requests index.html
├── 2. Vite dev server delivers index.html
├── 3. <script type="module" src="/src/main.jsx"> loads
├── 4. React mounts:
│   ├── BrowserRouter wraps the app
│   ├── ThemeProvider initializes (checks localStorage → system preference)
│   └── App.jsx renders Navbar + Routes
│
├── 5. Navbar renders:
│   ├── Logo + nav links
│   ├── onAuthStateChanged checks Firebase → setUser(null)
│   └── Shows "Log in" + "Get Started" buttons
│
└── 6. Home page renders:
    ├── Hero section with animation
    └── Features / Comparison / CTA

─── USER CLICKS "Get Started" ───────────────────────────

SIGNUP FLOW
│
├── 7. navigate("/signup")
├── 8. Signup page renders form (name, email, password)
├── 9. User fills form → handleSignup(e)
├── 10. createUserWithEmailAndPassword(auth, email, password)
│   └── Firebase Auth: creates user, hashes password (bcrypt)
├── 11. updateProfile(user, { displayName: name })
│   └── Firebase Auth: stores display name
├── 12. setDoc(doc(db, "users", user.uid), { name, email, createdAt })
│   └── Firestore: creates document in "users" collection
├── 13. onAuthStateChanged fires → user state updated
├── 14. navigate("/dashboard")  (← NOT "/service"! Bug: signup navigates to /dashboard which doesn't exist)
│   └── Actually signup navigates to /dashboard which is NOT a registered route
│   └── React Router shows blank page (no matching route)
│
─── BUG: Signup navigates to undefined route /dashboard ──
─── CORRECT ROUTE: /service (dashboard is at /service) ──

─── USER MANUALLY NAVIGATES TO /login ────────────────────

LOGIN FLOW
│
├── 15. Login page renders form (email, password)
├── 16. User fills form → handleLogin(e)
├── 17. signInWithEmailAndPassword(auth, email, password)
│   └── Firebase Auth: validates credentials
├── 18. onAuthStateChanged fires → user state updated
├── 19. navigate("/dashboard")  ← SAME BUG! Should be /service
│
─── SAME BUG: redirects to undefined /dashboard ─────────

─── USER MANUALLY NAVIGATES TO /service ───────────────────

DASHBOARD
│
├── 20. ProtectedRoute checks auth:
│   ├── user === undefined → Loading "Authenticating..."
│   └── user exists → renders children
├── 21. Dashboard mounts:
│   ├── useEffect: onAuthStateChanged
│   ├── getDoc(doc(db, "users", user.uid)) → { name: "John", email: "...", createdAt: "..." }
│   └── setUserData({ name, email, createdAt })
├── 22. Renders:
│   ├── "Welcome back, John" + "Start Mock Interview" button
│   ├── Stats grid (mock data: 68%, 7, 84/100, Free Plan)
│   ├── Career tools (Resume, Cover Letter, STAR, Outreach)
│   ├── Recent sessions (mock data: 4 hardcoded rows)
│   └── Focus milestones (mock data: 3 progress bars)
│
─── USER CLICKS "Start Mock Interview" ───────────────────

INTERVIEW PREPARATION
│
├── 23. navigate("/interview")
├── 24. InterviewPage renders:
│   ├── RoleSelector (default: "Frontend Developer")
│   ├── Start Session card
│   └── Tips / status info
├── 25. User can change role (optional)
│
─── USER CLICKS "Start Session" ──────────────────────────

INTERVIEW SESSION BEGINS
│
├── 26. startInterview():
│   ├── setIsInterviewStarted(true)
│   ├── setLoading(true)
├── 27. useEffect [isInterviewStarted]:
│   ├── navigator.mediaDevices.getUserMedia({ video: true, audio: false })
│   ├── stream → videoRef.current.srcObject
│   └── Live video appears in sidebar
├── 28. useEffect [isInterviewStarted && messages.length > 0]:
│   └── setInterval: timer starts counting seconds
├── 29. fetch POST /api/interview
│   ├── body: { role: "Frontend Developer", message: "Start interview", history: [] }
│   └── Backend:
│       ├── handleInterview()
│       ├── Builds: system prompt (strict interviewer) + user message
│       ├── groq.chat.completions.create({ model: "llama-3.1-8b-instant", messages })
│       └── Returns: { reply: "What is the difference between let, const, and var?" }
├── 30. setMessages([{ role: "assistant", content: "What is the difference..." }])
├── 31. speak(data.reply):
│   ├── Clean text (remove emojis/markdown)
│   ├── SpeechSynthesisUtterance(text)
│   ├── utterance.rate = 1.0
│   ├── speechSynthesis.speak(utterance)
│   └── User HEARS question
├── 32. setLoading(false)
│
─── USER HEARS QUESTION, PREPARES ANSWER ──────────────────

ANSWER SUBMISSION (TYPING)
│
├── 33. User types answer in input field
├── 34. Presses Enter (or clicks Send button)
├── 35. sendMessage():
│   ├── const text = input
│   ├── setMessages(prev => [...prev, { role: "user", content: text }])
│   ├── setInput("")
│   ├── setLoading(true)
├── 36. fetch POST /api/interview
│   ├── body: { role, message: text, history: messages (full conversation) }
│   └── Backend:
│       ├── Prepends history → AI has full context
│       ├── Groq evaluates answer + generates next question
│       └── Returns: { reply: "Good answer on let/const/var. You explained hoisting well. Next: Explain prototypal inheritance." }
├── 37. speak(data.reply) → User hears feedback + next question
├── 38. Fire-and-forget: fetch POST /api/feedback
│   ├── body: { question: lastQuestion, answer: text }
│   ├── Backend: Groq returns score/strengths/weaknesses
│   └── Response is DISCARDED (not stored or shown)
├── 39. setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
├── 40. useEffect: bottomRef.scrollIntoView()
├── 41. setLoading(false)
│
─── OR: ANSWER SUBMISSION (SPEECH) ───────────────────────

ANSWER SUBMISSION (SPEECH)
│
├── 33. User clicks microphone button
├── 34. startListening():
│   ├── Clear lastTranscriptRef
│   ├── recognition = new SpeechRecognition() or use existing
│   ├── recognition.lang = "en-US"
│   ├── recognition.continuous = false
│   ├── recognition.start()
├── 35. User speaks → Web Speech API processes
├── 36. recognition.onresult:
│   ├── transcript = event.results[0][0].transcript
│   ├── if (!isFinal) return (wait for final result)
│   ├── if (transcript === lastTranscriptRef.current) return (dedup)
│   ├── setInput(prev => prev ? prev + " " + transcript : transcript)
├── 37. User can edit transcribed text
├── 38. Clicks Send → same as typing flow (step 35+)
│
─── USER CONTINUES Q&A LOOP ──────────────────────────────

SESSION END
│
├── 42. User clicks "End" button
├── 43. confirm("End current interview session?")
├── 44. If confirmed:
│   ├── setIsInterviewStarted(false)
│   ├── setMessages([])
│   ├── setTimeElapsed(0)
│   ├── clearInterval(timerRef.current)
│   └── Camera stream stops (useEffect cleanup)
├── 45. User sees Start Session screen again
├── 46. ⚠️ All interview data is LOST (not persisted)
│
─── USER CAN ALSO USE CAREER TOOLS ───────────────────────

RESUME TAILOR
│
├── 47. navigate("/resume")
├── 48. User pastes resume + job description
├── 49. Clicks "Analyze & Optimize"
├── 50. fetch POST /api/completion
│   ├── systemPrompt: ATS analyst with JSON output schema
│   ├── userPrompt: Resume + Job Description
│   └── Returns JSON: { atsScore, keywordsFound, keywordsMissing, bulletRewrites, skillsGap, suggestions }
├── 51. safeParseJSON(res.reply) → parsed object
├── 52. Displays:
│   ├── Circular score gauge
│   ├── Keywords found/missing badges
│   ├── Original → Optimized bullet points
│   ├── Skills gap list
│   └── Suggestions

─── SAME PATTERN FOR COVER LETTER / STAR / OUTREACH ─────

SUBSCRIPTION
│
├── 53. navigate("/pricing")
├── 54. User clicks "Upgrade to Pro"
├── 55. handleCheckout("pro"):
│   ├── fetch POST /create-checkout-session { plan: "pro", userId: "test_user" }
│   ├── Stripe creates checkout session
│   ├── Returns { url: "https://checkout.stripe.com/..." }
│   └── window.location.href = url
├── 56. User completes payment on Stripe
├── 57. Stripe redirects to /success
├── 58. Stripe sends webhook POST /webhook
│   ├── stripe.webhooks.constructEvent(req.body, sig, secret)
│   ├── If checkout.session.completed:
│   │   ├── Logs userId + plan
│   │   └── TODO: Update Firestore (NOT IMPLEMENTED)
│   └── Returns { received: true }
├── 59. Success page shows: "Payment Successful! Pro plan active"
│   └── ⚠️ Plan is NOT actually activated (Firestore not updated)
```

---

## 10. Interview Questions & Answers

### Beginner Level

**Q1: What does `useEffect` do in InterviewPage.jsx on line 31?**

**Answer**: It scrolls the chat container to the bottom whenever `messages` or `loading` changes. The `bottomRef` is attached to a div at the end of the message list, and `scrollIntoView({ behavior: "smooth" })` ensures the user always sees the latest message.

**Technical**: This is a side-effect pattern. The dependency array `[messages, loading]` ensures the effect runs after every new message or when the loading state changes, which means the UI auto-scrolls after both user and AI messages.

---

**Q2: How does the app protect routes that require authentication?**

**Answer**: `ProtectedRoute.jsx` uses `onAuthStateChanged` from Firebase Auth. It has three states:
1. `user === undefined` (auth not yet resolved) → shows a fullscreen loading spinner
2. `user === null` (not logged in) → `<Navigate to="/login" replace />`
3. `user` exists → renders the children components

It wraps pages like Dashboard, InterviewPage, and the career tools.

**Technical**: This is client-side route protection. The actual API endpoints have no server-side auth, so a determined user could bypass this. True security requires server-side token verification.

---

**Q3: What is the Vite proxy configured to do?**

**Answer**: In `vite.config.js`, the proxy setting forwards any request starting with `/api` to `http://localhost:5000`. This means the frontend can call `/api/interview` without specifying the full backend URL, avoiding CORS issues in development.

```javascript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000",
    },
  },
}
```

---

**Q4: What is the purpose of the `cleanJSON.js` utility?**

**Answer**: It strips markdown code fences (` ```json ` and ` ``` `) from AI responses and then parses the JSON. If parsing fails, it returns a fallback object with default values.

```javascript
Input:  "```json\n{\"score\": 8}\n```"
Output: { score: 8 }

On failure: { score: 5, strengths: "Parsing failed", ... }
```

---

### Intermediate Level

**Q5: Why does the Stripe webhook route use `express.raw()` instead of `express.json()`?**

**Answer**: Stripe requires the raw request body for signature verification. The `stripe.webhooks.constructEvent()` method computes a signature from the raw body and compares it against the `Stripe-Signature` header. If `express.json()` parsed the body first, it would modify the body (e.g., changing the encoding, reordering keys), breaking the signature verification.

```javascript
// CORRECT ORDER:
app.use("/webhook", express.raw({ type: "application/json" })); // Raw body for Stripe
app.use(express.json()); // JSON parsing for all other routes
```

---

**Q6: How is speech recognition implemented, and what are its limitations?**

**Answer**: It uses the Web Speech API (`window.SpeechRecognition || window.webkitSpeechRecognition`). The implementation:
- Creates a recognition instance with `continuous: false, interimResults: false`
- On result: appends the transcript to the input field
- Deduplicates by tracking last transcript text

**Limitations**:
1. **Browser support**: Only Chrome/Chromium. Firefox and Safari don't support `webkitSpeechRecognition`
2. **No fallback**: If the API fails, there's no alternative input method within the speech system
3. **Race conditions**: The `recognitionRef` pattern creates duplicate instances (one in useEffect, one in startListening)
4. **No retry logic**: If speech recognition errors, the instance is discarded and not recreated

---

**Q7: Why is the feedback API call fire-and-forget in `sendMessage()`?**

**Answer**: Looking at the code:

```javascript
try {
  await getFeedback({ question: lastQuestion, answer: text });
} catch {}
```

The feedback is sent to the backend and the result is awaited, but it's never stored in state or displayed. The `.catch {}` silently swallows any errors. This appears to be an **incomplete feature** — the feedback was intended to be shown but the UI integration was never finished.

---

**Q8: How does the app handle the AI "thinking" state?**

**Answer**: A `loading` boolean state variable controls:
1. A spinner with "AI thinking..." text rendered next to the chat
2. The input field is `disabled={loading}`
3. The Send button is `disabled={loading || !input.trim()}`
4. The microphone button is `disabled={loading}`

The user cannot interact while waiting for the AI response, preventing duplicate requests.

---

### Advanced Level

**Q9: What security vulnerabilities exist because the backend has no authentication middleware?**

**Answer**: Several critical vulnerabilities:

1. **Unauthorized API access**: Anyone can call `POST /api/interview`, `/api/feedback`, `/api/completion` without any token or API key
2. **Resource exhaustion**: An attacker could send thousands of requests, draining the Groq API quota and incurring costs
3. **Data exposure**: If any sensitive data were stored, it would be accessible without auth
4. **No rate limiting**: No protection against DoS attacks or brute force

The only "protection" is that backend URL isn't publicized, but that's security by obscurity.

**Fix**: Implement Firebase Auth token verification middleware:
```javascript
import { getAuth } from "firebase-admin/auth";

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

---

**Q10: The fallback error in interviewController.js returns a hardcoded question. What's wrong with this approach?**

**Answer**: Three problems:

1. **Silent failure**: The user has no idea the AI failed. They might think this is a legitimate question and try to answer, wasting time
2. **No retry mechanism**: If Groq is temporarily down, the app should retry or at least inform the user
3. **Stale context**: The fallback question ("Explain time complexity of binary search") has no connection to the conversation history

**Better approach**:
```javascript
try {
  const response = await groq.chat.completions.create({...});
  res.json({ reply: response.choices[0].message.content });
} catch (error) {
  console.error("GROQ ERROR:", error);
  res.status(503).json({
    error: "AI service temporarily unavailable",
    retryAfter: 5
  });
}
```

---

**Q11: Why is storing interview data only in React state problematic?**

**Answer**: Major issues:

1. **Page refresh loses everything**: All messages, scores, and progress are lost if the user refreshes
2. **No history**: Users can't review past interviews or track improvement over time
3. **No analytics**: The platform can't measure user engagement or common weak areas
4. **Dashboard is fake**: The "Recent Sessions" table and stats are hardcoded mock data
5. **Cannot resume**: If the user navigates away, they can't continue where they left off

**Fix**: Persist to Firestore:
```javascript
// After each AI response:
await addDoc(collection(db, "interviews"), {
  userId: user.uid,
  role,
  messages: [...messages, aiMsg],
  timestamp: serverTimestamp()
});
```

---

**Q12: Explain the double `recognitionRef` pattern and its bug.**

**Answer**: The code creates SpeechRecognition instances in two places:

```javascript
// Place 1: useEffect (line 59-87)
useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  let recognition = new SpeechRecognition();
  recognition.onresult = (event) => { /* handle transcript */ };
  recognitionRef.current = recognition;
  return () => { recognitionRef.current?.abort(); };
}, []);

// Place 2: startListening (line 109-132)
const startListening = () => {
  if (recognitionRef.current) {
    recognitionRef.current.start();
    return;
  }
  const fresh = new SpeechRecognition();
  recognitionRef.current = fresh;
};
```

**Bug**: The `useEffect` creates an instance on mount and stores it. But `startListening` recreates it if the ref is null. If the `useEffect`'s instance dies (speech ends or errors), `startListening` creates a new one. But the `useEffect` cleanup (on unmount) will try to abort the **original** instance, which has been replaced. This can cause "abort on already-aborted instance" errors.

**Fix**: Single source of truth:
```javascript
const recognitionRef = useRef(null);

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const createRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = handleResult;
    recognition.onerror = () => setTimeout(createRecognition, 1000);
    recognitionRef.current = recognition;
  };

  createRecognition();
  return () => recognitionRef.current?.abort();
}, []);
```

---

**Q13: The Dashboard shows hardcoded mock data. How would you make it dynamic?**

**Answer**: The mock data in Dashboard.jsx (`stats`, `recentInterviews`) is hardcoded:

```javascript
const stats = [
  { label: "Preparation Index", value: "68%", ... },
  { label: "Interviews Completed", value: "7", ... },
  // ...
];

const recentInterviews = [
  { role: "Frontend Developer", score: 84, ... },
  // ...
];
```

To make it dynamic:
1. Add Firestore collections: `interviews`, `feedback`
2. On Dashboard mount, query:
   - `query(collection(db, "interviews"), where("userId", "==", user.uid), orderBy("date", "desc"), limit(10))`
   - Aggregate scores from feedback collection
3. Calculate real stats from actual interview data
4. Replace hardcoded arrays with state populated from Firestore

---

**Q14: What happens if the Groq API key expires?**

**Answer**: Every API call to Groq will fail with a 401/403 error. The behavior depends on the controller:

- **Interview controller**: Catches error, returns fallback question. User gets binary search questions forever with no explanation
- **Feedback controller**: Returns "Unable to generate feedback" silently
- **Completion controller**: Returns 500 with error details

**None of these give the user a clear message** that the service is down due to an expired key. A proper solution would check the error type and return a user-friendly maintenance message.

---

**Q15: Why does the signup page navigate to `/dashboard` when the route is defined as `/service`?**

**Answer**: This is a **bug**. In `App.jsx`:

```javascript
<Route path="/service" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
```

But in `Signup.jsx` and `Login.jsx`:
```javascript
navigate("/dashboard"); // Route does NOT exist!
```

This means after signup/login, the user gets a blank page because `/dashboard` doesn't match any route. The correct redirect should be `navigate("/service")`.

---

## 11. Challenges & Improvements

### Technical Challenges

| Challenge | Description | Impact | Solution |
|-----------|-------------|--------|----------|
| No state persistence | Interview data lost on refresh | Users can't review past sessions | Add Firestore persistence |
| Speech recognition race conditions | Duplicate instances, abort errors | Mic may fail mid-session | Single-source ref pattern |
| Feedback fire-and-forget | Feedback generated but discarded | Feature is incomplete | Store and display feedback |
| Broken signup/login redirect | Navigates to undefined `/dashboard` | Users see blank page | Fix to `/service` |
| Dashboard mock data | All stats hardcoded | No real value to users | Query actual database |
| Stripe subscription not activated | Webhook TODO: update Firestore | Paying users get no upgrade | Complete the webhook handler |

### Security Challenges

| Challenge | Severity | Details |
|-----------|----------|---------|
| No backend auth | **Critical** | Anyone can call all endpoints |
| .env committed to repo | **High** | API keys exposed in git history |
| No rate limiting | Medium | API can be abused |
| No input sanitization | Medium | Potential injection vectors |
| No Helmet.js | Low | Missing security headers |

### Performance Bottlenecks

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| No streaming | User waits for full AI response | Implement SSE/WebSocket streaming |
| Large history payload | Bandwidth increases with session length | Truncate/summarize older messages |
| No caching | Every tool request hits Groq | Cache common resume/CV analyses |
| No lazy loading | All JS bundled together | React.lazy + Suspense per route |
| No React.memo | Unnecessary re-renders | Memoize MessageBubble, ChatBox |

### Scalability Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| Single server process | Cannot handle concurrent users | Horizontal scaling with PM2/cluster |
| No queue system | All requests hit Groq simultaneously | Add Redis queue + batch processing |
| No connection pooling | Firestore connections not managed | Firebase Admin SDK handles this |
| Stateful in-memory data | Cannot scale to multiple instances | Move state to DB |

### Known Bugs

1. **Signup/Login navigate to `/dashboard`** (route is `/service`)
2. **Speech recognition dual-instance** (useEffect vs startListening)
3. **Timer continues after end** (setInterval may not clear immediately)
4. **Feedback never displayed** (fire-and-forget with no state update)
5. **No error boundary** (uncaught errors crash entire app)

---

## 12. Security Analysis

### Current Security Posture

| Feature | Status | Assessment |
|---------|--------|------------|
| JWT Authentication (backend) | ❌ Missing | All endpoints public |
| JWT Authentication (frontend) | ✅ Firebase SDK | Client-side only |
| Password Hashing | ✅ Firebase Auth | bcrypt, handled by Firebase |
| SQL Injection | ✅ N/A | Firestore is NoSQL |
| XSS Protection | ⚠️ Partial | React escapes JSX. ReactMarkdown could be unsafe if misconfigured |
| CORS | ✅ Configured | Whitelist: localhost:5173 + FRONTEND_URL |
| Environment Variables | ⚠️ .env committed | API keys exposed in git |
| Rate Limiting | ❌ Missing | No protection against abuse |
| Stripe Webhook | ✅ Verified | Signature verification implemented |
| Input Validation | ⚠️ Minimal | Only userPrompt required check |
| Helmet.js | ❌ Missing | No security headers |
| CSRF Protection | ❌ Missing | No CSRF tokens |

### Critical Issues

**1. .env File Committed to Git**

The `backend/.env` file contains:
```


**Impact**: Anyone with repo access can use these keys to call Groq API (incurring costs) or Stripe API (potentially refunding charges, viewing payment data).

**Fix**: 
1. Remove .env from git tracking: `git rm --cached backend/.env`
2. Add `backend/.env` to `.gitignore`
3. Rotate all three API keys immediately
4. Use GitHub Secrets or environment variables in deployment

**2. No Backend Authentication**

All three API endpoints (`/api/interview`, `/api/feedback`, `/api/completion`) accept requests from any client without any form of authentication.

**Impact**: 
- Anyone can use the Groq API through our backend, draining quota
- No user attribution for API usage
- Cannot enforce rate limits per user

**Fix**: Add Firebase Admin SDK to verify ID tokens:
```javascript
// middleware/auth.js
import { getAuth } from "firebase-admin/auth";

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decodedToken = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    req.userId = decodedToken.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

---

## 13. Performance Analysis

### Current Performance Status

| Metric | Status | Details |
|--------|--------|---------|
| Initial Load Time | ⚠️ Moderate | Single bundle includes all pages |
| Time to Interactive | ⚠️ Moderate | Firebase SDK initialization |
| API Response Time | ⚠️ Variable | Depends on Groq latency (200ms-3s) |
| Bundle Size | ❌ Large | 172 frontend packages, no tree-shaking audit |
| Render Performance | ⚠️ No optimization | No React.memo, useMemo, useCallback |
| Image Optimization | ✅ Minimal | Only hero.png |

### Performance Optimizations Needed

**Lazy Loading / Code Splitting**
```javascript
// Instead of:
import Dashboard from "./pages/Dashboard";

// Do:
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// Wrap in Suspense:
<Route path="/service" element={
  <Suspense fallback={<Loading />}>
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  </Suspense>
}/>
```

**Memoization**
```javascript
// MessageBubble re-renders on every message change
export default React.memo(MessageBubble);

// ChatBox re-renders on every message
export default React.memo(ChatBox);

// Prevent expensive recalculations
const atsScoreColor = useMemo(() => {
  if (result.atsScore >= 80) return "text-emerald-400";
  if (result.atsScore >= 60) return "text-amber-400";
  return "text-red-400";
}, [result.atsScore]);
```

**API Streaming**
```javascript
// Instead of waiting for full response, stream tokens:
// Backend: 
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
});

const stream = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages,
  stream: true,  // Enable streaming
});

for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ token: chunk.choices[0]?.delta?.content })}\n\n`);
}
res.end();
```

**Request Batching/Debouncing**
```javascript
// Debounce tool inputs before sending
const debouncedAnalyze = useCallback(
  debounce(handleAnalyze, 500),
  []
);
```

---

## 14. Deployment

### Current Setup

```
Root package.json scripts:
- dev:   concurrently starts backend (port 5000) + frontend (port 5173)
- build: vite build → frontend/dist/
- start: node server.js (backend only)
```

### Frontend Deployment

**Build**:
```bash
cd frontend
npm run build
# Output: frontend/dist/
# Static files: index.html, favicon.svg, icons.svg, assets/*.js, assets/*.css
```

**Environment Variables** (set at build time):
```
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:5000
```

**Hosting Options**: Vercel, Netlify, Firebase Hosting, AWS S3 + CloudFront, Nginx

### Backend Deployment

**Start**:
```bash
cd backend
npm start  # node server.js
```

**Environment Variables**:
```
PORT=5000
GROQ_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
FRONTEND_URL=https://your-frontend.com
```

**Hosting Options**: Railway, Render, Fly.io, AWS EC2, Google Cloud Run, Heroku

### Production Configuration

**Nginx Reverse Proxy** (recommended):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Frontend served by Nginx**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

**PM2 Process Manager**:
```bash
npm install -g pm2
pm2 start server.js --name ai-interview-backend
pm2 save
pm2 startup
```

---

## 15. Every File Explained

### Root Files

| File | Purpose | Execution Flow |
|------|---------|----------------|
| `package.json` | Monorepo orchestrator. Defines `dev` (concurrently), `build`, `start` scripts | `npm run dev` starts both servers |
| `.gitignore` | Ignores node_modules, dist, .env patterns | Git exclusion rules |
| `README.md` | Default Vite template README (not customized) | Documentation |
| `skills-lock.json` | opencode AI tool skill configuration | Agent configuration |

### Backend Files

| File | Purpose | Connected To | Execution |
|------|---------|-------------|-----------|
| `server.js` | Express app entry. Configures CORS, routes, Stripe, webhook, health check | Routes, stripe, dotenv | `node server.js` → listens on PORT |
| `package.json` | ES Modules, deps: express, cors, dotenv, groq-sdk, stripe, openai | npm registry | `npm install` |
| `.env` | Environment secrets (⚠️ committed) | server.js via dotenv | Loaded at startup |
| `config/groq.js` | Groq SDK singleton with API key | Controllers | Imported by controllers |
| `routes/interviewRoutes.js` | `POST /` → handleInterview | interviewController | Mounted at /api/interview |
| `routes/feedbackRoutes.js` | `POST /` → handleFeedback | feedbackController | Mounted at /api/feedback |
| `routes/completionRoutes.js` | `POST /` → handleCompletion | completionController | Mounted at /api/completion |
| `controllers/interviewController.js` | Builds system prompt, calls Groq, returns reply | groq config, interviewRoutes | Called on POST /api/interview |
| `controllers/feedbackController.js` | Calls Groq for score/strengths/weaknesses | groq config, feedbackRoutes | Called on POST /api/feedback |
| `controllers/completionController.js` | Generic AI with system+user prompt | groq config, completionRoutes | Called on POST /api/completion |
| `utils/cleanJSON.js` | Strips fences, parses JSON, fallback | Used by frontend api.js (duplicated) | Exported function |

### Frontend Files

| File | Purpose | Connected To | Execution |
|------|---------|-------------|-----------|
| `index.html` | HTML shell with Inter font, meta tags, root div | main.jsx | First file loaded by browser |
| `package.json` | React 19, Firebase 12, Framer Motion, Stripe, React Router 7 | npm registry | `npm install` |
| `vite.config.js` | React + Tailwind plugins, proxy /api → 5000 | Vite build | `npx vite` |
| `.env` | VITE_API_URL, VITE_BACKEND_URL | api.js, stripe.js | Loaded at build/dev |
| `.nvmrc` | Node version specification | Node version manager | `nvm use` |
| `eslint.config.js` | ESLint configuration | Code quality | `npx eslint` |
| `src/main.jsx` | React entry point. BrowserRouter + ThemeProvider wrapping App | App.jsx, ThemeContext | Called by index.html |
| `src/App.jsx` | Route definitions (8 routes, 4 protected) | All pages, ProtectedRoute | Rendered by main.jsx |
| `src/App.css` | Legacy Vite template styles (unused in production) | None | Can be removed |
| `src/index.css` | Tailwind CSS v4 with custom theme, glass utilities, animations | main.jsx | Global styles |
| `src/firebase.js` | Firebase app init, exports auth + db | Auth pages, Dashboard | Imported by multiple files |
| `src/api/api.js` | Fetch wrappers: sendInterviewMessage, getFeedback, getCompletion, safeParseJSON | InterviewPage, tool pages | Imported by pages |
| `src/api/stripe.js` | Stripe checkout session creation with redirect | Pricing page | Called on plan selection |
| `src/context/ThemeContext.jsx` | Dark/light theme with localStorage + system preference | App.jsx, Navbar | Wraps entire app |
| `src/components/ui/Button.jsx` | Reusable button: 5 variants, 3 sizes, loading spinner | All pages | Imported by pages |
| `src/components/ui/Card.jsx` | Reusable card: 4 variants, hover, clickable | All pages | Imported by pages |
| `src/components/ui/Input.jsx` | Input with label + error | Login, Signup | Imported by pages |
| `src/components/ui/Badge.jsx` | Badge: 7 color variants + gradient | Dashboard, Pricing, etc. | Imported by pages |
| `src/components/ui/Loading.jsx` | LoadingSpinner, Skeleton, SkeletonText, SkeletonCard, Loading | ProtectedRoute, Dashboard, tool pages | Imported by pages |
| `src/components/ChatBox.jsx` | Maps messages array to MessageBubble components | InterviewPage | Imported by InterviewPage |
| `src/components/MessageBubble.jsx` | Single message with ReactMarkdown, custom code/list styling | ChatBox | Imported by ChatBox |
| `src/components/RoleSelector.jsx` | Role dropdown (Frontend/Backend/Full Stack/DSA/HR) | InterviewPage | Imported by InterviewPage |
| `src/pages/ProtectedRoute.jsx` | Auth guard: loading → redirect → children | App.jsx | Wraps protected routes |
| `src/pages/Navbar.jsx` | Responsive nav with auth, theme, mobile bottom nav | App.jsx | Rendered in App layout |
| `src/pages/Home.jsx` | Marketing landing page with hero, features, comparison | App.jsx | Route: / |
| `src/pages/Login.jsx` | Login form with Firebase email/password auth | App.jsx | Route: /login |
| `src/pages/Signup.jsx` | Signup form with Firebase auth + Firestore user creation | App.jsx | Route: /signup |
| `src/pages/Dashboard.jsx` | Main dashboard with stats, tools, sessions (mock data) | App.jsx | Route: /service |
| `src/pages/InterviewPage.jsx` | Core interview: camera, speech, chat, timer, AI Q&A | App.jsx | Route: /interview |
| `src/pages/Pricing.jsx` | 3-tier subscription cards with Stripe checkout | App.jsx | Route: /pricing |
| `src/pages/Success.jsx` | Payment success confirmation | App.jsx | Route: /success |
| `src/pages/ResumeTailor.jsx` | ATS resume analyzer with AI | App.jsx | Route: /resume |
| `src/pages/CoverLetterGenerator.jsx` | Cover letter generator with tone selection | App.jsx | Route: /coverletter |
| `src/pages/STARBuilder.jsx` | STAR behavioral story analyzer | App.jsx | Route: /star |
| `src/pages/OutreachHelper.jsx` | LinkedIn/Email/Twitter outreach generator | App.jsx | Route: /outreach |

---

## 16. Execution Flow: Start Interview to AI Feedback

### Complete Internal Trace

```
USER CLICKS "Start Session"
│
├── InterviewPage.startInterview()
│   ├── setLoading(true), setIsInterviewStarted(true)
│   │
│   ├── useEffect [isInterviewStarted=true] TRIGGERS:
│   │   └── navigator.mediaDevices.getUserMedia({ video: true, audio: false })
│   │       └── Browser permission dialog (if not granted)
│   │       └── On success:
│   │           └── streamRef.current = stream
│   │           └── videoRef.current.srcObject = stream
│   │           └── Camera feed visible in sidebar
│   │       └── On error:
│   │           └── console.error("Camera access error:", err)
│   │           └── Video area remains black
│   │
│   ├── useEffect [messages.length > 0] TRIGGERS:
│   │   └── timerRef.current = setInterval(() => setTimeElapsed(t+1), 1000)
│   │   └── Timer display starts updating
│   │
│   ├── API CALL: fetch `POST ${BASE_URL}/interview`
│   │   ├── Request: {
│   │   │   role: "Frontend Developer",
│   │   │   message: "Start interview",
│   │   │   history: []
│   │   │ }
│   │   │
│   │   ├── EXPRESS ROUTING:
│   │   │   └── POST /api/interview
│   │   │       └── interviewRoutes.js
│   │   │           └── router.post("/", handleInterview)
│   │   │
│   │   ├── CONTROLLER: handleInterview(req, res)
│   │   │   ├── Destructure: { role, message, history } = req.body
│   │   │   ├── Build messages array:
│   │   │   │   └── [
│   │   │   │       { role: "system", content: `You are a strict technical interviewer.\nRole: ${role}\nSTRICT RULES:\n- Ask ONLY ONE...` },
│   │   │   │       ...history (empty array initially),
│   │   │   │       { role: "user", content: "Start interview" }
│   │   │   │   ]
│   │   │   │
│   │   │   ├── GROQ API CALL:
│   │   │   │   └── groq.chat.completions.create({
│   │   │   │       model: "llama-3.1-8b-instant",
│   │   │   │       messages: [...built messages]
│   │   │   │   })
│   │   │   │   │
│   │   │   │   └── Net: HTTP POST to api.groq.com
│   │   │   │       └── Headers: Authorization: Bearer gsk_***
│   │   │   │       └── Body: { model, messages }
│   │   │   │       └── Groq LPU processes Llama 3.1 8B
│   │   │   │       └── Response: { choices: [{ message: { content: "..." } }] }
│   │   │   │
│   │   │   ├── Extract: const reply = response.choices[0].message.content
│   │   │   │   └── Example: "What is the difference between let, const, and var in JavaScript?"
│   │   │   │
│   │   │   └── Response: res.json({ reply: "What is the difference..." })
│   │   │
│   │   └── Frontend receives: { reply: "What is the difference..." }
│   │
│   ├── setMessages([{ role: "assistant", content: data.reply }])
│   │   └── ChatBox re-renders with first AI message
│   │   └── ReactMarkdown renders the text
│   │
│   ├── speak(data.reply)
│   │   ├── const cleanText = reply.replace(/📌|⚡|🚀|\*|\n/g, "")
│   │   ├── const utterance = new SpeechSynthesisUtterance(cleanText)
│   │   ├── utterance.lang = "en-US"
│   │   ├── utterance.rate = 1.0
│   │   ├── isSpeakingRef.current = true
│   │   ├── const wasListening = listeningRef.current (false initially)
│   │   ├── window.speechSynthesis.cancel()
│   │   ├── window.speechSynthesis.speak(utterance)
│   │   └── utterance.onend:
│   │       └── isSpeakingRef.current = false
│   │
│   └── setLoading(false)
│
─── USER HEARS QUESTION, THINKS, CLICKS MIC ─────────────

│
├── startListening()
│   ├── lastTranscriptRef.current = ""
│   ├── recognitionRef.current exists? (from useEffect) → yes
│   │   └── try: recognitionRef.current.start()
│   │       └── Web Speech API activates microphone
│   │       └── Browser permission dialog (if not granted)
│   │       └── recognition.onstart → setListening(true)
│   │
│   ├── UI updates:
│   │   └── Mic button turns red
│   │   └── "LIVE" badge appears
│   │   └── Speech visualizer bars animate
│   │
│   └── User speaks answer into microphone
│
─── SPEECH RECOGNITION PROCESSES ─────────────────────────

│
├── recognition.onresult(event)
│   ├── const text = event.results[0][0].transcript
│   ├── if (!event.results[0].isFinal) return (wait for final)
│   ├── if (text === lastTranscriptRef.current) return (dedup)
│   ├── lastTranscriptRef.current = text
│   └── setInput(prev => prev ? prev + " " + text : text)
│       └── Input field shows transcribed text
│
├── recognition.onend → setListening(false)
│
─── USER EDITS TEXT (optional), PRESSES ENTER ───────────

│
├── sendMessage()
│   ├── const text = input || customInput
│   ├── if (!text.trim()) return
│   │
│   ├── const userMsg = { role: "user", content: text }
│   ├── setMessages(prev => [...prev, userMsg])
│   │   └── ChatBox re-renders, user message appears
│   │
│   ├── setInput(""), setLoading(true)
│   │
│   ├── API CALL: fetch `POST ${BASE_URL}/interview`
│   │   ├── Request: {
│   │   │   role: "Frontend Developer",
│   │   │   message: "let and const are both block-scoped...",
│   │   │   history: [
│   │   │     { role: "system", content: "..." },
│   │   │     { role: "assistant", content: "What is the difference..." },
│   │   │     { role: "user", content: "let and const are both block-scoped..." }
│   │   │   ]
│   │   │ }
│   │   │
│   │   └── Backend repeats same flow as step above
│   │       └── But now history has context!
│   │       └── Groq evaluates answer in context
│   │       └── Returns: { reply: "Good explanation. You mentioned hoisting correctly. Next question: Explain prototypal inheritance." }
│   │
│   ├── speak(data.reply)
│   │   └── User hears feedback + next question
│   │
│   ├── (FIRE-AND-FORGET) API CALL: fetch `POST ${BASE_URL}/feedback`
│   │   ├── Request: {
│   │   │   question: "What is the difference between let, const, and var?",
│   │   │   answer: "let and const are both block-scoped..."
│   │   │ }
│   │   ├── Backend: handleFeedback
│   │   │   └── Groq returns score + strengths + weaknesses + improved answer
│   │   └── Response is RECEIVED but NEVER STORED or DISPLAYED
│   │
│   ├── setMessages(prev => [...prev, aiMsg])
│   │   └── ChatBox re-renders, AI response appears
│   │
│   ├── useEffect [messages]: bottomRef.scrollIntoView()
│   │
│   └── setLoading(false)
│
─── LOOP CONTINUES UNTIL USER CLICKS "END" ──────────────

│
├── Click "End" button
├── confirm("End current interview session? Progress will be reset.")
├── If confirmed:
│   ├── setIsInterviewStarted(false)
│   ├── setMessages([])
│   ├── setTimeElapsed(0)
│   ├── clearInterval(timerRef.current)
│   │
│   ├── useEffect cleanup [isInterviewStarted]:
│   │   └── streamRef.current?.getTracks().forEach(track => track.stop())
│   │   └── Camera turns off
│   │
│   └── UI returns to Start Session screen
│
─── ⚠️ ALL DATA LOST — NOTHING PERSISTED ────────────────
```

---

## 17. Code Walkthrough: Key Functions

### `handleInterview` (interviewController.js)

```javascript
export const handleInterview = async (req, res) => {
  try {
    const { role, message, history = [] } = req.body;

    // Step 1: Build messages array with system prompt + history + new message
    const messages = [
      {
        role: "system",
        content: `You are a strict technical interviewer.\nRole: ${role}\n...`
      },
      ...history,  // Spread previous conversation
      { role: "user", content: message },
    ];

    // Step 2: Call Groq API
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    // Step 3: Extract and return the AI's reply
    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    // Step 4: Silent fallback on error
    console.log("GROQ ERROR:", error.message);
    res.json({
      reply: "Something went wrong. Let's continue the interview. Explain time complexity of binary search."
    });
  }
};
```

**Time Complexity**: O(n) for spreading history array (n = number of previous messages). API call is I/O bound.

**Design Decision**: The history spreading pattern `...history` maintains full conversation context but grows linearly. For long interviews, this could approach token limits. A more robust solution would summarize or truncate old messages.

**Design Decision**: The error fallback silently returns a hardcoded question. This was chosen over returning a 500 error to avoid disrupting the user's interview experience. However, it hides failures from the user.

---

### `sendMessage` (InterviewPage.jsx)

```javascript
const sendMessage = async (customInput) => {
  // Step 1: Get text from input or custom parameter
  const text = customInput || input;
  if (!text.trim()) return;

  // Step 2: Add user message to local state
  const userMsg = { role: "user", content: text };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");          // Clear input field
  setLoading(true);      // Show loading state

  try {
    // Step 3: Send to AI interviewer
    const data = await sendInterviewMessage({
      role,
      message: text,
      history: messages,  // ⚠️ Uses state variable — may be stale closure!
    });
    const aiMsg = { role: "assistant", content: data.reply };

    // Step 4: Speak the response
    speak(data.reply);

    // Step 5: Fire-and-forget feedback (⚠️ discarded)
    const lastQuestion = messages[messages.length - 1]?.content;
    try { await getFeedback({ question: lastQuestion, answer: text }); } catch {}

    // Step 6: Add AI response to messages
    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    console.error("API transmission error:", err);
  }

  setLoading(false);
};
```

**Time Complexity**: O(n) for state updates (n = messages length). API call I/O bound.

**Design Issue — Stale Closure**: The `messages` variable used in `sendInterviewMessage({...history: messages})` is captured in the closure. If the user sends messages rapidly, the `messages` state may be stale. This is a common React pitfall — the dependency is on the closure, not the latest state.

**Design Issue — Feedback Discarded**: The feedback API response is never used. This appears to be an incomplete feature where the original intent was to display feedback alongside the AI response.

---

### `startListening` (InterviewPage.jsx)

```javascript
const startListening = () => {
  // Step 1: Reset dedup reference
  lastTranscriptRef.current = "";

  // Step 2: Try to use existing recognition instance
  if (recognitionRef.current) {
    try {
      recognitionRef.current.start();
      return;
    } catch {
      // Instance died — clean up and create new
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }

  // Step 3: Create fresh recognition instance
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return; // Browser not supported

  const fresh = new SpeechRecognition();
  fresh.lang = "en-US";
  fresh.continuous = false;
  fresh.interimResults = false;

  // Step 4: Set up event handlers
  fresh.onstart = () => { setListening(true); listeningRef.current = true; };
  fresh.onend = () => { setListening(false); listeningRef.current = false; };
  fresh.onresult = (event) => {
    const text = event.results[0][0].transcript;
    if (!event.results[0].isFinal) return;      // Wait for final result
    if (text === lastTranscriptRef.current) return; // Dedup
    lastTranscriptRef.current = text;
    setInput((prev) => (prev ? prev + " " + text : text)); // Append to input
  };
  fresh.onerror = () => {
    if (recognitionRef.current === fresh) recognitionRef.current = null;
  };

  // Step 5: Store instance and start
  recognitionRef.current = fresh;
  try { fresh.start(); } catch {}
};
```

**Time Complexity**: O(1). All operations are constant time.

**Design Issue — Dual Instance Bug**: The `useEffect` at line 59 creates a SpeechRecognition instance on component mount. But `startListening()` creates a **new** instance if the ref is null. If the `useEffect`'s instance is still alive but in an ended state, `startListening` will successfully call `.start()` on it. But if that instance errors out, `startListening` creates a new one while the `useEffect` cleanup still references the original. This creates a race condition where aborting the old instance may error because it was already replaced.

---

### `speak` (InterviewPage.jsx)

```javascript
const speak = (text) => {
  if (!window.speechSynthesis) return;

  // Step 1: Clean text of emojis and markdown
  const cleanText = text.replace(/📌|⚡|🚀|\*|\n/g, "");

  // Step 2: Create utterance
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.volume = 1.0;

  // Step 3: Pause listening while speaking
  isSpeakingRef.current = true;
  const wasListening = listeningRef.current;
  if (wasListening) abortListening();

  // Step 4: Cancel any previous speech and start
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  // Step 5: Resume listening after speech ends
  utterance.onend = () => {
    if (wasListening) {
      setTimeout(() => {
        if (!isSpeakingRef.current) startListening();
      }, 400);  // 400ms gap
    }
    isSpeakingRef.current = false;
  };
};
```

**Time Complexity**: O(n) for regex replacement (n = text length). TTS is browser-controlled.

**Design Decision**: The `400ms` delay before resuming listening gives a natural pause between AI speaking and user responding. The `isSpeakingRef` check prevents double-starting if `speak` is called again quickly.

---

### `handleFeedback` (feedbackController.js)

```javascript
export const handleFeedback = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Single user message with formatted prompt
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Question: ${question}\nAnswer: ${answer}\n\nGive:\n- Score (0-10)\n- Strengths\n- Weaknesses\n- Improved Answer`
      }],
    });

    res.json({ feedback: response.choices[0].message.content });
  } catch (error) {
    console.log("FEEDBACK ERROR:", error.message);
    res.json({ feedback: "Unable to generate feedback" });
  }
};
```

**Time Complexity**: O(1). API call is I/O bound.

**Design Issue — No System Prompt**: Unlike the interview controller, this sends feedback instructions as a **user** message, not a **system** message. This gives the AI less explicit persona instructions, potentially leading to inconsistent formatting.

**Design Issue — Raw Text Output**: The response is plain text with labels ("Score:", "Strengths:"). The frontend never parses this — it's received and discarded. If the intention was to display structured feedback, the AI should be prompted for JSON and parsed with `cleanJSON`.

---

### `handleCompletion` (completionController.js)

```javascript
export const handleCompletion = async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: userPrompt });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3,    // Lower = more deterministic
      max_tokens: 2048,     // Cap response length
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("COMPLETION CONTROLLER ERROR:", error.message);
    res.status(500).json({
      error: "Something went wrong while generating response",
      details: error.message,
    });
  }
};
```

**Time Complexity**: O(1). API call is I/O bound.

**Design Decision — temperature: 0.3**: Lower temperature makes the AI more deterministic and less creative. This is appropriate for JSON generation (Resume, STAR tools) where consistent structure is needed. The interview controller doesn't set temperature, defaulting to Groq SDK's default (typically 0.7-1.0), which allows more varied questioning.

**Design Decision — max_tokens: 2048**: Limits response to ~1500-2000 words. Prevents excessively long answers that could waste tokens.

---

### `cleanJSON` (utils/cleanJSON.js)

```javascript
export const cleanJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      score: 5,
      strengths: "Parsing failed",
      weaknesses: "Invalid AI format",
      improvedAnswer: "Try again"
    };
  }
};
```

**Time Complexity**: O(n) for regex replace (n = text length). JSON.parse is O(n).

**Limitations**:
1. Only handles ` ```json\n...\n``` ` format. What if AI wraps in ` ```\n...\n``` ` (no language tag)? → Removes the closing ``` but not the opening one, causing parse failure.
2. No handling of trailing commas: `{"score": 5,}` → JSON.parse throws
3. No handling of single quotes: `{'score': 5}` → JSON.parse throws
4. No handling of truncated responses if AI hits token limit
5. Fallback is always the same hardcoded object regardless of context

---

### `safeParseJSON` (frontend/api.js)

```javascript
export function safeParseJSON(text) {
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
```

**Same logic as cleanJSON** but returns `null` instead of fallback object. This is a **code duplication** — the same logic exists in both backend and frontend. The frontend version is newer (used by ResumeTailor and STARBuilder), suggesting the older `cleanJSON` on the backend is no longer used.

---

### `ProtectedRoute` (pages/ProtectedRoute.jsx)

```javascript
export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // State 1: Loading — auth not yet resolved
  if (user === undefined) {
    return <Loading fullScreen text="Authenticating..." />;
  }

  // State 2: Not authenticated — redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // State 3: Authenticated — render children
  return children;
}
```

**Time Complexity**: O(1). Firebase call is async but state change is instant.

**Design Decision**: The `user` starts as `undefined` (intentional) to distinguish between "not yet checked" and "not authenticated". This prevents a flash of the login page before Firebase resolves the auth state.

**Design Issue**: The auth state is checked on EVERY mount of ProtectedRoute. Since multiple routes use ProtectedRoute, each navigation re-checks. This is fine for Firebase (uses internal caching) but could be optimized with a global auth context.

---

### `ThemeContext` (context/ThemeContext.jsx)

```javascript
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Time Complexity**: O(1).

**Design Decision**: The `useState` initializer reads localStorage first, then falls back to `prefers-color-scheme` media query, then defaults to dark. This avoids a flash of wrong theme.

**Design Decision**: Theme is applied by adding/removing `light` class on `<html>`. The CSS in `index.css` uses `:root.light` to override CSS custom properties, flipping the entire palette. This is more performant than toggling classes on individual elements.

---

## 18. Future Improvements

### Architecture Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| Backend JWT Auth Middleware | **Critical** | 2 days | Add Firebase Admin SDK to verify tokens on all routes |
| Fix .env in Git | **Critical** | 1 hour | Remove from git, rotate keys, add to .gitignore |
| Code Splitting | High | 1 day | React.lazy + Suspense for each route |
| API Streaming | High | 3 days | Server-Sent Events for real-time AI response streaming |
| Error Boundaries | High | 1 day | React Error Boundary component for graceful crash recovery |
| TypeScript Migration | Medium | 2 weeks | Add type safety across the codebase |
| Testing Setup | Medium | 1 week | Jest + React Testing Library + Supertest for API |

### Database Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| Interviews Collection | **High** | 2 days | Persist interview sessions with messages, scores, timestamps |
| Feedback Collection | **High** | 1 day | Store AI feedback for historical analysis |
| Subscriptions Collection | **High** | 1 day | Complete Stripe webhook to update Firestore subscription status |
| Firestore Security Rules | **High** | 1 day | Restrict read/write access to own documents only |
| Real Dashboard Data | **High** | 3 days | Query actual interviews/feedback for real stats and history |

### Authentication Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| Backend JWT Verification | **Critical** | 2 days | Add Firebase Admin SDK auth middleware |
| Email Verification | Medium | 1 day | Require verified email before allowing interviews |
| Password Reset | Medium | 1 day | Add "Forgot Password" flow |
| Role-Based Access | Medium | 2 days | Enforce Free/Pro/Advanced limits per user tier |
| OAuth Providers | Low | 2 days | Add Google/GitHub login options |

### UI/UX Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| Fix Signup/Login Navigate | **Critical** | 10 min | Change `/dashboard` → `/service` |
| Display Feedback | **High** | 1 day | Show AI feedback in interview UI |
| Loading Skeletons | Medium | 1 day | Replace spinner with skeleton placeholders |
| Keyboard Shortcuts | Medium | 1 day | Ctrl+Enter to send, Esc to cancel |
| Interview History Page | Medium | 3 days | Review past sessions with scores |
| Dark Mode Animation | Low | 1 day | Smooth transition on theme toggle |

### Performance Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| React.memo on Chat Components | Medium | 1 day | Prevent unnecessary re-renders |
| Lazy Load Routes | Medium | 1 day | Code splitting per route |
| Caching for Tools | Low | 2 days | Cache resume analysis results (identical inputs) |
| Bundle Analysis | Low | 1 day | Analyze and reduce bundle size with vite-bundle-analyzer |

### Security Improvements

| Improvement | Priority | Effort | Description |
|-------------|----------|--------|-------------|
| Remove .env from Git | **Critical** | 1 hour | Protect API keys |
| Backend Auth Middleware | **Critical** | 2 days | Verify Firebase JWT on all routes |
| Rate Limiting | High | 1 day | express-rate-limit per IP/user |
| Helmet.js | Medium | 1 hour | Add security headers |
| Input Sanitization | Medium | 1 day | Sanitize all user inputs server-side |
| CORS Production Lockdown | Medium | 1 hour | Restrict to production domain only |

---

## 19. Resume Explanation Guide

### 30 Seconds (Elevator Pitch)

> "I built an AI-powered mock interview platform using React, Node.js, and Groq AI. It simulates realistic technical interviews with speech-to-text, real-time AI evaluation, and role-specific questioning for Frontend, Backend, DSA, and HR roles. Users practice anytime, get instant scores and feedback, and track their progress."

### 1 Minute

> "I developed a full-stack AI mock interview platform from scratch. The frontend uses React 19 with Vite and Tailwind CSS for a responsive dark-themed UI with Framer Motion animations. The backend is an Express.js server that proxies requests to Groq's Llama 3.1 8B model for AI interview simulation.
>
> Key features include: speech-to-text for verbal answers, text-to-speech for hearing questions, live camera feed, strict AI interviewer that evaluates answers in real-time, and supporting tools like an ATS resume analyzer, cover letter generator, and STAR behavioral story builder. Firebase handles authentication and user data, while Stripe manages subscriptions."
>
> *Wait for reaction, then add:* "One challenge was implementing reliable speech recognition that pauses while the AI speaks and resumes automatically. I used the Web Speech API with refs to manage the lifecycle."

### 3 Minutes

> **Project Overview**: This is an AI Interview Preparation platform that solves the problem of limited interview practice availability. Instead of scheduling sessions with peers, users can practice 24/7 with an AI interviewer.
>
> **Architecture**: It's a monorepo with a React frontend (Vite, Tailwind, Framer Motion, Firebase SDK) and an Express.js backend. The frontend handles auth and database directly via Firebase, while the backend is a thin AI proxy to Groq's API. Development is streamlined with concurrent running both servers and Vite's proxy for API calls.
>
> **Core Interview Feature**: The user selects a role (Frontend, Backend, DSA, HR) and starts a session. The AI interviewer is prompted with strict rules — one question at a time, no hints, direct feedback. The user can type or speak answers. Speech recognition transcribes verbal responses, and text-to-speech reads the AI's questions. A live camera feed adds interview pressure. The AI evaluates each answer and generates the next question based on context.
>
> **Supporting Tools**: I built four additional AI-powered tools — a Resume Tailor that gives ATS scores and keyword analysis, a Cover Letter Generator with tone selection, a STAR Builder that scores behavioral stories, and an Outreach Assistant for LinkedIn/email cold messages.
>
> **Technical Decisions**: I chose Groq's Llama 3.1 8B for its speed (800+ tokens/sec) and low cost, Firebase for serverless auth and database, and Stripe for subscription monetization with Free, Pro (₹199), and Advanced (₹499) tiers.
>
> **Challenges**: Handling speech recognition lifecycle was tricky — ensuring it pauses during AI speech and resumes correctly. Maintaining conversation context in AI prompts required careful history management. The Stripe webhook needed raw body parsing for signature verification, which required careful middleware ordering.
>
> **Results**: The platform provides an immediate, always-available interview practice environment without scheduling friction.

### 5 Minutes

> **Problem & Motivation**: Job seekers struggle to find realistic, on-demand interview practice. Pramp requires scheduling, Interviewing.io is expensive, and self-practice lacks feedback. I built this to provide a 24/7 AI-powered alternative.
>
> **Tech Stack**: React 19 with Vite 8 for lightning-fast HMR, Tailwind CSS 4 for styling, Framer Motion for animations, Firebase 12 for auth and Firestore, Express 5 backend with Groq SDK for AI, Stripe for payments, and React Router 7 for routing.
>
> **Architecture Deep Dive**: [Explain architecture diagram]
> - Frontend: Component-based with a reusable UI library (Button, Card, Badge, Input, Loading)
> - Backend: Thin Express server with 3 API routes + Stripe endpoints
> - Database: Firestore NoSQL — users collection only (interviews not yet persisted)
> - Auth: Firebase Auth with onAuthStateChanged and ProtectedRoute wrapper
>
> **Interview Flow In Detail**: [Step through the entire flow]
> 1. User selects role and starts session
> 2. Camera activates via getUserMedia
> 3. Backend builds a system prompt encoding strict interviewer persona
> 4. Groq Llama 3.1 generates first question
> 5. Frontend displays question and speaks it via SpeechSynthesis
> 6. User answers by typing or speaking (Web Speech API)
> 7. Full conversation history sent with each request for context
> 8. AI evaluates and generates next question
> 9. Feedback is generated but currently fire-and-forget (area for improvement)
>
> **Key Design Decisions**:
> - **No backend auth**: Expedited MVP but recognized security gap (planned fix)
> - **Groq over OpenAI**: Speed and cost for structured Q&A
> - **Temperature 0.3 for tools**: Consistent JSON output
> - **Strict system prompt**: Encodes realistic interviewer behavior
> - **Vite proxy**: Simplifies local development CORS
>
> **Challenges Overcome**:
> - Speech recognition lifecycle management with refs
> - Stripe webhook raw body handling
> - Prompt engineering for strict interview behavior
> - Responsive interview UI (desktop sidebar + mobile compact)
>
> **Future Plans**: Add interview persistence, backend auth, streaming AI responses, real dashboard data, email verification, and OAuth login.
>
> **What I'd Do Differently**: Use TypeScript from the start, add tests earlier, implement backend auth before going public, persist all interview data for analytics.

### HR Interview Version

> "I built a product that helps people land tech jobs — it directly solves a real pain point. The platform generates revenue through Stripe subscriptions with three tiers. I made technical decisions balancing cost, speed, and user experience. The project is live and functional, demonstrating end-to-end product development skills from conception to deployment."

### Technical Interview Version

> Focus on: React hooks and effects, Speech API integration, Express middleware ordering, AI prompt engineering, Firestore data modeling, Stripe payment flow, error handling strategies, JSON parsing edge cases, state management decisions, component composition patterns, and security considerations.

---

## 20. Mock Interview Section

### How to Use This Section

This section is designed for interactive practice. I (the interviewer) will ask you questions about the project. You answer, I evaluate, and provide the ideal answer.

### Setup

To begin the mock interview, ask me:

> "Start the mock interview"

Then answer each question I ask. After your answer, I will:
1. Evaluate your response
2. Point out what was good
3. Correct any mistakes or omissions
4. Provide the ideal answer

### Question Bank

#### Beginner Questions

1. "What is the purpose of the `ProtectedRoute` component and how does it work?"
2. "What does the `.env` file in the backend contain, and why is it important?"
3. "How does the Vite proxy configuration help during development?"
4. "What is the `cleanJSON.js` utility used for?"
5. "What is the role of the `onAuthStateChanged` function in the app?"

#### Intermediate Questions

6. "Why must the Stripe webhook route be defined before `express.json()`?"
7. "How does speech recognition work in the InterviewPage, and what are its limitations?"
8. "Explain the prompt engineering strategy for the AI interviewer. Why is the system prompt so strict?"
9. "The feedback API call is fire-and-forget — what's wrong with that, and how would you fix it?"
10. "Why does the Dashboard show hardcoded mock data instead of real data?"
11. "What's the difference between `handleInterview` and `handleCompletion` controllers?"
12. "How does the app handle the AI loading state in the interview UI?"

#### Advanced Questions

13. "Identify the race condition in the speech recognition implementation and propose a fix."
14. "What security vulnerabilities exist because the backend has no authentication?"
15. "The fallback error in interviewController returns a hardcoded question. Critique this approach."
16. "Why is storing interview data only in React state problematic? How would you fix it?"
17. "The signup page navigates to `/dashboard` but the route is `/service`. Explain the bug and its impact."
18. "How would you implement streaming AI responses for a real-time interview experience?"
19. "Design a Firestore schema that would support interview history, feedback persistence, and subscription management."
20. "What would you change about the system architecture to support 10,000 concurrent users?"

---

### Start the Mock Interview

Say **"Start the mock interview"** to begin, and I'll ask Question 1.
