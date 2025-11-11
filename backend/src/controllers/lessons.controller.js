import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

/**
 * GET /api/lessons
 * Returns all active lessons (basic info for dashboard)
 */
export const getAllLessons = async (req, res) => {
  try {
    const db = getDB();

    const lessons = await db
      .collection("lessons")
      .aggregate([
        { $match: { isActive: true } },
        {
          $project: {
            title: 1,
            category: 1,
            estimatedMinutes: 1,
            isActive: 1,
            createdAt: 1,
            signCount: { $size: "$signIds" },
          },
        },
        { $sort: { createdAt: 1 } },
      ])
      .toArray();

    res.json({ success: true, lessons });
  } catch (error) {
    console.error("getAllLessons error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/lessons/:id
 * Returns one lesson with all its linked signs (for LessonView)
 */
export const getLessonById = async (req, res) => {
  try {
    const db = getDB();
    const lessonId = req.params.id;

    console.log("🔍 lessonId param:", lessonId);

    if (!ObjectId.isValid(lessonId)) {
      console.log("❌ invalid id");
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID" });
    }

    // quick check: does the doc exist at all?
    const checkDoc = await db
      .collection("lessons")
      .findOne({ _id: new ObjectId(lessonId) });
    console.log("📄 direct findOne result:", checkDoc ? "found" : "not found");
    console.log(
      "🧩 lesson document snapshot:",
      JSON.stringify(checkDoc, null, 2),
    );

    const pipeline = [
      { $match: { _id: new ObjectId(lessonId) } },
      { $unwind: "$signIds" },
      {
        $lookup: {
          from: "signs",
          localField: "signIds",
          foreignField: "_id",
          as: "signObj",
        },
      },
      { $unwind: "$signObj" },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          category: { $first: "$category" },
          estimatedMinutes: { $first: "$estimatedMinutes" },
          isActive: { $first: "$isActive" },
          createdAt: { $first: "$createdAt" },
          signs: { $push: "$signObj" },
        },
      },
    ];

    const result = await db.collection("lessons").aggregate(pipeline).toArray();
    console.log("📊 aggregate result length:", result.length);

    const lesson = result[0];

    if (!lesson) {
      console.log("❌ aggregation returned no lesson");
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    console.log(
      "✅ lesson loaded:",
      lesson.title,
      "signs:",
      lesson.signs.length,
    );

    res.json({ success: true, lesson });
  } catch (error) {
    console.error("💥 getLessonById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
