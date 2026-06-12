# Database Review

> **Date:** 2026-06-06
> **Scope:** Frontend-relevant database concerns (Firebase/Firestore only)
> **Note:** The backend database layer (PostgreSQL/Prisma/Mongo) is NOT in this repository and could not be audited. This document covers the backend-scoped concerns that should be relayed to the backend team.

---

## Important Context

This repository contains **only the frontend code**. The backend API is deployed at `https://interview-prepp-1.onrender.com` and is not in this codebase. Therefore, this review covers:

1. **What we can infer** from the frontend about the backend data model
2. **What the frontend writes** to Firestore (Firebase)
3. **Recommendations** for a robust database layer (based on standard patterns)

---

## 1. Current Firestore Data Model (Frontend Side)

### 1.1 User Collection (`users/{uid}`)
Based on `Signup.jsx` and `Dashboard.jsx`, the Firestore `users` collection stores:

```javascript
// Set at sign-up (Signup.jsx:55-59)
await setDoc(doc(db, "users", user.uid), {
  name: form.name,      // string
  email: form.email,    // string
  role: "user"          // string (hardcoded)
});

// Read at (Dashboard.jsx:15-17)
const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);
if (snap.exists()) setUserData(snap.data());
```

#### Assessment
| Attribute | Status | Issue |
|-----------|--------|-------|
| `name` | ✅ Present | User's display name |
| `email` | ✅ Present | User's email address |
| `role` | ⚠️ Hardcoded | Always `"user"`. Should support `admin`, `moderator` |
| `createdAt` | ❌ Missing | No timestamp of when the user was created |
| `updatedAt` | ❌ Missing | No timestamp of last update |
| `avatar` | ❌ Missing | No profile picture |
| `subscription` | ❌ Missing | No plan tier or billing info |
| `lastLogin` | ❌ Missing | No last login tracking |
| `interviewCount` | ❌ Missing | Quick reference counts |

#### Recommended Schema (Firestore Document)
```javascript
// users/{uid}
{
  uid: "",              // string (redundant but useful for queries)
  name: "",             // string (required)
  email: "",            // string (required, indexed)
  emailVerified: false, // boolean
  avatar: "",           // string (URL or null)
  role: "user",         // enum: ["user", "pro", "premium", "admin"]
  subscription: {
    plan: "free",       // enum: ["free", "pro", "advanced"]
    status: "active",   // enum: ["active", "cancelled", "past_due", "trialing"]
    stripeCustomerId: "",     // string (Stripe customer ID)
    stripeSubscriptionId: "", // string (Stripe subscription ID)
    currentPeriodStart: Timestamp,
    currentPeriodEnd: Timestamp,
    cancelledAt: null,  // Timestamp or null
  },
  stats: {
    totalInterviews: 0,
    totalQuestionsAnswered: 0,
    lastInterviewAt: null,    // Timestamp
    averageScore: 0,         // number 0-100
  },
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en",
  },
  createdAt: Timestamp,       // serverTimestamp()
  updatedAt: Timestamp,       // serverTimestamp()
}
```

### 1.2 Interview Sessions (Currently Not Persisted!)

**Current State:** The `InterviewPage` component holds interview state entirely in React state (`useState`). When the user leaves the page, the entire conversation is lost.

**Recommendation:** Persist every completed interview to Firestore for history and analytics.

```javascript
// interviews/{interviewId}
{
  id: "",245aZb8",      // string (auto-id)
  userId: "",            // string (reference to users/{uid})
  role: "",              // string: "frontend", "backend", "dsa", "hr"
  difficulty: "medium",  // string: "easy", "medium", "hard"
  status: "completed",  // enum: ["in_progress", "completed", "abandoned"]
  
  questions: [
    {
      question: "What is a closure?",
      answer: "A closure is...",
      score: 85,           // number 0-100
      feedback: {          // from getFeedback API
        clarity: 90,
        technical: 80,
        communication: 85
      },
      duration: 120,       // seconds spent on this question
      answeredAt: Timestamp
    }
  ],
  
  summary: {
    totalQuestions: 5,
    score: 82,             // Average score
    maxScore: 100,
    duration: 600,          // Total interview time in seconds
    feedback: "Overall, strong technical knowledge..." // AI summary
  },
  
  startedAt: Timestamp,
  endedAt: Timestamp,
  createdAt: Timestamp
}
```

---

## 2. Backend Database Recommendations (Inferential)

Since the backend code is not in this repo, the following recommendations are speculative but critical for a production system.

### 2.1 If Using Firestore (Backend)

#### Indexes to Create
```
# users collection
Composite: email (ascending)
Composite: role (ascending) + createdAt (descending)

# interviews collection
Composite: userId (ascending) + createdAt (descending)
Composite: userId (ascending) + role (ascending) + createdAt (descending)
Composite: userId (ascending) + score (descending)
```

#### Security Rules (Critical Missing Piece!)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;  // Never allow client delete
    }
    
    // Interviews: users can only see their own
    match /interviews/{interviewId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if false; // Interviews should be immutable once completed
      allow delete: if false;
    }
    
    // Read-only public data (e.g., role definitions, question banks)
    match /config/{doc} {
      allow read: if true;
    }
  }
}
```

### 2.2 If Using PostgreSQL/Prisma (Recommended for Analytics)

For serious analytics, reporting, and relational data, a relational database is strongly recommended over Firestore.

#### Recommended Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  firebaseUid   String    @unique  // Link to Firebase Auth
  email         String    @unique
  name          String
  avatar        String?
  role          UserRole  @default(USER)
  
  subscription  Subscription?
  interviews    Interview[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([firebaseUid])
  @@map("users")
}

enum UserRole {
  USER
  PRO
  ADMIN
}

model Subscription {
  id                String  @id @default(cuid())
  userId            String  @unique
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  plan              Plan   @default(FREE)
  status            SubscriptionStatus @default(ACTIVE)
  stripeCustomerId    String?
  stripeSubscriptionId String?
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  cancelledAt         DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([stripeCustomerId])
  @@map("subscriptions")
}

enum Plan {
  FREE
  PRO
  ADVANCED
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  TRIALING
}

model Interview {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role          InterviewRole
  difficulty    Difficulty @default(MEDIUM)
  status        InterviewStatus @default(IN_PROGRESS)
  
  totalScore    Int?      // 0-100 average
  duration      Int?      // in seconds
  
  questions     Question[]
  
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, createdAt])
  @@index([userId, status])
  @@map("interviews")
}

enum InterviewRole {
  FRONTEND
  BACKEND
  FULLSTACK
  DSA
  HR
  DEVOPS
  SYSTEM_DESIGN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum InterviewStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

model Question {
  id            String    @id @default(cuid())
  interviewId   String
  interview     Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)
  
  questionText  String
  userAnswer    String?
  score         Int?      // 0-100
  
  // Feedback as JSON for flexibility
  feedback      Json?
  duration      Int?      // seconds spent
  
  answeredAt    DateTime?
  createdAt     DateTime  @default(now())

  @@map("questions")
}

// Pre-loaded question bank
model QuestionBank {
  id            String    @id @default(cuid())
  role          InterviewRole
  difficulty    Difficulty
  question      String
  idealAnswer   String?   // Reference answer
  tags          String[]  // Array of tags for filtering
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([role, difficulty])
  @@map("question_bank")
}
```

---

## 3. Query Performance Analysis

### 3.1 Current Frontend Queries

| Query | Location | Performance |
|-------|----------|------------|
| `getDoc(doc(db, "users", user.uid))` | `Dashboard.jsx` | ⚠️ Called on every mount. Should be cached or combined with auth state. |
| `onAuthStateChanged()` | `Navbar.jsx`, `ProtectedRoute.jsx`, `Dashboard.jsx` | 🔴 Subscribed 3+ times across the app, wasteful |

### 3.2 Recommended Query Optimisations

#### Caching User Data
```javascript
// Use a custom hook that memoizes the user fetch
function useUserData(uid) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    // Fetch once and cache in React context or SWR
    // Returning old data while stale
  }, [uid]);
  
  return data;
}
```

#### Pagination for Interview History
```javascript
// Firestore pagination
const interviewQuery = query(
  collection(db, "interviews"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc"),
  limit(10)
);
// With infinite scroll or "load more" button
```

---

## 4. Scalability Concerns

### 4.1 Firestore Free Tier Limitations
| Metric | Free Tier (Spark) | Consideration |
|--------|-------------------|---------------|
| Reads | 50K/day | Interview history queries could exhaust this quickly |
| Writes | 20K/day | Every message saved as a document would consume writes |
| Stored data | 1 GB | Unlimited session history will eventually exceed this |
| Document reads | 50K/day | No server-side aggregation function |

### 4.2 Backend Scale Considerations

**Recommendations:**
1. **Use a backend ORM (Prisma + PostgreSQL)** for the primary data store, not Firestore, for:
   - Aggregations (SUM, AVG, COUNT)
   - Complex queries with JOINs
   - Analytics dashboards
   - Subscription/payment data

2. **Use Firestore only for:**
   - Real-time data that needs WebSocket-style updates
   - Presence indicators
   - Singleton user preferences

3. **Denormalise for reads** — keep a `stats` sub-document in user profile for fast dashboard queries

4. **Use Redis for:**
   - Caching frequently accessed data (session counts, popular questions)
   - Rate limiting (prevent API abuse)
   - Feature flags
