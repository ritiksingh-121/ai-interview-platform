# Project Audit: AI Interview Platform (Frontend)

> **Date:** 2026-06-06
> **Scope:** Frontend codebase only (backend not included in this repository)
> **Total Lines of Code:** ~1,696 (src/ directory)
> **Repository:** `C:/Users/ritik/OneDrive/Documents/AI_Interview_Prep/frontend`

---

## 1. Current Architecture Overview

The AI Interview Platform is a **React Single-Page Application (SPA)** built with Vite. It functions as the consumer-facing frontend that communicates with an external backend API (hosted on Render) for AI interview logic, payment processing (Stripe), and data persistence. Firebase is used for Authentication (Firebase Auth) and user data storage (Cloud Firestore).

```
Browser (React SPA)
    ↕
Vite Build Pipeline → Static HTML/CSS/JS
    ↕
Render Backend (https://interview-prepp-1.onrender.com)
    ↕
Stripe API (Payments)
OpenAI API (Interview AI)
```

### Flow Diagram
```
User ──► Register/Login ──► Firebase Auth ──► Firestore (user profile)
   │
   └──► Dashboard ──► Select Role ──► Interview Page
                                            │
                        ┌────────────────────┘
                        │
                Start Interview ──► Backend API (/api/interview)
                        │
                        ├──► AI generates question (OpenAI)
                        ├──► User types/speaks answer
                        ├──► Submit to backend
                        └──► AI feedback (backend calls /api/feedback)
```

### Current Routing Architecture
| Route       | Component        | Access     | Description                     |
|-------------|------------------|------------|---------------------------------|
| `/`         | `Home`           | Public     | Landing page with marketing     |
| `/signup`   | `Signup`         | Public     | User registration (Firebase)    |
| `/login`    | `Login`          | Public     | User authentication (Firebase)  |
| `/service`  | `Dashboard`      | Protected  | User dashboard for interview    |
| `/pricing`  | `Pricing`        | Public     | Subscription plans              |
| `/success`  | `Success`        | Public     | Post-payment confirmation       |
| `/interview`| `InterviewPage`  | **Public** | AI interview interface          |

> ⚠️ **Critical:** `/interview` is NOT protected by `ProtectedRoute` — unauthenticated users can access the interview directly.

---

## 2. Tech Stack

### Core Framework
| Technology    | Version     | Purpose                                  |
|---------------|-------------|------------------------------------------|
| React         | 19.2.6      | UI library (latest as of audit)          |
| React DOM     | 19.2.6      | DOM rendering                            |
| Vite          | 8.0.14      | Build tool & dev server                  |
| React Router  | 7.15.1      | Client-side routing                      |
| Tailwind CSS  | 3.4.17      | Utility-first styling                    |
| PostCSS       | 8.5.15      | CSS processing                           |
| Autoprefixer  | 10.5.0      | Vendor prefix automation                 |

### External Services & SDKs
| Service       | Version     | Purpose                                  |
|---------------|-------------|------------------------------------------|
| Firebase      | 12.13.0     | Auth + Firestore (NoSQL database)        |
| Stripe JS     | 9.6.0       | Payment checkout                         |
| OpenAI SDK    | 6.34.0      | Unused directly (backend handles AI)     |

### Animation & UI
| Library       | Version     | Purpose                                  |
|---------------|-------------|------------------------------------------|
| Framer Motion | 12.40.0     | Component animations                     |
| React Markdown| 10.1.0      | Rich text rendering for AI responses     |

### Tooling
| Tool          | Purpose                                     |
|---------------|---------------------------------------------|
| ESLint        | Static code analysis (basic config)       |
| concurrently  | Running multiple scripts simultaneously     |

---

## 3. Folder Structure Analysis

```
frontend/
├── public/
│   ├── favicon.svg           # Favicon
│   └── icons.svg             # Unused SVG sprite (Vite template remnant)
├── src/
│   ├── api/
│   │   ├── api.js            # Interview & feedback API calls (2 functions)
│   │   └── stripe.js         # Stripe checkout handler (1 function)
│   ├── assets/
│   │   ├── hero.png          # Unused hero image
│   │   ├── react.svg         # Vite template asset (unused)
│   │   └── vite.svg          # Vite template asset (unused)
│   ├── components/
│   │   ├── ChatBox.jsx       # Chat message list container
│   │   ├── MessageBubble.jsx # Individual chat message (markdown)
│   │   └── RoleSelector.jsx  # Dropdown for interview role selection
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Signup.jsx        # Registration page (inline styles)
│   │   ├── Login.jsx         # Authentication page (inline styles)
│   │   ├── Navbar.jsx        # App navigation bar
│   │   ├── Dashboard.jsx     # User dashboard
│   │   ├── Pricing.jsx       # Subscription plans (Tailwind + Framer Motion)
│   │   ├── Success.jsx       # Payment confirmation
│   │   ├── InterviewPage.jsx # Main interview interface
│   │   └── ProtectedRoute.jsx# Authentication gate
│   ├── App.jsx               # Root component with routes
│   ├── App.css               # Dead CSS (Vite template remnants)
│   ├── index.css             # Tailwind directives only
│   ├── main.jsx              # Entry point (StrictMode + BrowserRouter)
│   └── firebase.js           # Firebase initialization & exports
├── .env                      # Environment variables (API URLs)
├── .gitignore                # Git ignore rules (node_modules, dist)
├── .nvmrc                     # Node version reference (empty)
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── package-lock.json         # Lock file
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration (barebones)
├── vite.config.js            # Vite configuration (default)
├── eslint.config.js          # ESLint configuration (basic)
├── ref.txt                   # ❌ DRAFT/DUPLICATE FILE containing stale code
└── README.md                 # Vite template README (unmodified)
```

### Structure Assessment
- **No separation of concerns:** Components and pages are mixed in the same flat folder structure.
- **No shared utilities or constants:** API base URLs, role options, and feature list data are scattered.
- **No hooks directory:** All logic is inline within components.
- **No context/provider:** Auth state is managed via `onAuthStateChanged` in every page that needs it.
- **No TypeScript:** Pure JavaScript with no type safety.
- **No test directory:** Zero test coverage.

---

## 4. Existing Features

### Authentication & User Management
- [x] User registration with Firebase (email/password)
- [x] User login with Firebase (email/password)
- [x] Logout functionality
- [x] Auth state persistence via Firebase
- [x] Protected route wrapper (`ProtectedRoute`)
- [x] User data saved to Firestore (`/users/{uid}`) — name, email, role

> ⚠️ **Auth Weaknesses:** No email verification, no password reset, no social login. `ProtectedRoute` shows raw `<h2>Loading...</h2>` during auth check.

### Landing & Marketing
- [x] Home page with hero animation (Framer Motion)
- [x] Features section with 3 highlighted features
- [x] Call-to-action section

### Interview System
- [x] Role selection dropdown (5 options: Frontend, Backend, Full Stack, DSA, HR)
- [x] AI-powered interview generation via backend API
- [x] Real-time chat interface with AI
- [x] Web Speech API for voice input (speech-to-text)
- [x] Text-to-speech for AI responses (speech synthesis)
- [x] Web camera integration for video during interview
- [x] Text input for typing responses
- [x] Auto-scroll to latest message
- [x] Markdown rendering for AI responses

### Payment & Billing
- [x] Three-tier pricing page (Free, Pro ₹199, Advanced ₹499)
- [x] Stripe checkout integration
- [x] Success page after payment

### General UI
- [x] Responsive navigation bar (desktop & mobile hamburger)
- [x] Dark theme UI throughout the application

---

## 5. Missing Features (Substantial Gaps)

### Authentication & Accounts
- [ ] Email verification flow
- [ ] Password reset / "Forgot Password"
- [ ] Social login (Google, GitHub, LinkedIn)
- [ ] Profile management page (edit name, password, avatar)
- [ ] Account deletion
- [ ] Multi-factor authentication (2FA)

### Interview Features
- [ ] Interview session saving/history
- [ ] Persistent chat history per user
- [ ] Categorized question bank (DSA, System Design, HR)
- [ ] Difficulty level selection
- [ ] Time-limited interviews (timed rounds)
- [ ] Code editor integration for coding interviews
- [ ] Video recording of interview (not just live feed)
- [ ] Detailed AI feedback display (currently sent to backend but not shown)
- [ ] Score tracking and rating system
- [ ] Interview transcript export

### Dashboard & Analytics
- [ ] Interview history with transcripts
- [ ] Performance analytics (strengths, weaknesses, trends)
- [ ] Progress tracking over time (graphs/charts)
- [ ] Skill assessment reports
- [ ] Comparison with other users (leaderboard)
- [ ] Personalized improvement roadmap

### Subscription & Billing
- [ ] Current plan display in dashboard
- [ ] Usage tracking (attempts counter for free tier)
- [ ] Subscription management (change, upgrade, cancel)
- [ ] Billing history & invoices
- [ ] Webhook handling for subscription lifecycle (Stripe)
- [ ] Trial period management

### Admin & Management
- [ ] Admin dashboard
- [ ] User management
- [ ] Analytics dashboard (total users, active interviews, revenue)
- [ ] Question bank management
- [ ] Content moderation

### Platform & Infrastructure
- [ ] TypeScript implementation
- [ ] Unit tests & integration tests
- [ ] Error boundary handling
- [ ] Loading states & skeletons
- [ ] 404 / Not Found page
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Progressive Web App (PWA) capability
- [ ] API rate limiting on frontend
- [ ] Real-time features (WebSockets for live interviews)
- [ ] Multi-language support (i18n)

---

## 6. Code Quality Assessment

### Overall Grade: **C+ (Average — Functional but needs significant cleanup)**

### Strengths
1. **Functional Foundation:** The core interview loop (AI question → user answer → AI feedback) works end-to-end.
2. **Modern Tooling:** Uses Vite (fast build), React 19, Tailwind CSS, and Framer Motion.
3. **Firebase Integration:** Auth and Firestore are correctly wired up.
4. **Frontend-Backend Communication:** API layer is centralised in `src/api/`.

### Weaknesses
| # | Issue | Severity |
|---|-------|----------|
| 1 | **Inconsistent styling paradigm:** Login/Signup use inline styles; other pages use Tailwind | High |
| 2 | **No auth token passed to backend API:** Backend calls have zero authentication | Critical |
| 3 | **Hardcoded userId in Stripe checkout:** `userId: "test_user"` in production code | High |
| 4 | **No error handling for API calls:** `console.error(err)` is the only error response | High |
| 5 | **No loading skeletons:** Raw `<h2>Loading...</h2>` text shown to users | Medium |
| 6 | **Dead code present:** `App.css`, `ref.txt`, template assets | Medium |
| 7 | **No code splitting:** All pages bundled together regardless of user visiting them | Medium |
| 8 | **Memory leaks in camera stream:** Cleanup logic may not always fire on `InterviewPage` | High |
| 9 | **No TypeScript:** No type safety across the application | Medium |
| 10 | **Magic strings for routes:** Navigation strings hardcoded in components | Low |

### Code Reuse & DRY Principle
- **Violated:** Inline style objects are duplicated between `Login.jsx` and `Signup.jsx` with ~60-80% identical properties.
- **Violated:** Firebase auth subscription logic is duplicated across `Dashboard.jsx`, `ProtectedRoute.jsx`, and `Navbar.jsx` — should be a custom hook.
- **Violated:** The gradient color scheme (`from-red-500 to-violet-600`) is hardcoded in every file where it appears.
