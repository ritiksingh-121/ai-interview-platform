# Technical Debt Analysis

> **Repository:** AI Interview Platform Frontend
> **Date:** 2026-06-06
> **Total Code:** ~1,696 lines in `src/`

---

## 1. Code Smells (Immediate Concerns)

### 1.1 Inline Style Dichotomy
**File:** `Signup.jsx`, `Login.jsx`
**Description:** Two entire pages use `style={{ ... }}` objects for all styling instead of using Tailwind utility classes like the rest of the application.

```javascript
// ❌ Anti-pattern: Inline styles (Signup.jsx, Login.jsx)
const container = {
  minHeight: "100vh",
  display: "flex",
  flexWrap: "wrap",
  fontFamily: "sans-serif"
};
```
**Impact:**
- Cannot leverage Tailwind's responsive design system
- Duplicated style objects between Login and Signup (~80% identical)
- No hover/focus/active state classes working
- Cannot be purged by Tailwind, increasing bundle size

**Refactor Strategy:** Extract to shared Tailwind component or create a `SplitScreenLayout` reusable layout component.

### 1.2 Duplicate Firebase Configuration
**File:** `ref.txt`, `src/firebase.js`
**Description:** `ref.txt` contains a full, different Firebase configuration (different project, different API keys) alongside another copy in comment form. The actual `firebase.js` uses a third, different set of credentials.

```
ref.txt contains:
  - Firebase project: interview-673ee (API key: AIzaSyCDu2kKjL-fRXkKJSZsz8VcC-0xEY4hKwA)
  - Firebase project: project-c79e5 (API key: AIzaSyAP3sHYmTzmVLVddDjKNb1iU___BgyrV4A)
firebase.js uses:
  - Firebase project: project-c79e5 (API key: AIzaSyAP3sHYmTzmVLVddDjKNb1iU___BgyrV4A)
```
**Impact:** Dead configuration is confusing, `ref.txt` should not exist in production code.

### 1.3 Hardcoded `userId` in Stripe Checkout
**File:** `src/api/stripe.js:16`
```javascript
body: JSON.stringify({ plan, userId: "test_user" }) // ❌
```
**Impact:** Every Stripe transaction is tied to the literal string `"test_user"` — rendering subscription management, plan enforcement, and receipt association impossible.

### 1.4 Unprotected Interview Route
**File:** `App.jsx:26`
```jsx
<Route path="/interview" element={<InterviewPage/>}/> // ❌ No ProtectedRoute wrapper
```
**Impact:** Unauthenticated users can access the full interview page without logging in or subscribing.

### 1.5 Firebase API Key Exposed in Source Code
**File:** `src/firebase.js`
**Description:** Firebase API key is committed directly in the source code. While Firebase keys are meant for client-side use, including them without environment variables makes rotation difficult and exposes the project ID.

### 1.6 No Auth Token Sent to Backend
**File:** `src/api/api.js`, `src/api/stripe.js`
**Description:** All API requests use `Content-Type: application/json` with no authentication headers. The backend has no way to identify which user is making the request beyond the hardcoded `userId`.

```javascript
// ❌ Missing: headers: { "Authorization": `Bearer ${token}` }
fetch(`${BASE_URL}/interview`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

### 1.7 Magic Strings for Routes
**Files:** `Navbar.jsx`, `Signup.jsx`, `Login.jsx`, `Success.jsx`
**Description:** Route strings like `"/service"`, `"/login"`, `"/signup"` are hardcoded inline. A single route change requires updates in 4+ files.

### 1.8 Raw `<h2>Loading...</h2>` as Placeholder
**Files:** `ProtectedRoute.jsx`, `Dashboard.jsx`
**Description:** Loading states use raw, unstyled `h2` and `div` elements with no branding, spinner, or skeleton UI.

### 1.9 `console.error` Instead of Error UI
**Files:** `InterviewPage.jsx`
**Description:** Error handling pattern is `console.error(err)` in try-catch blocks. Users see no feedback when the AI fails or the API is down.

### 1.10 `getFeedback` Result Discarded
**File:** `InterviewPage.jsx:143-148`
```javascript
try {
  await getFeedback({ question: lastQuestion, answer: text });
} catch {}
```
The API response is awaited but never stored or displayed. The `then` block is empty.

---

## 2. Refactoring Opportunities

### 2.1 Extract Authentication Logic into Custom Hook
**Current State (duplicated in 3+ files):**
```javascript
// In Dashboard.jsx, ProtectedRoute.jsx, Navbar.jsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); });
  return () => unsubscribe();
}, []);
```
**Target:** A reusable `useAuth()` hook:
```javascript
function useAuth() {
  const [user, loading, error] = useAuthState(auth); // or custom implementation
  return { user, isAuthenticated: !!user, loading, error };
}
```

### 2.2 Create a Sane API Service Layer
**Current State:** Raw `fetch` in every function, no centralised error handling, no retry logic.
**Target:** An `apiClient` wrapper:
```javascript
const apiClient = {
  async post(endpoint, data, options = {}) {
    const token = await getAuthToken();
    return fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    }).then(handleResponse);
  }
}
```

### 2.3 Centralise Design Tokens & Constants
| Constant | Location(s) | Solution |
|----------|-------------|----------|
| `from-red-500 to-violet-600` | 7+ files | `const GRADIENT_PRIMARY = "from-red-500 to-violet-600"` |
| `bg-gradient-to-r from-red-500 to-violet-600` | 5+ files | `className={cn("bg-gradient-to-r", GRADIENT_PRIMARY)}` |
| `bg-black text-white` | Every page | Put on a layout wrapper or use Tailwind `dark` mode |
| Role options | `InterviewPage.jsx`, backend | Export from `constants/roles.js` |
| API URL | `api.js`, `stripe.js` | `.env` + centralised config |

### 2.4 Move All Business Logic Out of Components
**Current:** `InterviewPage.jsx` handles speech recognition, camera, audio synthesis, and API calls — all in one 245-line file.
**Target:** Separate into:
- `hooks/useInterview` — interview state machine
- `hooks/useSpeech` — speech recognition/synthesis
- `hooks/useCamera` — getUserMedia management
- `services/interviewService.js` — API calls

### 2.5 Extract Reusable Components

#### `Button` Component
**Current:** Buttons are different every time:
```jsx
// Page 1:
<button className="bg-gradient-to-r from-red-500 to-violet-600...">

// Page 2:
<button className="bg-purple-600 rounded-xl...">

// Page 3:
<button style={{ background: "#4f46e5", ... }}>
```
**Target:**
```jsx
<Button variant="primary" size="lg" isLoading={loading} onClick={onClick}>
  Submit
</Button>
```

#### `GradientText` Component
Repeated 4+ times for headings with gradient text.

#### `Card` Component
Feature cards on Home and Dashboard are nearly identical structurally.

#### `PageShell` / `Layout` Component
Every page wraps itself in `min-h-screen bg-black text-white`. Extract to a shared layout.

---

## 3. Architecture Improvements

### 3.1 Missing Directory Structure
```
src/
  components/      → UI atoms (Button, Input, Card, GradientText)
  features/        → Domain-specific composite components
    interview/
    auth/
    subscription/
  hooks/           → Custom React hooks (useAuth, useInterview, useSpeech)
  services/        → API client, Firebase helpers, Stripe helpers
  pages/           → Route-level components (keep current)
  utils/           → Helpers, formatters, validators
  constants/       → Static data, route map, app config
  context/         → React Context for global state (Auth, Theme)
  types/           → TypeScript type definitions (when adding TS)
```

### 3.2 State Management
**Current state:** Everything is in component local state (`useState`). No state is shared or persisted beyond individual page lifetimes.
**Problems:**
- Refreshing the page during an interview loses all progress
- Dashboard can't show real data without re-fetching
- No global loading state

**Recommendation:**
1. Keep `useState` and `useReducer` for local component state
2. Use React Context for auth state (avoids prop drilling `user`)
3. Consider Zustand or Redux Toolkit for interview session state (complex, cross-component)
4. Use localStorage for interview draft (in case of accidental refresh)

### 3.3 Error Boundaries
**Current state:** No error boundaries exist. Any JavaScript error in any component crashes the entire page tree.
**Recommendation:**
```jsx
// Wrap routes with an ErrorBoundary
<ErrorBoundary fallback={<ErrorPage />}>
  <Routes>{...}</Routes>
</ErrorBoundary>
```

### 3.4 Add TypeScript
**Current state:** Pure JavaScript with JSDoc types only (`/** @type */`)
**Recommendation:** Gradually introduce TypeScript:
1. Rename `.jsx` to `.tsx` (can mix .js and .ts in Vite)
2. Define types for API responses (e.g., `InterviewResponse`, `UserProfile`)
3. Add `tsconfig.json` with `strict: true`
4. Type custom hooks (`useAuth(): { user: User | null, ... }`)

### 3.5 Data Validation
**Current state:** Minimal validation on the frontend, none on the backend.
```javascript
// Signup.jsx — basic string checks
if (!form.email.includes("@")) { setError("Enter a valid email"); }
if (form.password.length < 6) { ... }
```
**Recommendation:** Use a validation library like **Zod** or **Yup**:
```javascript
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

---

## 4. Dead Code Inventory

| File/Line | Description | Action |
|-----------|-------------|--------|
| `src/App.css` | Vite template CSS (counter, hero, next-steps) | ❌ Delete |
| `ref.txt` | Stale Firebase config (duplicate of `firebase.js`) | ❌ Delete |
| `src/assets/react.svg` | React logo (unused) | ❌ Delete |
| `src/assets/vite.svg` | Vite logo (unused) | ❌ Delete |
| `src/assets/hero.png` | Hero image (imported but not rendered) | ❌ Delete or use |
| `public/icons.svg` | SVG sprite from Vite template | ❌ Delete if unused |
| `InterviewPage.jsx:141-148` | `getFeedback` API call with empty handling | ⚠️ Fix or remove |
| `Signup.jsx` & `Login.jsx` (duped styles) | Identical style objects | 🔁 Extract |
| `Home.jsx:28-29` | Features animation `animate={{ opacity: [0, 0, 0] }}` | ⚠️ Remove `repeat: Infinity` (causes pulsing loop) |

---

## 5. Testing Debt

**Current test coverage: 0%**

| Test Type | Files Affected | Priority |
|-----------|---------------|----------|
| Unit tests | All components | High (start with `api.js`, `stripe.js`) |
| Integration | Interview flow | High |
| E2E (Playwright) | Critical user paths | High |
| Accessibility | All pages | Medium |
| Visual regression | UI components | Low |

**Test Framework Recommendation: Vitest + React Testing Library + Playwright**
- Vitest: Native Vite test runner (faster than Jest)
- React Testing Library: Best practice for React component testing
- Playwright: End-to-end testing for full user flows

