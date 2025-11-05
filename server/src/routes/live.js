import { Router } from "express";
import multer from "multer";

const upload = multer(); // keeps file in memory
const router = Router();

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8001";

/**
 * Accepts multipart/form-data with field "image"
 * Forwards to FastAPI /detect?mode=letters|gestures
 */
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    const mode = (req.query.mode || "letters").toString();
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Node 18+ has global fetch, FormData, Blob
    const fd = new FormData();
    const contentType = req.file.mimetype || "image/jpeg";
    fd.append(
      "image",
      new Blob([req.file.buffer], { type: contentType }),
      "frame.jpg"
    );

    const resp = await fetch(
      `${FASTAPI_URL}/detect?mode=${encodeURIComponent(mode)}`,
      {
        method: "POST",
        body: fd,
      }
    );

    const json = await resp.json();
    return res.status(resp.status).json(json);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

export default router;
