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
    String.fromCharCode(65 + i),
  ); // A..Z
  return letters.map((L) => ({
    gloss: L,
    display: `Letter ${L}`,
    category: "Alphabet",
    aliases: [],
    description: `Handshape for the letter ${L}.`,
    media: { imageUrl: `${MEDIA}/alphabet/${L}.png` },
    difficulty: 1,
    tags: ["alphabet", "beginner"],
    createdAt: now(),
    updatedAt: now(),
  }));
}

function makeNumberDocs() {
  const N = 10; // 1..10
  return Array.from({ length: N }, (_, i) => i + 1).map((n) => ({
    gloss: String(n),
    display: `Number ${n}`,
    category: "Number",
    aliases: [],
    description: `Sign for the number ${n}.`,
    media: { imageUrl: `${MEDIA}/numbers/${n}.png` },
    numberValue: n,
    difficulty: 1,
    tags: ["number", "math", "beginner"],
    createdAt: now(),
    updatedAt: now(),
  }));
}

function makeGreetingDocs() {
  const items = [
    {
      gloss: "HELLO",
      display: "Hello",
      aliases: ["Hi"],
      slug: "hello",
      description: "Flat hand near forehead, moving outward in a small wave.",
    },
    {
      gloss: "GOOD_MORNING",
      display: "Good Morning",
      aliases: [],
      slug: "good-morning",
      description: "‘Good’ + arm lifts like the rising sun.",
    },
    {
      gloss: "GOOD_AFTERNOON",
      display: "Good Afternoon",
      aliases: [],
      slug: "good-afternoon",
      description: "‘Good’ + arm flat in front (sun overhead).",
    },
    {
      gloss: "GOOD_EVENING",
      display: "Good Evening",
      aliases: [],
      slug: "good-evening",
      description: "‘Good’ + curved hand lowering over flat hand (sunset).",
    },
    {
      gloss: "GOOD_NIGHT",
      display: "Good Night",
      aliases: [],
      slug: "good-night",
      description: "Similar to Good Evening; hands settle like sleeping.",
    },
    {
      gloss: "HOW_ARE_YOU",
      display: "How are you?",
      aliases: ["How do you do?"],
      slug: "how-are-you",
      description: "Thumbs up near chest, twist outwards + point to person.",
    },
    {
      gloss: "THANK_YOU",
      display: "Thank you",
      aliases: ["Thanks"],
      slug: "thank-you",
      description: "Fingers from chin move forward.",
    },
    {
      gloss: "YOU_ARE_WELCOME",
      display: "You're welcome",
      aliases: [],
      slug: "youre-welcome",
      description: "Hand moves out from chin or nod gesture.",
    },
    {
      gloss: "PLEASE",
      display: "Please",
      aliases: [],
      slug: "please",
      description: "Flat hand circles on chest.",
    },
    {
      gloss: "SORRY",
      display: "Sorry",
      aliases: ["Apologies"],
      slug: "sorry",
      description: "Fist rubs chest in a circle.",
    },
    {
      gloss: "BYE",
      display: "Bye",
      aliases: ["Goodbye"],
      slug: "bye",
      description: "Simple wave.",
    },
  ];

  return items.map((g) => ({
    gloss: g.gloss,
    display: g.display,
    category: "Greeting",
    aliases: g.aliases,
    description: g.description,
    media: { imageUrl: `${MEDIA}/greetings/${g.slug}.png` },
    difficulty: 1,
    tags: ["greeting", "common", "beginner"],
    usageExample: g.display,
    createdAt: now(),
    updatedAt: now(),
  }));
}

function makeFoodDrinkDocs() {
  // You can expand this list freely; keep slug lowercase with dashes matching your filenames.
  const items = [
    {
      gloss: "APPLE",
      display: "Apple",
      slug: "apple",
      description: "Twist knuckle near cheek.",
    },
    {
      gloss: "BANANA",
      display: "Banana",
      slug: "banana",
      description: "Peel a banana motion.",
    },
    {
      gloss: "RICE",
      display: "Rice",
      slug: "rice",
      description: "Spoon to mouth twice.",
    },
    {
      gloss: "BREAD",
      display: "Bread",
      slug: "bread",
      description: "Slice hand across palm.",
    },
    {
      gloss: "MILK",
      display: "Milk",
      slug: "milk",
      description: "Fist open/close (milking).",
    },
    {
      gloss: "WATER",
      display: "Water",
      slug: "water",
      description: "‘W’ hand taps chin.",
    },
    {
      gloss: "TEA",
      display: "Tea",
      slug: "tea",
      description: "Stir teacup motion.",
    },
    {
      gloss: "COFFEE",
      display: "Coffee",
      slug: "coffee",
      description: "Grind fists motion.",
    },
    {
      gloss: "JUICE",
      display: "Juice",
      slug: "juice",
      description: "‘J’ near mouth.",
    },
    {
      gloss: "PIZZA",
      display: "Pizza",
      slug: "pizza",
      description: "‘Z’ motion near mouth.",
    },
    {
      gloss: "SANDWICH",
      display: "Sandwich",
      slug: "sandwich",
      description: "Hands hold & bite motion.",
    },
    {
      gloss: "CHEESE",
      display: "Cheese",
      slug: "cheese",
      description: "Rub palms together.",
    },
    {
      gloss: "SOUP",
      display: "Soup",
      slug: "soup",
      description: "Spoon to mouth from bowl.",
    },
    {
      gloss: "CHICKEN",
      display: "Chicken",
      slug: "chicken",
      description: "Beak motion near mouth.",
    },
  ];

  return items.map((f) => ({
    gloss: f.gloss,
    display: f.display,
    category: "FoodDrink",
    aliases: [],
    description: f.description,
    media: { imageUrl: `${MEDIA}/food-drinks/${f.slug}.png` },
    difficulty: 1,
    tags: ["food", "beginner"],
    createdAt: now(),
    updatedAt: now(),
  }));
}

async function createIndexes(signsCol) {
  await signsCol.createIndex({ gloss: "text", aliases: "text", tags: "text" });
  await signsCol.createIndex({ category: 1 });
  await signsCol.createIndex({ numberValue: 1 });
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const signs = db.collection("signs");

  const categories = ["Alphabet", "Number", "Greeting", "FoodDrink"];

  // Clean just these categories to avoid nuking other work-in-progress signs
  await signs.deleteMany({ category: { $in: categories } });

  const docs = [
    ...makeAlphabetDocs(),
    ...makeNumberDocs(),
    ...makeGreetingDocs(),
    ...makeFoodDrinkDocs(),
  ];

  const { insertedCount } = await signs.insertMany(docs);
  await createIndexes(signs);

  console.log(`✅ Seeded ${insertedCount} signs.`);
  console.log("✅ Indexes ensured on text, category, numberValue.");

  await client.close();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
