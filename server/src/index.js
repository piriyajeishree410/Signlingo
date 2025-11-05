import "dotenv/config";
import express from "express";
import liveRouter from "./routes/live.js";

const app = express();
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/live", liveRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express on http://localhost:${PORT}`));
