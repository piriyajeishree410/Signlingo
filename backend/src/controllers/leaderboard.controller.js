// backend/src/controllers/leaderboard.controller.js
import { getDB } from "../db/mongoClient.js";

export async function getTopPlayers(req, res) {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
    const db = getDB();

    // Aggregate total XP per user from userLessons
    const pipeline = [
      { $match: { xpEarned: { $gt: 0 } } },

      // normalize userId/lessonId to ObjectId if stored as strings
      {
        $addFields: {
          _user: {
            $cond: [
              { $eq: [{ $type: "$userId" }, "objectId"] },
              "$userId",
              { $toObjectId: "$userId" },
            ],
          },
          _lesson: {
            $cond: [
              { $eq: [{ $type: "$lessonId" }, "objectId"] },
              "$lessonId",
              { $toObjectId: "$lessonId" },
            ],
          },
        },
      },

      {
        $group: {
          _id: "$_user",
          totalXP: { $sum: "$xpEarned" },
          lessonsSet: { $addToSet: "$_lesson" },
          completedCount: {
            $sum: { $cond: ["$completed", 1, 0] },
          },
        },
      },
      { $addFields: { lessons: { $size: "$lessonsSet" } } },
      { $sort: { totalXP: -1, _id: 1 } },
      { $limit: limit },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: { $ifNull: ["$user.name", "Anonymous"] },
          email: "$user.email",
          totalXP: 1,
          courses: "$lessons", // distinct lessons with XP
          completedLessons: "$completedCount",
          streak: { $ifNull: ["$user.stats.streak", 0] },
          level: { $ifNull: ["$user.stats.level", 1] },
        },
      },
    ];

    const top = await db
      .collection("userLessons")
      .aggregate(pipeline)
      .toArray();

    // Attach rank on the server for convenience
    const withRank = top.map((t, i) => ({ ...t, rank: i + 1 }));

    res.json({ success: true, top: withRank });
  } catch (e) {
    console.error("Leaderboard getTopPlayers error:", e);
    res
      .status(500)
      .json({ success: false, error: "Failed to load leaderboard" });
  }
}
