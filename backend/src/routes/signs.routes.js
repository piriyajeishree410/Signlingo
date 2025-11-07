import express from "express";
import { getDB } from "../db/mongoClient.js";

const router = express.Router();

// escape regex specials in user query
function escapeRegExp(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/signs?q=A&limit=60
 * Only searches the `gloss` field.
 * Default is exact (case-insensitive) match. Flip EXACT_MATCH to false for contains-match.
 */
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const col = db.collection("signs");

    const q = (req.query.q || "").toString().trim();
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 60));

    const EXACT_MATCH = true; // <— set to false if you want "contains" instead of exact
    let filter = {};

    if (q) {
      const esc = escapeRegExp(q);
      filter = EXACT_MATCH
        ? { gloss: { $regex: `^${esc}$`, $options: "i" } } // exact, case-insensitive
        : { gloss: { $regex: esc, $options: "i" } }; // contains, case-insensitive
    }

    const docs = await col.find(filter).limit(limit).toArray();

    const items = docs.map((d) => ({
      id: String(d._id),
      // Prefer gloss for label since we're searching by it:
      label: d.gloss || d.display || String(d._id),
      category: d.category || "—",
      img: d.media?.imageUrl || "", // uses your media.imageUrl
      desc: d.description || "",
      tags: d.tags || [],
    }));

    res.json({ items, total: items.length });
  } catch (e) {
    console.error("GET /api/signs failed:", e);
    res.status(500).json({ error: "Failed to fetch signs" });
  }
});

export default router;
