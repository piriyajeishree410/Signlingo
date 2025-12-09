import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

export function configurePassport(passport) {
  const db = getDB();
  const users = db.collection("users");

  // LOCAL STRATEGY
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await users.findOne({ email });
          if (!user) return done(null, false, { message: "Email not found" });

          const match = await bcrypt.compare(password, user.passwordHash);
          if (!match)
            return done(null, false, { message: "Incorrect password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // GOOGLE STRATEGY
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existing = await users.findOne({ googleId: profile.id });
          if (existing) return done(null, existing);

          const newUser = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value?.toLowerCase(),
            avatarUrl: profile.photos?.[0]?.value || "",
            stats: { xp: 0, level: 1, hearts: 10 },
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = await users.insertOne(newUser);
          return done(null, { ...newUser, _id: result.insertedId });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // SERIALIZE
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // DESERIALIZE
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await users.findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
