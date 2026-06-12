# Performance Optimization Analysis

> **Date:** 2026-06-06
> **Scope:** Frontend performance (Vite + React)
> **Toolset:** Chrome DevTools, Lighthouse, React Developer Tools (simulated analysis)

---

## 1. Meta Note: Not a Next.js App

The file name references "Next.js performance" but this is a **Vite + React SPA**, not a Next.js application. All analysis and recommendations below are adapted for a Vite/React context. The project should be migrated to **Next.js** if the goal is SEO, server-side rendering, and production-grade performance (see Architecture section).

---

## 2. Current Build & Bundle Analysis

### 2.1 Package.json Dependencies Impact
```json
{
  "@stripe/stripe-js": "^9.6.0",       // ~50KB (loads Stripe script, async)
  "firebase": "^12.13.0",              // ~200KB+ (firebase is a large library)
  "framer-motion": "^12.40.0",         // ~50-80KB (animation library)
  "openai": "^6.34.0",                 // ⚠️ **Unused in client code?** API keys from backend
  "react": "^19.2.6",                  // ~40KB
  "react-dom": "^19.2.6",              // ~80KB
  "react-markdown": "^10.1.0",         // ~30KB
  "react-router-dom": "^7.15.1"        // ~25KB
}
```

### 2.2 Identified Issues

#### 🔴 `openai` Package in Client Bundle
**Issue:** The `openai` package is listed in `dependencies` but is likely **only used on the backend**. Including it in the frontend codebase adds unnecessary bundle weight (~100-150KB minified).

**Check:** `grep -r "openai" ./src/` — if nothing matches, **remove it from frontend dependencies**.

**Fix:**
```bash
npm uninstall openai
```

#### 🔴 No Code Splitting / Lazy Loading
**Current State (App.jsx):**
```javascript
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Home from './pages/Home'
// ... all pages imported statically

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      {/* ... all routes loaded together */}
    </Routes>
  )
}
```

**Impact:** On first page load, the browser downloads the entire application — including pages the user may never visit.

**Fix — Implement Lazy Loading:**
```javascript
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';

// Lazy import all page-level components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const Success = lazy(() => import('./pages/Success'));

function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/service" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success" element={<Success />} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  );
}
```

**Expected benefit:** First load JS reduced by ~50-60% (pages not on initial route won't be included in initial bundle).

#### 🟡 No Bundle Size Analysis Tool
**Issue:** There's no way to know the current bundle size or which dependencies are bloating the build.

**Fix:**
```bash
npm install -D vite-bundle-visualizer
```

Add to `vite.config.js`:
```javascript
import { visualizer } from 'vite-bundle-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});
```

---

## 3. API Performance

### 3.1 Current API Usage
```javascript
// src/api/api.js
export const sendInterviewMessage = async (data) => {
  const res = await fetch(`${BASE_URL}/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
```

### 3.2 Issues & Fixes

#### 🔴 No Request Timeout
**Risk:** If the backend is slow or the user has a poor connection, the request may hang indefinitely.

**Fix:**
```javascript
const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};
```

#### 🔴 No Retry Logic
**Risk:** A single failed request provides no fallback. AI interview generation is the core feature — it needs to be resilient.

**Fix:** Implement exponential backoff:
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

#### 🟡 No Response Caching
**Recommendation:** Cache interview questions or role definitions that don't change:
```javascript
// Using localStorage or IndexedDB for question caching
const CACHE_KEY_PREFIX = 'interview_cache_';

export const getCachedOrFetch = async (key, fetcher, ttl = 3600000) => {
  const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(data));
  return data;
};
```

---

## 4. React Specific Performance

### 4.1 Current State of Optimization

#### 🔴 `InterviewPage` Re-renders Excessively
**Problem 1:** `messages` state changes on every new message, causing the entire component to re-render — including the camera setup logic.

```javascript
// InterviewPage.jsx
const [messages, setMessages] = useState([]); // Changing a message triggers full re-render
```

**Fix:** Split the state and memoize:
```javascript
// Use useMemo for the chat messages container
import { memo, useMemo } from 'react';

const MemoizedChatBox = memo(ChatBox);

// Memoize the API call payload
const apiPayload = useMemo(() => ({
  role,
  message: text,
  history: messages
}), [role, text, messages]);
```

#### 🔴 Firestore Subscriptions Not Memoized
```javascript
// Dashboard.jsx + ProtectedRoute.jsx + Navbar.jsx all call:
onAuthStateChanged(auth, (u) => { setUser(u); });
```
All three components create separate auth subscription listeners. While Firebase optimises this internally, it's still wasteful.

**Fix:** Move auth state to React Context or a higher-order component.

### 4.2 React DevTools Performance Analysis (Simulated)

| Component | Renders | Wasted Renders | Issue |
|-----------|---------|---------------|-------|
| `App` | 1 | 0 | ✅ Good |
| `Navbar` | 3+ | 2 | Re-renders on every auth check |
| `InterviewPage` | 20+ | 15+ | Full re-render on every message |
| `ChatBox` | 20+ | 15+ | Should not re-render list keys on new messages |
| `MessageBubble` | 20+ | 10 | Re-renders unnecessarily |

### 4.3 Memoization Strategy

```javascript
// MessageBubble — memoize
const MessageBubble = memo(function MessageBubble({ msg }) {
  // JSX
});

// ChatBox — memoize with useMemo
const ChatBox = memo(function ChatBox({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((msg, i) => (
        <MessageBubble key={msg.id || i} msg={msg} /> // Use stable ID, not index
      ))}
    </div>
  );
});

// InterviewPage — useCallback for event handlers
const sendMessage = useCallback(async (customInput) => {
  // ... logic
}, [messages, role, input]);
```

### 4.4 Debounce User Input
The text input sends on every keystroke (theoretically), but could benefit from debouncing if complex validation is added:

```javascript
import { useDebounce } from 'use-debounce';

const [debouncedInput] = useDebounce(input, 300); // 300ms debounce
```

---

## 5. Image and Asset Optimisation

### 5.1 Current Assets
| Asset | Size | Used? | Action |
|-------|------|-------|--------|
| `hero.png` | unknown | ❌ No | Delete or use |
| `react.svg` | ~5KB | ❌ No | Delete |
| `vite.svg` | ~2KB | ❌ No | Delete |
| `favicon.svg` | unknown | ✅ Yes | ✅ Keep |
| `icons.svg` | unknown | ❌ No | Delete |

### 5.2 Recommendations
1. **Remove unused assets** from the `dist/` output (Vite does this automatically, but keeping them in source is messy)
2. **Use WebP/AVIF** for any production images
3. **Use a CDN** (Cloudinary, Uploadcare) for user avatars

---

## 6. Web APIs & Memory

### 6.1 Camera Stream Leak
**File:** `InterviewPage.jsx`
```javascript
useEffect(() => {
  const startCamera = async () => { /* ... */ };
  startCamera();
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };
}, [isInterviewStarted]);
```

**Potential Issue:** If `startCamera` fails but the cleanup isn't correctly awaited, the media stream may leak.

**Fix:** Ensure cleanup handles promises:
```javascript
useEffect(() => {
  let stream;
  
  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Show user a meaningful error UI
    }
  };
  
  startCamera();
  
  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
}, [isInterviewStarted]);
```

### 6.2 Speech Synthesis Memory Leak
```javascript
const speak = (text) => {
  if (!window.speechSynthesis) return;
  const cleanText = text.replace(/📌|⚡|🚀|\*|\n/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
```

**Issue:** If rapid messages arrive (user double-clicks start), speech synthesis may queue utterances or fail.

**Fix:** Add a flag to prevent overlapping speech:
```javascript
const isSpeakingRef = useRef(false);

const speak = (text) => {
  if (!window.speechSynthesis || isSpeakingRef.current) return;
  isSpeakingRef.current = true;
  
  const cleanText = text.replace(/📌|⚡|🚀|\*|\n/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.onend = () => { isSpeakingRef.current = false; };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
```

---

## 7. Caching Strategy

### 7.1 Browser Caching
Vite automatically generates hashed asset names (`index-BoXATnXW.css`, `index-CJeOsWYl.js`). These are cached by the browser. However, HTML is not.

**Recommendation:** Configure your web server (Render, Vercel, Netlify) with caching headers:
```
/assets/*.js  → Cache-Control: public, max-age=31536000, immutable
/assets/*.css → Cache-Control: public, max-age=31536000, immutable
/index.html   → Cache-Control: no-cache, must-revalidate
```

### 7.2 Service Worker / PWA
**Recommendation:** Use Vite PWA plugin to enable offline support for read-only pages:
```bash
npm install -D vite-plugin-pwa
```
This enables the app to work offline, cache API responses, and look like a native app when installed.

### 7.3 React Query / SWR
For a production app, use a data-fetching library for automatic caching:

```bash
npm install @tanstack/react-query
```

Benefits:
- Automatic caching and deduplication
- Stale-while-revalidate (data shows immediately, refreshes in background)
- Retry logic built-in
- Loading/error state management

---

## 8. Bundle Size Targets

### Current State (Estimated)
| Metric | Estimated Value | Industry Target |
|--------|-----------------|-------------------|
| Total bundle (uncompressed) | ~600-800 KB | < 500 KB |
| Total bundle (gzip) | ~150-200 KB | < 200 KB |
| Largest chunk | ~300 KB (Firebase) | Split into lazy-loaded modules |
| First Contentful Paint | ~2-3s | < 1.5s |
| Time to Interactive | ~4-5s | < 3s |

### Action Items to Hit Targets
1. ✅ Remove `openai` from frontend
2. ✅ Implement lazy loading for all routes
3. ✅ Split Firebase into modular imports (already using `import` syntax, good)
4. ✅ Use `vite-plugin-visualizer` to find heavy dependencies
5. ✅ Implement service worker for aggressive caching
6. ✅ Add SSR for faster initial paint (migrate to Next.js)
