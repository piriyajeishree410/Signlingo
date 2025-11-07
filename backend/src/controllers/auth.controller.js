// backend/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { getDB } from "../db/mongoClient.js";

// -------------------- SIGNUP --------------------
export async function signup(req, res) {
  try {
    const { name, age, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const db = getDB();
    const users = db.collection("users");

    // Check if email already exists
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user document
    const newUser = {
      name,
      age: Number(age) || null,
      email: email.toLowerCase(),
      phone: phone || "",
      passwordHash: hashed,
      stats: { xp: 0, level: 1, hearts: 10 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    // Save session
    req.session.userId = result.insertedId;
    res.status(201).json({
      message: "Account created successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        level: 1,
        xp: 0,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// -------------------- LOGIN --------------------
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user._id;
    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        level: user.stats?.level ?? 1,
        xp: user.stats?.xp ?? 0,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// -------------------- LOGOUT --------------------
export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
}

// -------------------- CHECK SESSION --------------------
export function checkSession(req, res) {
  if (!req.session.userId) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, userId: req.session.userId });
}
