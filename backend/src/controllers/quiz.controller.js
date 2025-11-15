import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";
import { shuffle } from "../utils/shuffle.js";

/**
 * Data model (no Mongoose):
 * - signs: { _id, display, gloss, category, media: { imageUrl }, difficulty, ... }
 * - quiz_sessions: {
 *     _id, userId, level, questions: [
 *       { signId, mediaUrl, choices: [string...], correctIdx }
 *     ],
 *     answers: [number|null], startedAt, finishedAt, score, correctCount
 *   }
 * - users.quizProgress: {
 *     unlocked: number,           // max unlocked level (>=1)
 *     totalScore: number,
 *     starsByLevel: { [level: string]: number }  // 0..3
 *   }
 */

const QUESTIONS_PER_LEVEL = 3;
const PASS_CORRECT = 3; // must get all 3 correct
const SCORE_CORRECT = 5;
const SCORE_WRONG = -2;

// Ensure progress object shape
function ensureQuizProgress(u) {
  const qp = u.quizProgress || {};
  return {
    unlocked: typeof qp.unlocked === "number" ? qp.unlocked : 1,
    totalScore: typeof qp.totalScore === "number" ? qp.totalScore : 0,
    starsByLevel:
      typeof qp.starsByLevel === "object" && qp.starsByLevel
        ? qp.starsByLevel
        : {},
  };
}

export async function quizStatus(req, res) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.session.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const qp = ensureQuizProgress(user);
    return res.json(qp);
  } catch (e) {
    console.error("status error", e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function resetProgress(req, res) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });
    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.userId) },
      {
        $set: {
          quizProgress: { unlocked: 1, totalScore: 0, starsByLevel: {} },
          updatedAt: new Date(),
        },
      },
    );
    res.json({
      message: "Quiz progress reset",
      unlocked: 1,
      totalScore: 0,
      starsByLevel: {},
    });
  } catch (e) {
    console.error("reset error", e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function startQuiz(req, res) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });
    const userId = new ObjectId(req.session.userId);

    const {
      level = 1,
      topic = null,
      count = QUESTIONS_PER_LEVEL,
    } = req.body || {};
    const db = getDB();
    const users = db.collection("users");
    const signs = db.collection("signs");
    const sessions = db.collection("quiz_sessions");

    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const qp = ensureQuizProgress(user);
    if (level > qp.unlocked)
      return res.status(403).json({ error: "Level is locked" });

    // Build filter: require usable image
    const match = { "media.imageUrl": { $exists: true, $ne: "" } };
    if (topic) match.category = topic; // e.g., "Alphabet" or "Greetings"
    // Optional: difficulty <= level
    match.difficulty = { $lte: Number(level) || 1 };

    // sample the correct signs
    const picked = await signs
      .aggregate([
        { $match: match },
        { $sample: { size: count } },
        { $project: { display: 1, gloss: 1, "media.imageUrl": 1 } },
      ])
      .toArray();

    if (picked.length < count) {
      return res
        .status(400)
        .json({ error: "Not enough signs to build a quiz" });
    }

    // Pool for wrong options
    const pool = await signs
      .find(
        { "media.imageUrl": { $exists: true, $ne: "" } },
        { projection: { display: 1 } },
      )
      .toArray();

    const poolTexts = pool.map((x) => x.display).filter(Boolean);

    const questions = picked.map((doc) => {
      const correctText = doc.display || doc.gloss || "Unknown";
      // pick 3 wrong choices different from correct
      const wrongs = shuffle(poolTexts.filter((t) => t !== correctText)).slice(
        0,
        3,
      );
      const rawChoices = shuffle([correctText, ...wrongs]);
      const correctIdx = rawChoices.indexOf(correctText);

      return {
        signId: doc._id,
        mediaUrl: doc.media?.imageUrl || "",
        choices: rawChoices,
        correctIdx,
      };
    });

    const session = {
      userId,
      level: Number(level) || 1,
      questions,
      answers: Array(questions.length).fill(null), // store chosen indices (or null)
      startedAt: new Date(),
      finishedAt: null,
      score: 0,
      correctCount: 0,
    };

    const { insertedId } = await sessions.insertOne(session);

    // Send client-safe payload
    const safeQs = questions.map((q) => ({
      mediaUrl: q.mediaUrl,
      choices: q.choices,
    }));

    res.json({
      sessionId: String(insertedId),
      level: session.level,
      total: questions.length,
      questions: safeQs,
    });
  } catch (e) {
    console.error("start error", e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function answerQuestion(req, res) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const { sessionId, questionIndex, choice } = req.body || {};
    if (!sessionId || typeof questionIndex !== "number") {
      return res
        .status(400)
        .json({ error: "Missing sessionId or questionIndex" });
    }

    const db = getDB();
    const sid = new ObjectId(sessionId);
    const uid = new ObjectId(req.session.userId);
    const sessions = db.collection("quiz_sessions");
    const users = db.collection("users");

    const s = await sessions.findOne({ _id: sid, userId: uid });
    if (!s) return res.status(404).json({ error: "Session not found" });

    const q = s.questions?.[questionIndex];
    if (!q) return res.status(400).json({ error: "Invalid question index" });

    const prev = (s.answers || [])[questionIndex];
    const correctIdx = q.correctIdx;
    const numericChoice = typeof choice === "number" ? choice : -1;

    // If already answered before, don't change score—just report correctness.
    if (prev !== null && prev !== undefined) {
      const alreadyCorrect = prev === correctIdx;
      return res.json({
        correct: alreadyCorrect,
        correctIdx,
        alreadyAnswered: true,
      });
    }

    const correct = numericChoice === correctIdx;
    const delta = correct ? SCORE_CORRECT : SCORE_WRONG;

    // Persist answer and adjust session tallies atomically
    const newAnswers = s.answers
      ? s.answers.slice()
      : Array(s.questions.length).fill(null);
    newAnswers[questionIndex] = numericChoice;

    await sessions.updateOne(
      { _id: sid },
      {
        $set: { answers: newAnswers },
        $inc: { score: delta, ...(correct ? { correctCount: 1 } : {}) },
      },
    );

    // Increment user's global total score
    await users.updateOne(
      { _id: uid },
      {
        $inc: { "quizProgress.totalScore": delta },
        $set: { updatedAt: new Date() },
      },
    );

    return res.json({ correct, correctIdx });
  } catch (e) {
    console.error("answer error", e);
    res.status(500).json({ error: "Internal error" });
  }
}

export async function finishQuiz(req, res) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const db = getDB();
    const sid = new ObjectId(sessionId);
    const uid = new ObjectId(req.session.userId);

    const users = db.collection("users");
    const sessions = db.collection("quiz_sessions");

    const s = await sessions.findOne({ _id: sid, userId: uid });
    if (!s) return res.status(404).json({ error: "Session not found" });

    const len = s.questions.length;
    const answers = s.answers || Array(len).fill(null);

    // Any unanswered (null) → treat as wrong now and charge –2 each
    let pendingWrong = 0;
    const filledAnswers = answers.slice();
    for (let i = 0; i < len; i++) {
      if (filledAnswers[i] === null || filledAnswers[i] === undefined) {
        filledAnswers[i] = -1; // mark as timed out / unanswered
        pendingWrong += 1;
      }
    }

    const extraPenalty = pendingWrong * SCORE_WRONG;

    // We already incremented score per answered question in /answer.
    // Here we only add penalties for unanswered.
    const incDoc = { score: extraPenalty };
    // correctCount doesn't change here (unanswered are wrong)

    const finishedAt = new Date();

    await sessions.updateOne(
      { _id: sid },
      {
        $set: { answers: filledAnswers, finishedAt },
        ...(extraPenalty ? { $inc: incDoc } : {}),
      },
    );

    // Also update user's global total by the extra penalties only
    if (extraPenalty) {
      await users.updateOne(
        { _id: uid },
        {
          $inc: { "quizProgress.totalScore": extraPenalty },
          $set: { updatedAt: new Date() },
        },
      );
    }

    // Re-read session to compute final stars & unlocking
    const final = await sessions.findOne({ _id: sid, userId: uid });
    const correctCount = final?.correctCount ?? 0;
    const finalScore = final?.score ?? 0;
    const stars = Math.min(3, correctCount);

    // Unlock next level only if all 3 correct
    const u = await users.findOne({ _id: uid });
    const qp = ensureQuizProgress(u || {});
    let newUnlocked = qp.unlocked;
    if (correctCount >= PASS_CORRECT && final.level >= qp.unlocked) {
      newUnlocked = final.level + 1;
    }
    const newStars = { ...(qp.starsByLevel || {}) };
    const levelKey = String(final.level);
    newStars[levelKey] = Math.max(newStars[levelKey] || 0, stars);

    await users.updateOne(
      { _id: uid },
      {
        $set: {
          quizProgress: {
            unlocked: newUnlocked,
            totalScore: qp.totalScore || 0, // already updated via per-answer + penalties
            starsByLevel: newStars,
          },
          updatedAt: new Date(),
        },
      },
    );

    return res.json({
      correct: correctCount,
      total: len,
      stars,
      score: finalScore,
      unlocked: newUnlocked,
    });
  } catch (e) {
    console.error("finish error", e);
    res.status(500).json({ error: "Internal error" });
  }
}
