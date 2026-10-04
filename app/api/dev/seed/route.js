import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByUsername, createUser } from "@/models/user";

// Convenience endpoint for the demo: makes sure three fixed demo accounts
// exist (two students + the one runner) without needing to sign up by hand.
// Safe to call repeatedly — it skips any account that already exists.
const DEMO_USERS = [
  { name: "Rahul Kumar", username: "rahul_demo", password: "demo1234", role: "student" },
  { name: "Priya Sharma", username: "priya_demo", password: "demo1234", role: "student" },
  { name: "Demo Runner", username: "runner_demo", password: "demo1234", role: "runner" },
];

export async function POST() {
  try {
    const created = [];
    for (const u of DEMO_USERS) {
      const existing = await findUserByUsername(u.username);
      if (!existing) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await createUser({ name: u.name, username: u.username, passwordHash, role: u.role });
        created.push(u.username);
      }
    }
    return NextResponse.json({ ok: true, created });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
