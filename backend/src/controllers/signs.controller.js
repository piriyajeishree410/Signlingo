// backend/src/controllers/signs.controller.js
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

/**
 * GET /api/signs
 * Optional query:
 *   q=search term (matches gloss, display, category, tags)
 *   limit=number (default 60)
 */
export async function listSigns(req, res) {
  try {
    const db = getDB();
    const { q = "", limit = "60" } = req.query;

    const lim = Math.min(200, Math.max(1, Number(limit) || 60));
    const term = String(q).trim();

    const query = term
      ? {
          $or: [
            { gloss: { $regex: term, $options: "i" } },
            { display: { $regex: term, $options: "i" } },
            { category: { $regex: term, $options: "i" } },
            { tags: { $elemMatch: { $regex: term, $options: "i" } } },
          ],
        }
      : {};

    const docs = await db
      .collection("signs")
      .find(query, {
        projection: {
          // keep the payload small for the grid
          gloss: 1,
          display: 1,
          category: 1,
          "media.imageUrl": 1,
        },
      })
      .limit(lim)
      .toArray();

    // normalize response shape
    const items = docs.map((d) => ({
      id: d._id,
      label: d.display || d.gloss,
      category: d.category || "",
      imageUrl: d?.media?.imageUrl || "",
    }));

    res.json({ items });
  } catch (err) {
    console.error("listSigns error:", err);
    res.status(500).json({ error: "Failed to fetch signs" });
  }
}

/**
 * GET /api/signs/:id
 * Returns full details for the modal.
 */
export async function getSign(req, res) {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const doc = await db.collection("signs").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          gloss: 1,
          display: 1,
          category: 1,
          description: 1,
          aliases: 1,
          tags: 1,
          difficulty: 1,
          "media.imageUrl": 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({
      id: doc._id,
      label: doc.display || doc.gloss,
      category: doc.category || "",
      description: doc.description || "",
      aliases: doc.aliases || [],
      tags: doc.tags || [],
      difficulty: doc.difficulty ?? null,
      imageUrl: doc?.media?.imageUrl || "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("getSign error:", err);
    res.status(500).json({ error: "Failed to fetch sign" });
  }
}
