# SignLingo — Design Document

## 1) Project Description

**SignLingo** is a web application that helps learners practice American Sign Language (ASL) through **curated lessons**, **live webcam practice**, and **timed, level-based quizzes**. Users earn **XP**, unlock levels, keep **streaks**, and compete on a **leaderboard**. The app emphasizes an accessible, game-like experience that works on laptops and phones, using a Node/Express API and MongoDB with a Vite + React frontend.

- **Why it matters:** Practical ASL practice tools are scarce and often static. SignLingo blends short, visual lessons with immediate feedback and lightweight gamification.
- **Constraints (course):** Official `mongodb` driver, **no Axios, no Mongoose, no CORS**, React with **PropTypes** per component, clean ESLint/Prettier.

---

## 2) User Personas

### Persona A — Nia (Learner, 20)

- College student learning ASL basics for a campus club.
- Needs quick, visual lessons and short **quizzes** she can do between classes.
- Motivated by **streaks**, **XP**, and a **leaderboard** with friends.

### Persona B — Ravi (Parent, 35)

- Wants to learn everyday **gestures** and **letters** to communicate with a deaf relative.
- Prefers **guided progress** (what’s next?) and **clear instructions**.
- Needs simple, forgiving UI and offline-friendly hints.

### Persona C — Maya (Instructor, 41)

- Teaches intro ASL; recommends tools for extra practice.
- Wants a tool where students can **practice letters/gestures**, **self-assess**, and see a **summary of progress** (XP/levels).

---

## 3) User Stories

- **As Nia**, I want to browse lessons and see how many **signs** each contains so I can pick the right time commitment.
- **As Nia**, when I complete a sign, I want to **mark it done** and earn **XP** instantly.
- **As Nia**, I want **quizzes** with a simple timer, immediate correctness feedback, and stars at the end.
- **As Ravi**, I want to **search signs** (e.g., “Hello”, “A”, “Thank you”) quickly and open a simple visual modal.
- **As Ravi**, I want **live practice** that uses my webcam, with a clear predicted **label** and **confidence**.
- **As Maya**, I want learners to keep **streaks**, see **levels**, and a **leaderboard** so the class stays motivated.
- **As any user**, I want to **edit my profile**, **see XP progress**, and **delete my account** if needed.

---

## 4) Information Architecture & Data Model

### Collections (MongoDB)

1. **users**

```json
{
  "_id": ObjectId,
  "name": "Nandana",
  "age": 22,
  "email": "user@example.com",
  "phone": "123...",
  "passwordHash": "...bcrypt...",
  "stats": { "xp": 0, "level": 1, "hearts": 10 },
  "createdAt": ISODate, "updatedAt": ISODate
}
```

- **Indexes:** `{ email: 1 }` unique.

2. **signs** (atomic sign reference data)

```json
{
  "_id": ObjectId,
  "label": "A",
  "display": "Letter A",
  "category": "Alphabet",
  "desc": "Fist with thumb alongside index...",
  "tags": ["letter","alphabet"],
  "media": { "imageUrl": "https://..." }
}
```

- **Indexes:** `{ label: 1 }`, `{ category: 1 }`, optional text index on `label, desc, tags`.

3. **lessons**

```json
{
  "_id": ObjectId,
  "title": "Alphabet — Part 1",
  "category": "Alphabet",
  "estimatedMinutes": 8,
  "signIds": [ObjectId, ObjectId, ...],      // canonical references
  // server may denormalize to return `signs: [{_id, display, media, ...}]`
  "createdAt": ISODate, "updatedAt": ISODate
}
```

- **Indexes:** `{ category: 1 }`.

4. **userLessons** (per-user progress & XP per lesson)

```json
{
  "_id": ObjectId,
  "userId": ObjectId,       // ref users
  "lessonId": ObjectId,     // ref lessons
  "completed": false,
  "completedSigns": [ObjectId],  // sign _ids from the lesson
  "xpEarned": 30,
  "createdAt": ISODate, "updatedAt": ISODate
}
```

- **Indexes (critical):** `{ userId: 1, lessonId: 1 }` **unique**, `{ userId: 1 }` (leaderboard agg), `{ lessonId: 1 }`.

5. **quizSessions** (ephemeral runs) & **quizStats** (summary)

```json
// quizSessions (per play)
{
  "_id": ObjectId,
  "userId": ObjectId,
  "level": 2,
  "questions": [{ "promptMediaUrl": "...", "choices": ["A","B","C","D"], "answerIdx": 1 }],
  "answers": [2, -1, 1],
  "score": 200,
  "createdAt": ISODate
}

// quizStats (per user aggregate)
{
  "_id": ObjectId,
  "userId": ObjectId,
  "levelsUnlocked": 5,
  "starsByLevel": { "1": 3, "2": 2, "3": 3 },
  "totalScore": 1220,
  "updatedAt": ISODate
}
```

- **Indexes:** `quizSessions { userId: 1, createdAt: -1 }`, `quizStats { userId: 1 }` unique.

> **Leaderboard:** derived via aggregation on **userLessons**: group by `userId`, `sum(xpEarned)`, then `$lookup` users for names/emails.

### Relationships

- `users 1..* userLessons` (one doc per lesson per user).
- `lessons *..* signs` via `signIds` (server returns expanded `signs` for convenience).
- `users 1..1 quizStats`, `users 1..* quizSessions`.

---

## 5) Core Flows

### A) Authentication

1. `POST /api/auth/signup` → create user; set `req.session.userId`.
2. `POST /api/auth/login` → verify hash; set session; return user summary.
3. `GET /api/auth/check` → `{ loggedIn, userId }`.
4. `POST /api/auth/logout` → destroy session; clear cookie.

### B) Lessons (Browse → Detail → Practice)

1. **Browse**: `GET /api/lessons` → list with title, category, counts.
2. **Detail**: `GET /api/lessons/:id` → lesson with `signs[] { _id, display, desc, media.imageUrl }`.
3. **Start**: `POST /api/user-lessons/:lessonId/start` → upsert `userLessons`.
4. **Mark sign done**: `POST /api/user-lessons/:lessonId/sign/:signId/done`
   - Server: add signId to `completedSigns` (set union), bump `xpEarned`, `updatedAt`.
5. **Reset lesson**: `POST /api/user-lessons/:lessonId/reset` → clear `completedSigns`, `xpEarned`.

### C) Live Practice (Webcam)

1. Frontend requests camera; draws frames to canvas; converts to JPEG blob.
2. `POST /api/live/detect?mode=letters|gestures` with `FormData(image)` → returns `{ label, confidence }`.
3. UI shows predicted **label** and `%`.

> Privacy note: frames are sent for inference only; **not persisted**.

### D) Quizzes (Select → Play → Finish)

1. **Status**: `GET /api/quiz/status` → `{ unlocked, totalScore, starsByLevel }`.
2. **Start**: `POST /api/quiz/start` with `{ level, count }` → `quizSession`.
3. **Check**: `POST /api/quiz/check` with `{ choiceIdx }` → `{ correct, correctIdx }`.
4. **Finish**: `POST /api/quiz/finish` → updates `quizStats` (score, stars, unlock next).
5. **Reset**: `POST /api/quiz/reset` → clears `quizStats`.

### E) Leaderboard (XP Across Lessons)

- `GET /api/leaderboard/top?limit=10`  
  Aggregates `userLessons` by `userId`, `sum(xpEarned)` → `$lookup` users → sort desc → limit.

### F) Profile Overview

- `GET /api/profile/overview` → `{ user, lessons: [{id,title,progress}], quizStats }`
- `PUT /api/profile` → update `name, age, email`.
- `DELETE /api/profile` → remove account (and session); (cascades TBD).

---

## 6) Wireframes (Text)

**Flashscreen / Landing**

```
[Brand]                 [Login/Signup]
--------------------------------------
Kicker
THE DIFFERENCE, LOVE  THE EXPERIENCE!
[Start learning]  [Feature cards row]
           [Big hero image]
```

**Lessons**

```
[Sidebar]  |  [Your Lessons]
           |  [Lesson Card][Lesson Card][Lesson Card]
           |  -> Click card opens right-side panel with summary + Start
```

**Lesson View**

```
[Title]              [Reset Progress]
[Progress Bar 40%]   4 of 10
[Sign Image]
[Sign Label]
[Description]
[Mark as Done]  [Next →]  [Live Practice]
```

**Quizzes**

```
[← Levels]  [Timer ===]  [Level n]
[Prompt (image/video)]
[ 1 ] Option A
[ 2 ] Option B
[ 3 ] Option C
[ 4 ] Option D
         [Submit]
```

**Leaderboard**

```
[Top 3 Cards]
#1 name   #2 name   #3 name
------------------------------
Rank | User        | Courses | Streak | Points
  4    DesignGuru      8        8        980
  5    ...
```

**Profile**

```
[Avatar] Name  (Edit | Delete)
Age • email
[XP Bar] 1200 / 3000
[Streak] [Level] [Quiz Levels]
Lessons in Progress: [card][card]
Quizzes: [card]
```

---

## 7) Non-Functional Requirements

- **Performance**

  - Use projections; avoid large payloads.
  - Indexes on `userLessons.userId`, `userLessons.lessonId`, `users.email`, `signs.label/category`.
  - Client-side throttling for live detection (one in-flight request).

- **Security**

  - Session cookie `httpOnly`, `secure` in production.
  - Passwords hashed with **bcrypt**.
  - Input validation and safe error messages (no stack traces to client).
  - No secrets in repo; use `.env`.

- **Reliability & UX**

  - Graceful fallbacks (image errors, camera denied).
  - Accessible components (labels, aria, focus states).
  - Robust error banners; optimistic UI only where safe.

- **Maintainability**

  - Each React component in its own file, **PropTypes** defined.
  - CSS Modules per component.
  - ESLint + Prettier clean.

- **Deployability**
  - ENV-driven API base; Vite for frontend.
  - Works with MongoDB Atlas or local dev.

> **Course policy compliance:** No Axios/Mongoose/CORS; official `mongodb` driver; PropTypes for components; formatted with Prettier.

---

## 8) Open Items / Future Work

- **Richer content:** add numbers, common phrases, and contextual practice sets.
- **Achievements:** badges, weekly challenges, social sharing.
- **Instructor mode:** read-only links to class leaderboards and progress summaries.
- **Audio/Video prompts:** short loops for dynamic gestures.
- **SSE/WebSocket:** reduce polling; live quiz races.
- **A11y/i18n:** keyboard-only flows, screen reader labels, localization.
- **Privacy:** optional on-device inference (WebGPU/TFJS) to avoid sending frames.
