import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

export const startLesson = async (req, res) => {
  try {
    const db = getDB();
    const { userId, lessonId } = req.body;

    const existing = await db.collection("userLessons").findOne({
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
    });

    if (existing) return res.json({ success: true, userLesson: existing });

    const newDoc = {
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
      completedSigns: [],
      xpEarned: 0,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("userLessons").insertOne(newDoc);
    res.json({ success: true, userLesson: { ...newDoc, _id: result.insertedId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserLessons = async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.query;

    const lessons = await db
      .collection("userLessons")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const db = getDB();
    const { lessonId } = req.params;
    const { userId, signId } = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(lessonId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    console.log("🟢 updateProgress called with:", { lessonId, userId, signId });

    // check if userLesson exists; create if not
    let userLesson = await db.collection("userLessons").findOne({
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
    });

    if (!userLesson) {
      userLesson = {
        userId: new ObjectId(userId),
        lessonId: new ObjectId(lessonId),
        completedSigns: [],
        xpEarned: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { insertedId } = await db.collection("userLessons").insertOne(userLesson);
      userLesson._id = insertedId;
    }

    // get lesson to count signs
    const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    // update completed signs + XP
    const updatedSigns = [...new Set([...userLesson.completedSigns.map(String), signId])];
    const completed = updatedSigns.length === lesson.signIds.length;
    const xpEarned = updatedSigns.length * 5;

    await db.collection("userLessons").updateOne(
      { _id: userLesson._id },
      {
        $set: {
          completedSigns: updatedSigns.map((id) => new ObjectId(id)),
          xpEarned,
          completed,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ success: true, completed, xpEarned });
  } catch (err) {
    console.error("updateProgress error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const resetLesson = async (req, res) => {
  try {
    const db = getDB();
    const { lessonId } = req.params;
    const { userId } = req.body;

    await db.collection("userLessons").deleteOne({
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
    });

    res.json({ success: true, message: "Progress reset" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProgressForLesson = async (req, res) => {
  try {
    const db = getDB();
    const { userId, lessonId } = req.query;

    const record = await db.collection("userLessons").findOne({
      userId: new ObjectId(userId),
      lessonId: new ObjectId(lessonId),
    });

    if (!record) {
      return res.json({ success: true, progress: null });
    }

    res.json({
      success: true,
      progress: {
        completedSigns: record.completedSigns,
        xpEarned: record.xpEarned,
        completed: record.completed,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
