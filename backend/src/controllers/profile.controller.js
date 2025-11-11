// backend/src/controllers/profile.controller.js
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

/** Resolve userId from session or ?userId=... (dev fallback) */
function resolveUserId(req) {
  if (req.session?.userId) return req.session.userId.toString();
  if (req.query?.userId) return req.query.userId.toString();
  return null;
}

/** Find first existing collection name from a candidate list */
async function pickExistingCollection(db, names = []) {
  const existing = new Set(
    (await db.listCollections().toArray()).map((c) => c.name),
  );
  return names.find((n) => existing.has(n)) || null;
}

/**
 * GET /api/profile/overview
 * Returns user summary + lessons in-progress + quiz stats.
 * This version is defensive about data types to avoid $divide type errors.
 */
export async function getProfileOverview(req, res) {
  try {
    const userIdStr = resolveUserId(req);
    if (!userIdStr || !ObjectId.isValid(userIdStr)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const userId = new ObjectId(userIdStr);
    const db = getDB();

    // --- 1) USER BASIC INFO ---
    const user = await db.collection("users").findOne(
      { _id: userId },
      {
        projection: {
          name: 1,
          age: 1,
          email: 1,
          stats: 1,
          quizProgress: 1, // fallback path
          starsByLevel: 1, // fallback path
        },
      },
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // --- 2) LESSONS IN PROGRESS ---
    // Support either "userLessons" or "user_lessons"
    const lessonsColl = await pickExistingCollection(db, [
      "userLessons",
      "user_lessons",
    ]);
    let lessonsAgg = [];
    if (lessonsColl) {
      lessonsAgg = await db
        .collection(lessonsColl)
        .aggregate([
          // match records for this user (userId may be stored as ObjectId or string)
          {
            $match: {
              $or: [{ userId }, { userId: userId.toString() }],
            },
          },
          // lookup the lesson doc; lessonId may be string or ObjectId
          {
            $lookup: {
              from: "lessons",
              let: { lid: "$lessonId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [
                        "$_id",
                        {
                          $cond: [
                            { $eq: [{ $type: "$$lid" }, "objectId"] },
                            "$$lid",
                            { $toObjectId: "$$lid" },
                          ],
                        },
                      ],
                    },
                  },
                },
                { $project: { title: 1, signIds: 1, createdAt: 1 } },
              ],
              as: "lesson",
            },
          },
          { $unwind: "$lesson" },

          // Safely compute counts, regardless of schema variants/types
          {
            $addFields: {
              // If completedSigns is array → size; else 0
              doneArrayCount: {
                $cond: [
                  { $eq: [{ $type: "$completedSigns" }, "array"] },
                  { $size: "$completedSigns" },
                  0,
                ],
              },
              // If "completed" is numeric → use; else 0
              doneNum: {
                $cond: [
                  {
                    $in: [
                      { $type: "$completed" },
                      ["int", "long", "double", "decimal"],
                    ],
                  },
                  "$completed",
                  0,
                ],
              },
              // Total signs in lesson; if not array, 0
              totalRaw: {
                $cond: [
                  { $eq: [{ $type: "$lesson.signIds" }, "array"] },
                  { $size: "$lesson.signIds" },
                  0,
                ],
              },
            },
          },
          // prefer array count if present; else numeric fallback
          {
            $addFields: {
              doneCount: {
                $cond: [
                  { $gt: ["$doneArrayCount", 0] },
                  "$doneArrayCount",
                  "$doneNum",
                ],
              },
              total: "$totalRaw",
            },
          },
          // Force numeric types explicitly
          {
            $addFields: {
              doneCountNum: { $toInt: "$doneCount" },
              totalNum: { $toInt: "$total" },
            },
          },
          // Calculate progress only when total > 0 (prevents $divide on zero or non-numeric)
          {
            $addFields: {
              progress: {
                $cond: [
                  { $gt: ["$totalNum", 0] },
                  {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$doneCountNum", "$totalNum"] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              lessonId: "$lesson._id",
              title: "$lesson.title",
              progress: 1,
              createdAt: "$lesson.createdAt",
            },
          },
          { $sort: { createdAt: 1 } },
          { $limit: 8 },
        ])
        .toArray();
    }

    // --- 3) QUIZ STATS ---
    // Prefer quiz_progress collection; else fallback to user document fields
    let levelsCompleted = 0;
    let totalScore = 0;
    let levelsUnlocked = 1;

    const qpName = await pickExistingCollection(db, ["quiz_progress"]);
    let qpDoc = null;

    if (qpName) {
      qpDoc = await db
        .collection(qpName)
        .findOne(
          { $or: [{ userId }, { userId: userId.toString() }] },
          { projection: { totalScore: 1, levelsUnlocked: 1, perLevel: 1 } },
        );
    }

    if (qpDoc) {
      totalScore = Number(qpDoc.totalScore) || 0;
      levelsUnlocked = Number(qpDoc.levelsUnlocked) || 1;
      levelsCompleted = qpDoc.perLevel
        ? Object.values(qpDoc.perLevel).filter((x) => x?.passed === true).length
        : 0;
    } else {
      const qp = user.quizProgress || {};
      const sbl = user.starsByLevel || {};
      totalScore = Number(qp.totalScore) || 0;
      levelsUnlocked = Number(qp.unlocked) || 1;
      levelsCompleted = Object.values(sbl).filter((v) => Number(v) > 0).length;
    }

    // Response
    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: user.age ?? null,
          email: user.email,
          xp: Number(user.stats?.xp ?? 0),
          level: Number(user.stats?.level ?? 1),
          streak: Number(user.stats?.streak ?? 0),
          xpGoal: Number(user.stats?.xpGoal ?? 3000),
        },
        lessons: lessonsAgg.map((r) => ({
          id: r.lessonId,
          title: r.title,
          progress: Number(r.progress ?? 0),
        })),
        quizzes: {
          totalScore,
          levelsUnlocked,
          levelsCompleted,
        },
      },
    });
  } catch (err) {
    console.error("getProfileOverview error:", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

/** PATCH /api/profile */
export async function updateProfile(req, res) {
  try {
    const userIdStr = resolveUserId(req);
    if (!userIdStr || !ObjectId.isValid(userIdStr)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const userId = new ObjectId(userIdStr);
    const { name, age, email } = req.body ?? {};
    const db = getDB();

    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          ...(name ? { name } : {}),
          ...(email ? { email: email.toLowerCase() } : {}),
          ...(typeof age !== "undefined" ? { age: Number(age) || null } : {}),
          updatedAt: new Date(),
        },
      },
    );

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

/** DELETE /api/profile */
export async function deleteProfile(req, res) {
  try {
    const userIdStr = resolveUserId(req);
    if (!userIdStr || !ObjectId.isValid(userIdStr)) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const userId = new ObjectId(userIdStr);
    const db = getDB();

    await db.collection("users").deleteOne({ _id: userId });

    // Clean up both possible collection names
    const ulName = await pickExistingCollection(db, [
      "userLessons",
      "user_lessons",
    ]);
    if (ulName) {
      await db.collection(ulName).deleteMany({
        $or: [{ userId }, { userId: userId.toString() }],
      });
    }

    const qpName = await pickExistingCollection(db, ["quiz_progress"]);
    if (qpName) {
      await db.collection(qpName).deleteMany({
        $or: [{ userId }, { userId: userId.toString() }],
      });
    }

    req.session?.destroy?.(() => {});
    res.clearCookie("connect.sid");

    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("deleteProfile error:", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}
