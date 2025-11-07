/* eslint-disable no-console */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, DB_NAME, BASE_MEDIA_URL } = process.env;
if (!MONGO_URI || !DB_NAME) {
  console.error("❌ MONGO_URI or DB_NAME missing in .env");
  process.exit(1);
}
const MEDIA =
  BASE_MEDIA_URL?.replace(/\/$/, "") || "https://example.com/assets";

const now = () => new Date();

function makeAlphabetDocs() {
  const letters = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  ); // A..Z
  return letters.map((L) => ({
    gloss: L,
    display: `Letter ${L}`,
    category: "Alphabet",
    aliases: [],
    description: `Handshape for the letter ${L}.`,
    // PNG primary with JPG fallback kept alongside (frontend can try imageUrlAlt if imageUrl fails)
    media: {
      imageUrl: `${MEDIA}/alphabet/${L}.png`,
      imageUrlAlt: `${MEDIA}/alphabet/${L}.jpg`,
    },
    difficulty: 1,
    tags: ["alphabet", "beginner"],
    createdAt: now(),
    updatedAt: now(),
  }));
}

async function createIndexes(signsCol) {
  await signsCol.createIndex({ gloss: "text", aliases: "text", tags: "text" });
  await signsCol.createIndex({ category: 1 });
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const signs = db.collection("signs");

  const categories = ["Alphabet"];

  // Clean just this category
  await signs.deleteMany({ category: { $in: categories } });

  const docs = makeAlphabetDocs();

  const { insertedCount } = await signs.insertMany(docs);
  await createIndexes(signs);

  console.log(`✅ Seeded ${insertedCount} alphabet signs.`);
  console.log("✅ Indexes ensured on text and category.");

  await client.close();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
