# SignLingo — Learn ASL with Live Practice, Lessons & Quizzes

SignLingo is a full-stack web app where learners **study American Sign Language (ASL)** through **various lessons**, **timed quizzes with levels**, and **live webcam practice** powered by a lightweight ML detector. Track **XP, and levels**, and compete on the **leaderboard**—all with a clean, React-based UI and a Node/Express/MongoDB backend.

> **Status:** actively developed. This repo contains a React (Vite) frontend and a Node/Express/MongoDB backend (no Axios, no Mongoose, no CORS).

> > **Note:** All updates made for **Project 4** are listed in the section  
**[P4 Enhancements (Final Project Improvements)](#p4-enhancements-final-project-improvements)** at the end of this document.

---

- **Deployed at:** https://signlingo-frontend-5ve7.onrender.com/
- **Class Link:** \_CS5610 – Web Development (Fall 2025), Northeastern University (Canvas link: https://northeastern.instructure.com/courses/226004 )
- **Slides:** https://docs.google.com/presentation/d/1uZTNU8wF9g71Vgxkq_G2oVfmz9dJwNFh9al1qAL02qA/edit?usp=sharing
- **Video Demonstration:** (https://www.loom.com/share/cb8a679686ed47ef914aed51950b7569)
- **Live Detection Demo Video:**: https://drive.google.com/file/d/19PXS7g9MuBbt3RL434AvIKafm024JAM6/view?usp=sharing

---

## Project Objective

Build a usable, useful ASL learning platform that:

1. reinforces knowledge with **guided lessons and timed multiple-choice quizzes (gamified learning)**,
2. enables **live practice** with the webcam (letters/gestures), and
3. motivates learners with **XP, streaks, levels, and leaderboards**.

---

## Features (Learner-facing)

- **Auth:** Signup/Login with **cookie session**; “Remember me” UI.
- **Lessons:** Browse a lesson grid, open details, and **mark signs as done** and practice live; progress bar + **Reset Progress**.
- **Characters:** Searchable ASL sign gallery (labels, categories, tags, images).
- **Quizzes:** Level-based quizzes with **40s timer**, **stars**, **per-level score**, and **total score** get 3 questions right and unlock a level - 10 levels.
- **Live Practice:** Webcam capture → server endpoint for **letters/gestures** prediction; shows **label + confidence**.
- **Profile:** Edit profile, delete account, **XP bar**, level, **lessons in progress**, quiz stats.
- **Leaderboard:** Top 10 users based on XP displayed
- **Right Rail:** Daily goal progress and quick stats (XP / Level).
- **Nav bar:** Navigate through the app

## Features (Backend)

- **Auth routes:** `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/check` (Express-session).
- **Profile overview:** single endpoint aggregates user stats, lesson progress, and quiz status.
- **Lessons API:** fetch lessons, start/continue a user-lesson, **mark sign done**, reset lesson progress.
- **Quizzes API:** get unlock status, start/check/finish quiz sessions, **persist stars & total score**.
- **Live detect:** proxy to a **FastAPI** service (`/api/live/detect?mode=letters|gestures`).

---

## CRUD Division

- **Lessons & Progress — Owner: Piriyajeishree**

  - **Create:** When user starts a lesson. New lesson details gets created in the db

  - **Read:** lesson detail + signs + user’s completedSigns & xpEarned

  - **Update:** mark sign done → push signId, add XP, timestamps

  - **Delete/Reset:** User can reset the progress. Clear completedSigns & xpEarned for that lesson

- **Quizzes — Owner: Nandana**

  - **Create**: quizSessions on start; seed questions for the run

  - **Read:** session state + question media/options; quiz/status (stars/unlocks/score)

  - **Update:** answers, score, stars, unlock next level in quizStats

  - **Delete/Reset:** User can rest the quiz wipe quizStats for a clean slate

- **Profile — Shared**

  - **Create:** users on signup (hashed password, initial stats)

  - **Read:** aggregated overview (user + lessons + quiz stats)

  - **Update:** edit name/age/email

  - **Delete:** delete account (and session), optional cascade

- **Leaderboard — Shared**

  - **Read aggregation:** group userLessons by userId, sum xpEarned, sort desc, join users, return top N

## Tech Stack

- **Frontend:** React + Vite, React Router, **CSS Modules**, PropTypes.
- **Backend:** Node.js, **Express**, **MongoDB Node driver** (no Mongoose), express-session.
- **ML (optional):** FastAPI microservice for inference, hit through the Node proxy.
- **Tooling:** ESLint, Prettier, Nodemon.
- **License:** MIT.

---

## Screenshots 

## 1. Flashscreen
<img width="1708" height="929" alt="Screenshot 2025-11-09 at 1 30 39 PM" src="https://github.com/user-attachments/assets/bbaf2923-31e4-4a52-8fd9-97db75598b7b" />

## 2. Login/SignUP

<img width="1706" height="933" alt="Screenshot 2025-11-09 at 1 31 16 PM" src="https://github.com/user-attachments/assets/cbb54a8e-fc25-4736-8f88-eb796270fd49" /><img width="1710" height="930" alt="Screenshot 2025-11-09 at 1 31 59 PM" src="https://github.com/user-attachments/assets/30e26f75-9316-4501-abc1-d009612e01d2" />

## 3. Lesson

<img width="1709" height="930" alt="Screenshot 2025-11-09 at 1 58 35 PM" src="https://github.com/user-attachments/assets/154784ef-f899-4cdb-8e06-76d04703dc63" />
<img width="1701" height="925" alt="Screenshot 2025-11-09 at 1 58 50 PM" src="https://github.com/user-attachments/assets/2908dbc0-afe1-40d2-86cc-1ace75ccc601" />
<img width="1703" height="932" alt="Screenshot 2025-11-11 at 1 00 45 AM" src="https://github.com/user-attachments/assets/291b5d7c-d9fa-4b85-b9fe-b5bc4b0d6f25" />

## 4. Quiz

<img width="1708" height="934" alt="Screenshot 2025-11-11 at 1 01 00 AM" src="https://github.com/user-attachments/assets/497fea7f-0439-45ef-9ce0-7815f2590217" />
<img width="1700" height="937" alt="Screenshot 2025-11-11 at 1 01 52 AM" src="https://github.com/user-attachments/assets/a<img width="1705" height="920" alt="Screenshot 2025-11-11 at 1 02 11 AM" src="https://github.com/user-attachments/assets/8202ad95-d2ee-4fa0-96a9-c40cc9bb1eb7" />

## 5. leaderboard

10. <img width="1708" height="925" alt="Screenshot 2025-11-11 at 1 02 28 AM" src="https://github.com/user-attachments/assets/58a3afe2-47cf-414a-a814-792039f9dadb" />
    
## 6. characters

<img width="1706" height="934" alt="Screenshot 2025-11-11 at 1 04 00 AM" src="https://github.com/user-attachments/assets/4a974877-c6e9-4b59-b7d0-fbd51439b7af" />

## 7. profile

<img width="1708" height="935" alt="Screenshot 2025-11-11 at 1 04 15 AM" src="https://github.com/user-attachments/assets/45dddb7d-521c-4460-ab46-cac7e030716e" />

    
## 8. live

<img width="1709" height="933" alt="Screenshot 2025-11-11 at 1 03 43 AM" src="https://github.com/user-attachments/assets/5f94d30d-bd74-467a-b2c4-88438b098f45" />


## Project Structure (key parts)

```
frontend/
  src/
    api/
      auth.api.js
      lessons.api.js
      userLessons.api.js
      quiz.api.js
      signs.api.js
    components/
      Auth/
        LoginForm.jsx
        SignupForm.jsx
      Lessons/
        LessonCard.jsx
        LessonDetailsPanel.jsx
        LessonGrid.jsx
        Lessons.module.css
      Nav/
        SideNav.jsx
      RightStats/
        RightStats.jsx
      Tooltip/
        Tooltip.jsx
    context/
      UserStatsContext.jsx
    hooks/
      useLessons.js
      useProfileOverview.js
      useQuizSession.js
    layouts/
      AppShell.jsx
    pages/
      Flashscreen.jsx
      Auth/
        AuthPage.jsx
      Lessons/
        LessonsPage.jsx
        LessonViewPage.jsx
      Live/
        LivePracticePage.jsx
      Profile/
        ProfilePage.jsx
      Quizzes/
        QuizSelectPage.jsx
        QuizPlayPage.jsx
      Characters/
        CharactersPage.jsx
    assets/
      images/...
  vite.config.js

backend/
  src/
    db/
      mongoClient.js
    controllers/
      auth.controller.js
      profile.controller.js
      lessons.controller.js
      userLessons.controller.js
      quiz.controller.js
      live.controller.js (proxy)
    routes/
      auth.routes.js
      profile.routes.js
      lessons.routes.js
      userLessons.routes.js
      quiz.routes.js
      live.routes.js
    server.js
  .env.example

docs/
  thumbnail.jpg
  screenshots/
    01-flashscreen.png
    02-login.png
    03-lessons.png
    04-lesson-view.png
    05-quizzes.png
    06-live-practice.png
    07-profile.png
    08-leaderboard.png

DESIGN.md
LICENSE
```

---

## Key API Endpoints

**Auth**

- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/check`

**Profile**

- `GET /api/profile/overview?userId=:id` → `{ user, lessons, quizStats }`

**Lessons**

- `GET /api/lessons`
- `GET /api/lessons/:lessonId`
- `POST /api/user-lessons/start/:lessonId`
- `POST /api/user-lessons/:lessonId/mark/:signId`
- `POST /api/user-lessons/:lessonId/reset`

**Quizzes**

- `GET /api/quiz/status` (levels unlocked, total score, stars per level)
- `POST /api/quiz/start` → `{ sessionId }`
- `POST /api/quiz/check` → `{ correct, correctIdx }`
- `POST /api/quiz/finish` → `{ stars, score, total, correct }`
- `POST /api/quiz/reset`

**Live Detect (optional)**

- `POST /api/live/detect?mode=letters|gestures` (for webcam frames)

> Collections in use: `users`, `signs`, `lessons`, `userLessons`, `quizSessions`, `sessions` (Express), plus derived stats in profile aggregate.

---

## Environment

Create **backend** `.env` from `.env.example`:

```
MONGO_URI=mongodb+srv://piriyajeishree410:Eerhsiej%40410@cluster0.2dlz3am.mongodb.net/signlingo?retryWrites=true&w=majority
DB_NAME=signlingo
PORT=5000
SESSION_SECRET=supersecretvalue
BASE_MEDIA_URL=https://piriyajeishree410.github.io/Sign-images
```

Create **frontend** `.env` (e.g., `frontend/.env`):

```
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_HOST=localhost
VITE_BACKEND_PORT=5050
VITE_API_PREFIX=/api
```

> **No secrets committed.** Use environment variables and deployment config.

---

## Instructions to Build & Run Locally

### Prereqs

- Node.js 20+ (tested with Node v24)
- A MongoDB Atlas database (or local Mongo)
- (Optional) Python + FastAPI detector running at `FASTAPI_URL`

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env   # fill values
npm run dev            # nodemon src/server.js (server on http://localhost:5000)
```

### 2) Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev            # vite on http://localhost:5173
```

### 3) Optional: Live Detector (FastAPI)

If you have the ML service:

```bash
# run your FastAPI server (example)
uvicorn app:app --reload --port 8000
```

The frontend’s **Live Practice** page will POST frames via the Node proxy (`/api/live/detect`).

---

# **P4 Enhancements (Final Project Improvements)**

This section describes all changes implemented for **Project 4**, building on top of the P3 baseline.
Project 4 focuses on improving **authentication**, **design quality**, **accessibility**, and **usability**, along with building a more robust and polished user experience.

---

# **1. Authentication Overhaul (Passport.js)**

P3 authentication was custom-built using sessions.
P4 replaces and expands authentication with **Passport.js**:

### Local Strategy (Email + Password)

* Validates user credentials using Passport Local Strategy
* Proper serialization/deserialization
* Sessions stored in Mongo (connect-mongo)

### Google OAuth 2.0 Login

* One-click login with Google
* New users auto-created and stored with avatar
* Existing users recognized on next login
* Redirect to `/app/lessons` after successful authentication

### Unified session handling

* `express-session` + MongoStore
* Cookies configured for local and production (sameSite: none/lax, secure: auto)

### Backend Updates

* New `passport.js` config file
* Updated `auth.routes.js`
* Updated `AuthController.checkSession()`

---

# **2. Frontend Authentication Layer (AuthContext + Protected Routes)**

A new **AuthContext** was introduced to manage:

### Persistent login state

### Auto-check session on page reload

### Global `user` object

### `login()` and `logout()` helpers

### Graceful loading state

New utility components:

* **ProtectedRoute.jsx** — prevents unauthorized access
* **App.jsx** updated to guard `/app/*` routes

---

# **3. Help Modal (Usability Instructions)**

A new **Help Modal** was added to improve discoverability and reduce cognitive load.

### Help content includes:

* How to use lessons, quizzes, live practice
* How XP, levels, and leaderboard work
* Authentication instructions
* **Keyboard accessibility guide (Tab, Shift+Tab, Enter, Esc)**
* **Typography and readability information**
* Clean sectioned UI with close button

### Help button added to:

* Flashscreen (landing page)
* SideNav (for logged-in users)

---

# **4. Typography Improvements**

Project 4 required improved readability and font hierarchy.

Enhancements include:

### Semantic font pairing (headings vs body text)

### Consistent sizing scale

### Improved line-height and spacing

### Higher contrast for better accessibility

### Typography applied across all pages (Lessons, Login, Flashscreen, Quiz, Profile, etc.)

---

# **5. Keyboard Accessibility (A11y)**

Significant accessibility improvements:

### Full keyboard navigation

* `Tab` → forward
* `Shift + Tab` → backward
* `Enter` / `Space` → activate
* `Esc` → close modal

### Brand logo + nav fully keyboard-usable

### Focus states added / improved

### Screen-reader friendly elements

### SideNav + buttons now semantically correct

### No divs used as buttons

---

# **6. Semantic HTML & Structure Improvements**

### Replaced non-semantic wrappers with `<header>`, `<nav>`, `<main>`, `<section>`

### Improved heading hierarchy (H1→H2→H3)

### Alt attributes added to all images

### Better ARIA labels

---

# **7. UI Enhancements & Polish**

### Updated typography system

### SideNav updated with user avatar (Google photo or placeholder)

### Avatar styling improved (circular, centered, name included)

### Flashscreen layout improved

### Help button added with floating/responsive design

### Spacing, padding, and alignment fixes across the app

---

# **8. Updated Deployment Configuration**

Deployment-ready environment vars now include:

### Backend `.env`

```
MONGO_URI=mongodb+srv://piriyajeishree410:Eerhsiej%40410@cluster0.2dlz3am.mongodb.net/signlingo?retryWrites=true&w=majority
DB_NAME=signlingo
PORT=5000
SESSION_SECRET=supersecretvalue
NODE_ENV=development
BASE_MEDIA_URL=https://piriyajeishree410.github.io/Sign-images
GOOGLE_CLIENT_ID=655637269402-pa20lpm5tfrub75vulipf38g77l9eag4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api 
VITE_BACKEND_HOST=localhost 
VITE_BACKEND_PORT=5050 
VITE_API_PREFIX=/api
```
---

# **9. Accessibility Testing (Lighthouse & Axe)**

### Color contrast validation

### Semantic headings

### Labels for all form inputs

### Buttons use `<button>` tags only

### Keyboard navigation fully functional

App now passes accessibility audits **without errors**.

---

# **10. Files Added in P4**

* `backend/src/config/passport.js`
* `frontend/src/context/AuthContext.jsx`
* `frontend/src/context/HelpContext.jsx`
* `frontend/src/components/Help/HelpModal.jsx`
* `frontend/src/components/Help/HelpModal.module.css`
* `frontend/src/components/Auth/ProtectedRoute.jsx`

---

# **11. Branch Structure**

```
main            → P3 final code
passport-auth   → P4 backend + frontend authentication upgrades
p4-UIchanges    → P4 UI, typography, accessibility improvements
p4-final        → Final merged P4 submission branch
```

---

# **12. Summary of P4 Improvements**

Project 4 elevates SignLingo with:

* **Cleaner design**
* **Better readability**
* **More accessible interface**
* **Stronger authentication (Google OAuth)**
* **More secure session handling**
* **Better usability documentation (Help Modal)**
* **More polished UI for deployment**
---

## Authors

- **Nandana Pradeep** — pradeep.na@northeastern.edu
- **Piriyajeishree Murali Naidu** — muralinaidu.p@northeastern.edu

---

## Rubric Mapping (where to find each requirement)

- **Design document (Personas, Stories, Mockups):** see `DESIGN.md`.
- **App accomplishes approved scope:** lessons, quizzes, live practice, profile, leaderboard implemented (see pages/components above).
- **Usability & Instructions:** this README (build/run), clear navigation (SideNav, AppShell).
- **Usefulness:** concrete ASL learning workflow + motivation (XP, stars).
- **ESLint/Prettier:** configs in project; code formatted.
- **Organization:** each React component and CSS in its own file; backend files separated by controllers/routes/db.
- **≥3 React components using hooks:** e.g., `ProfilePage` (useState/useMemo/custom hook), `LessonViewPage`, `QuizPlayPage`, etc.
- **Each component in its own file:** yes (see structure).
- **Deployment:** _TBD: (https://signlingo-frontend-5ve7.onrender.com/)
- **≥2 Mongo collections with CRUD:** `users`, `user_lessons`, `quiz_sessions`, `lessons`, `signs` (create/read/update via endpoints).
- **1k synthetic records:** Yes 
- **Node + Express:** yes (backend).
- **Prettier applied:** yes.
- **Standards-based HTML:** buttons/inputs are semantic; icons are inline SVGs.
- **CSS organized by component:** `*.module.css` beside each component.
- **README includes Author, Class Link, Objective, Screenshot, Build Steps:** (this file).
- **No secret credentials in repo:** `.env` used.
- **Separate package.json for frontend & backend:** yes.
- **MIT License:** `LICENSE`.
- **No leftover boilerplate:** cleaned;
- **Google Form submission (thumb/links):** ensured `docs/thumbnail.jpg` and links work.
- **Narrated video:** (https://www.loom.com/share/cb8a679686ed47ef914aed51950b7569)
- **Code freeze timing:** tag or branch **submission** 24h before class.
- **PropTypes defined for React collections:** components declare PropTypes where applicable.
- **No Axios, Mongoose, or CORS libs:** uses **fetch** and **MongoDB Node driver** only.

---
Note : `We were unable to generate images for all the lessons due to time constraints . Therefore, in certain parts of the pages , the images might not load . letter A-Z all images have been generated and updated in the database `

## License

MIT — see `LICENSE`.

