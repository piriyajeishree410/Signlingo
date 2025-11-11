import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

/** Resolve logged-in user from the session */
function requireSessionUser(req, res) {
  const id = req.session?.userId;
  if (!id || !ObjectId.isValid(id)) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return null;
  }
  return new ObjectId(id);
}

/** Make a legacy-safe filter that matches string OR ObjectId userId */
function userMatch(oid) {
  return { $or: [{ userId: oid }, { userId: oid.toString() }] };
}

/** POST /api/user-lessons/start  { lessonId }  */
export async function startLesson(req, res) {
  const userId = requireSessionUser(req, res);
  if (!userId) return;

  const { lessonId } = req.body || {};
  if (!lessonId || !ObjectId.isValid(lessonId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid lessonId" });
  }
  const db = getDB();
  const lid = new ObjectId(lessonId);

  // upsert the record; prefer storing ObjectIds going forward
  const now = new Date();
  const { value } = await db.collection("userLessons").findOneAndUpdate(
    { ...userMatch(userId), lessonId: lid },
    {
      $setOnInsert: {
        userId,
        lessonId: lid,
        completedSigns: [],
        xpEarned: 0,
        completed: false,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );

  res.json({ success: true, userLesson: value });
}

/** GET /api/user-lessons/progress?lessonId=... */
export async function getProgressForLesson(req, res) {
  const userId = requireSessionUser(req, res);
  if (!userId) return;

  const { lessonId } = req.query || {};
  if (!lessonId || !ObjectId.isValid(lessonId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid lessonId" });
  }
  const db = getDB();
  const lid = new ObjectId(lessonId);

  const rec = await db.collection("userLessons").findOne({
    ...userMatch(userId),
    lessonId: lid,
  });

  if (!rec) return res.json({ success: true, progress: null });

  res.json({
    success: true,
    progress: {
      completedSigns: (rec.completedSigns || []).map(String),
      xpEarned: Number(rec.xpEarned || 0),
      completed: !!rec.completed,
    },
  });
}

/** GET /api/user-lessons  (all for this user) */
export async function getUserLessons(req, res) {
  const userId = requireSessionUser(req, res);
  if (!userId) return;

  const db = getDB();
  const rows = await db
    .collection("userLessons")
    .find(userMatch(userId))
    .toArray();

  res.json({ success: true, lessons: rows });
}

/** PUT /api/user-lessons/:lessonId/progress  { signId } */
export async function updateProgress(req, res) {
  const userId = requireSessionUser(req, res);
  if (!userId) return;

  const { lessonId } = req.params;
  const { signId } = req.body || {};

  if (!ObjectId.isValid(lessonId) || !ObjectId.isValid(signId)) {
    return res.status(400).json({ success: false, message: "Invalid IDs" });
  }

  const db = getDB();
  const lid = new ObjectId(lessonId);
  const sid = new ObjectId(signId);

  // ensure record exists
  let rec = await db
    .collection("userLessons")
    .findOne({ ...userMatch(userId), lessonId: lid });
  if (!rec) {
    await db.collection("userLessons").insertOne({
      userId,
      lessonId: lid,
      completedSigns: [],
      xpEarned: 0,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    rec = await db.collection("userLessons").findOne({ userId, lessonId: lid });
  }

  // total signs in lesson (for completion calc)
  const lesson = await db
    .collection("lessons")
    .findOne({ _id: lid }, { projection: { signIds: 1 } });
  if (!lesson)
    return res
      .status(404)
      .json({ success: false, message: "Lesson not found" });

  const prev = (rec.completedSigns || []).map((x) => x.toString());
  const nextSet = new Set(prev);
  nextSet.add(sid.toString());
  const nextArr = [...nextSet].map((x) => new ObjectId(x));

  const completed = nextArr.length === (lesson.signIds?.length || 0);
  const xpEarned = nextArr.length * 5; // 5 XP per sign

  await db.collection("userLessons").updateOne(
    { _id: rec._id },
    {
      $set: {
        completedSigns: nextArr,
        completed,
        xpEarned,
        updatedAt: new Date(),
      },
    },
  );

  res.json({ success: true, completed, xpEarned });
}

/** DELETE /api/user-lessons/:lessonId/reset */
export async function resetLesson(req, res) {
  const userId = requireSessionUser(req, res);
  if (!userId) return;

  const { lessonId } = req.params;
  if (!ObjectId.isValid(lessonId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid lessonId" });
  }

  const db = getDB();
  const lid = new ObjectId(lessonId);

  await db
    .collection("userLessons")
    .deleteOne({ ...userMatch(userId), lessonId: lid });
  res.json({ success: true, message: "Progress reset" });
}

/**
 * GET /api/user-lessons
 * Returns a summary of all user lesson progress records for the logged-in user
 */
export const getAllUserLessons = async (req, res) => {
  try {
    const db = getDB();

    // ✅ Allow userId from session OR query (for flexibility)
    const userId = req.query.userId || req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Missing userId or not logged in",
      });
    }

    const filter = {
      $or: [{ userId: new ObjectId(userId) }, { userId: userId.toString() }],
    };

    const progressList = await db
      .collection("userLessons")
      .find(filter)
      .project({
        _id: 1,
        lessonId: 1,
        completedSigns: 1,
        xpEarned: 1,
        updatedAt: 1,
      })
      .toArray();

    res.json({ success: true, progressList });
  } catch (err) {
    console.error("getAllUserLessons error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching user lessons",
    });
  }
};
