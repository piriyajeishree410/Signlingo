/* eslint-disable no-console */
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, DB_NAME } = process.env;
if (!MONGO_URI || !DB_NAME) {
  console.error("❌ MONGO_URI or DB_NAME missing in .env");
  process.exit(1);
}

const now = () => new Date();

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const signsCol = db.collection("signs");
  const lessonsCol = db.collection("lessons");

  console.log("🔍 fetching sign IDs per category...");
  const categories = ["Alphabet", "Greeting", "Number", "FoodDrink"];

  const signMap = {};
  for (const cat of categories) {
    signMap[cat] = await signsCol
      .find({ category: cat })
      .project({ _id: 1 })
      .toArray();
  }

  // helper to extract _id array
  const ids = (arr) => arr.map((s) => new ObjectId(s._id));

  // clean only existing lessons of these categories
  await lessonsCol.deleteMany({ category: { $in: categories } });

  const lessons = [
    {
      slug: "alphabet-basics",
      title: "Alphabet Basics",
      category: "Alphabet",
      signIds: ids(signMap.Alphabet),
      estimatedMinutes: 3,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      slug: "greetings-1",
      title: "Greetings & Polite Expressions",
      category: "Greeting",
      signIds: ids(signMap.Greeting),
      estimatedMinutes: 2,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      slug: "numbers-1",
      title: "Counting with Signs",
      category: "Number",
      signIds: ids(signMap.Number),
      estimatedMinutes: 4,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      slug: "food-drinks-1",
      title: "Food & Drinks Vocabulary",
      category: "FoodDrink",
      signIds: ids(signMap.FoodDrink),
      estimatedMinutes: 3,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  const { insertedCount } = await lessonsCol.insertMany(lessons);
  console.log(`✅ Seeded ${insertedCount} lessons with linked signs.`);

  await client.close();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
