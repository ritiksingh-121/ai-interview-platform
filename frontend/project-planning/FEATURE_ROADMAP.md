# Feature Roadmap

> **Version:** 1.0
> **Date:** 2026-06-06
> **Goal:** Transform the current MVP into a production-ready AI Interview Platform

---

## Legend
-  **Complexity:** Low (1-2 days) | Medium (3-5 days) | High (1-2 weeks) | Critical (2-4 weeks)
-  **Risk:** 🟢 Low | 🟡 Medium | 🔴 High
-  **Impact:** ⭐ Low | ⭐⭐ Medium | ⭐⭐⭐ High

---

## 🚨 Critical (Must Have for Production Launch)

These features are blockers for any public release. They address security, basic functionality, and legal compliance.

### 1. Secure Authentication & Authorisation
| Attribute | Detail |
|-----------|--------|
| **Priority** | 🔴 **#1 Blocker** |
| **Description** | Implement proper auth token flow. Pass Firebase ID tokens to the backend. Fix `ProtectedRoute` for `/interview`. Add email verification, password reset. |
| **Complexity** | Medium |
| **Risk** | 🔴 High (security) |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | None |
| **Estimated Effort** | 4 days |
| **Deliverables** | — Fetch Firebase ID token from frontend and attach to all API calls via `Authorization: Bearer` header<br>— Verify token on backend<br>— Update `ProtectedRoute` to handle `/interview`<br>— Add "Forgot Password" page<br>— Add email verification flow |
| **Owner** | Backend + Frontend |

### 2. User Profile & Account Management
| Attribute | Detail |
|-----------|--------|
| **Priority** | 🔴 **#2 Blocker** |
| **Description** | Users need to manage their account. GDPR/data protection requires ability to delete account. |
| **Complexity** | Medium |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #1 (secure auth) |
| **Estimated Effort** | 3 days |
| **Deliverables** | — Profile page (edit name, email)<br>— Password change<br>— Profile avatar upload (Firebase Storage)<br>— Account deletion with data purge

### 3. Interview History & Persistence
| Attribute | Detail |
|-----------|--------|
| **Priority** | 🔴 **#3 Core Value** |
| **Description** | Save completed interview sessions to Firestore. Display history on dashboard. |
| **Complexity** | Medium |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #1 (secure auth — need auth to associate data) |
| **Estimated Effort** | 5 days |
| **Deliverables** | — Save interview session (QA pairs, score, role, date, duration) to Firestore<br>— Dashboard history list with search/filter<br>— Interview detail view (read-only transcript)<br>— Delete individual sessions |

### 4. Proper Stripe Integration & Subscription Management
| Attribute | Detail |
|-----------|--------|
| **Priority** | 🔴 **#4 Revenue** |
| **Description** | Replace the broken Stripe flow. Implement proper checkout with customer association, webhook handling, and plan enforcement. |
| **Complexity** | High |
| **Risk** | 🔴 High (revenue & legal) |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #1 (secure auth) |
| **Estimated Effort** | 6 days |
| **Deliverables** | — Pass real user ID to Stripe checkout<br>— Stripe webhook to handle subscription lifecycle (create, cancel, renew)<br>— Plan enforcement on frontend (check subscription status before allowing interview)<br>— Subscription management page (cancel, change plan)<br>— Billing history |

### 5. Error Boundaries & Error Handling
| Attribute | Detail |
|-----------|--------|
| **Priority** | 🔴 **#5 Stability** |
| **Description** | Implement proper error handling so the app doesn't crash or show blank screens. |
| **Complexity** | Low |
| **Risk** | 🟢 Low |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | None |
| **Estimated Effort** | 2 days |
| **Deliverables** | — React ErrorBoundary component wrapping all routes<br>— API error handling wrapper with retry logic<br>— Toast/snackbar notification system for errors<br>— 404 Not Found page<br>— Loading skeletons instead of "Loading..." placeholder |

---

## 🔶 High Priority (Essential for Viable Product)

These features significantly improve user experience, retention, and the perceived value of the product.

### 6. Dashboard Analytics & Progress Tracking
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#6** |
| **Description** | Replace "Coming soon" on the dashboard with actual performance analytics. |
| **Complexity** | Medium |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #3 (interview history) |
| **Estimated Effort** | 5 days |
| **Deliverables** | — Interview count & frequency chart<br>— Score trends over time (line/area chart)<br>— Category breakdown (pie chart of roles practised)<br>— Average session duration<br>— Skill heatmap |

### 7. Enhanced Interview Engine
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#7** |
| **Description** | Make interviews feel more professional and structured. Currently it's just a chat. |
| **Complexity** | High |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #3 (history) |
| **Estimated Effort** | 8 days |
| **Deliverables** | — Difficulty selection before interview start<br>— Pre-defined question bank per role with variation<br>— Interview timer / countdown<br>— End interview button with summary (score, time, questions answered)<br>— Option to redo the same interview set<br>— Coding editor mode (for coding roles) — Monaco/CodeMirror |

### 8. Social Authentication (OAuth)
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#8** |
| **Description** | Reduce friction for new users. Many won't want to create a password. |
| **Complexity** | Low |
| **Risk** | 🟢 Low |
| **Impact** | ⭐⭐ |
| **Dependencies** | #1 (secure auth base) |
| **Estimated Effort** | 2 days |
| **Deliverables** | — Google OAuth login<br>— GitHub OAuth login (very relevant for dev interviews) |

### 9. Comprehensive Interview Feedback
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#9** |
| **Description** | The `getFeedback` API is called but the result is never shown to the user. Make feedback useful, actionable, and insightful. |
| **Complexity** | Medium |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐⭐ |
| **Dependencies** | #3 (history — feedback should be saved with the session) |
| **Estimated Effort** | 4 days |
| **Deliverables** | — Display structured feedback (clarity, technical accuracy, communication, code quality)<br>— Score breakdown per question<br>— Suggested improvements (bullet points)<br>— Comparison against "ideal" answer snippet<br>— Overall interview score |

### 10. Interview Settings & Customisation
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#10** |
| **Description** | Allow users to configure their interview experience. |
| **Complexity** | Low |
| **Risk** | 🟢 Low |
| **Impact** | ⭐⭐ |
| **Dependencies** | None |
| **Estimated Effort** | 2 days |
| **Deliverables** | — Toggle speech-to-text on/off<br>— Toggle text-to-speech on/off<br>— Toggle camera on/off<br>— Select language for interview (if multi-lingual supported)<br>— Font size preference |

---

## 🔵 Medium Priority (Important for Product-Market Fit)

### 11. Leaderboard & Community Features
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#11** |
| **Description** | Gamification to increase engagement. |
| **Complexity** | Medium |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐ |
| **Dependencies** | #6 (analytics data) |
| **Estimated Effort** | 4 days |
| **Deliverables** | — Global leaderboard by score/streak<br>— Weekly/Monthly challenges |

### 12. Interview Transcript Export
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#12** |
| **Description** | Allow users to export their interview for offline review or sharing with a mentor. |
| **Complexity** | Low |
| **Risk** | 🟢 Low |
| **Impact** | ⭐⭐ |
| **Dependencies** | #3 (history) |
| **Estimated Effort** | 2 days |
| **Deliverables** | — Export as PDF<br>— Export as plain text/markdown<br>— Shareable link (if public) |

### 13. Multi-language Support (i18n)
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#13** |
| **Description** | Support for Indian languages (Hindi, Tamil, etc.) expands market reach significantly. |
| **Complexity** | High |
| **Risk** | 🟡 Medium |
| **Impact** | ⭐⭐ |
| **Dependencies** | None |
| **Estimated Effort** | 7 days |
| **Deliverables** | — React-i18next integration<br>— Hindi, English, Hinglish translations<br>— Language switcher |

### 14. Admin Dashboard
| Attribute | Detail |
|-----------|--------|
| **Priority** | **#14** |
| **Description** | For managing users, content, and viewing platform analytics. |
| **Complexity** | Medium |
| **Risk** | 🟢 Low |
| **Impact** | ⭐⭐ |
| **Dependencies** | #1 (secure auth with admin role) |
| **Estimated Effort** | 5 days |
| **Deliverables** | — User list with search<br>— Total interviews count<br>— Revenue dashboard<br>— Content management for questions |

---

## 🟢 Nice to Have (Differentiators)

### 15. AI-Powered Resume Review
| Attribute | Detail |
|-----------|--------|
| **Complexity** | High |
| **Impact** | ⭐⭐ |
| **Description** | Upload resume, get AI feedback on formatting, content, and ATS score. |

### 16. Mock Company Interviews
| Attribute | Detail |
|-----------|--------|
| **Complexity** | High |
| **Impact** | ⭐⭐⭐ |
| **Description** | Pre-built interview sets for FAANG, startups, etc. with known question patterns. |

### 17. Real-time Group Interviews
| Attribute | Detail |
|-----------|--------|
| **Complexity** | Critical |
| **Impact** | ⭐⭐ |
| **Description** | Multiple users in a single interview session (peer practice). |

### 18. AI Coach / Mentor
| Attribute | Detail |
|-----------|--------|
| **Complexity** | High |
| **Impact** | ⭐⭐⭐ |
| **Description** | Weekly check-ins, personalised study plans, and career advice based on practice patterns. |

---

## Recommended Build Order (Phase-Based Roadmap)

### Phase 1: Foundation (Week 1-2)
> **Goal:** Secure, stable, functional platform
1. #1 — Secure Authentication & Authorisation
2. #5 — Error Boundaries & Error Handling
3. #2 — User Profile & Account Management

### Phase 2: Core Value (Week 3-5)
> **Goal:** Users can interview and see their progress
4. #3 — Interview History & Persistence
5. #9 — Comprehensive Interview Feedback
6. #7 — Enhanced Interview Engine (except code editor)
7. #10 — Interview Settings & Customisation

### Phase 3: Monetisation (Week 6-7)
> **Goal:** Revenue starts flowing, plans enforced
8. #4 — Proper Stripe Integration & Subscription Management
9. #8 — Social Authentication (OAuth)

### Phase 4: Growth (Week 8-10)
> **Goal:** Users love the platform, it drives organic growth
10. #6 — Dashboard Analytics & Progress Tracking
11. #12 — Interview Transcript Export
12. #11 — Leaderboard & Community Features
13. #14 — Admin Dashboard

### Phase 5: Scale (Week 11+)
14. #13 — Multi-language Support
15. #15 — AI-Powered Resume Review
16. #16 — Mock Company Interviews
17. App Store / Play Store deployment
