# SignLingo — Learn ASL with Live Practice, Lessons & Quizzes

SignLingo is a full-stack web app where learners **study American Sign Language (ASL)** through **various lessons**, **timed quizzes with levels**, and **live webcam practice** powered by a lightweight ML detector. Track **XP, and levels**, and compete on the **leaderboard**—all with a clean, React-based UI and a Node/Express/MongoDB backend.

> **Status:** actively developed. This repo contains a React (Vite) frontend and a Node/Express/MongoDB backend (no Axios, no Mongoose, no CORS).

---

- **Deployed at:** _TBD_
- **Class Link:** \_CS5610 – Web Development (Fall 2025), Northeastern University (Canvas link: https://northeastern.instructure.com/courses/226004 )
- **Slides:** https://docs.google.com/presentation/d/1uZTNU8wF9g71Vgxkq_G2oVfmz9dJwNFh9al1qAL02qA/edit?usp=sharing
- **Thumbnail:**
- **Video Demonstration:** _TBD_

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
- **Leaderboard:** Top 10 users based on Xp displayed
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
PORT=5000
MONGO_URI=<your Atlas connection string>
SESSION_SECRET=<random-strong-secret>
NODE_ENV=development
FASTAPI_URL=http://localhost:8000   # if using the optional detector
CLIENT_ORIGIN=http://localhost:5173
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

## Screenshot

Add screenshots under `docs/screenshots/` and update paths as needed.

```
![Flashscreen](docs/screenshots/01-flashscreen.png)
```

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
- **Deployment:** _TBD: add link once deployed_.
- **≥2 Mongo collections with CRUD:** `users`, `user_lessons`, `quiz_sessions`, `lessons`, `signs` (create/read/update via endpoints).
- **1k synthetic records:** add a signs/lessons seed script if needed (e.g., `node scripts/seed_signs.js`).
- **Node + Express:** yes (backend).
- **Prettier applied:** yes.
- **Standards-based HTML:** buttons/inputs are semantic; icons are inline SVGs.
- **CSS organized by component:** `*.module.css` beside each component.
- **README includes Author, Class Link, Objective, Screenshot, Build Steps:** ✅ (this file).
- **No secret credentials in repo:** `.env` used.
- **Separate package.json for frontend & backend:** yes.
- **MIT License:** `LICENSE`.
- **No leftover boilerplate:** cleaned; remove any unused routes/assets before submission.
- **Google Form submission (thumb/links):** ensure `docs/thumbnail.jpg` and links work.
- **Narrated video:** _TBD: add Loom/YouTube link_.
- **Code freeze timing:** tag or branch **submission** 24h before class.
- **PropTypes defined for React collections:** components declare PropTypes where applicable.
- **No Axios, Mongoose, or CORS libs:** uses **fetch** and **MongoDB Node driver** only.

---

## License

MIT — see `LICENSE`.

