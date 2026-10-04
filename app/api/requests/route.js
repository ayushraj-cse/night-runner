import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { HOSTEL_BLOCKS, escapeRegex, serializeRequest } from "@/models/deliveryRequest";

export async function GET() {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDb();
    // The runner needs to see every request (pending/accepted/clash/completed).
    // A student only needs to see requests where they filed the order or were
    // named as a participant — this is also what powers "person history"
    // once filtered to "received" on the client.
    let query = {};
    if (me.role !== "runner") {
      query = {
        $or: [
          { "requester.id": me.id },
          {
            participants: {
              $elemMatch: { name: { $regex: `^${escapeRegex(me.name)}$`, $options: "i" } },
            },
          },
        ],
      };
    }
    const requests = await db
      .collection("deliveryRequests")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ requests: requests.map(serializeRequest) });
  } catch (err) {
    console.error("List requests error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}

export async function POST(req) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (me.role !== "student") {
    return NextResponse.json(
      { error: "Only a student (room owner) can file a delivery request" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const hostelBlock = String(body.hostelBlock || "").trim();
  const roomNumber = String(body.roomNumber || "").trim();
  const { deliveryTime } = body;
  const rawNames = Array.isArray(body.participants)
    ? body.participants.map((n) => String(n).trim()).filter(Boolean)
    : [];

  if (!HOSTEL_BLOCKS.includes(hostelBlock)) {
    return NextResponse.json(
      { error: `Hostel block must be one of: ${HOSTEL_BLOCKS.join(", ")}` },
      { status: 400 }
    );
  }
  if (!roomNumber) {
    return NextResponse.json({ error: "Room number is required" }, { status: 400 });
  }
  if (!deliveryTime || isNaN(new Date(deliveryTime).getTime())) {
    return NextResponse.json(
      { error: "A valid delivery time is required" },
      { status: 400 }
    );
  }
  if (rawNames.length === 0) {
    return NextResponse.json(
      { error: "At least one participant name is required" },
      { status: 400 }
    );
  }

  // Reject duplicate participants (case-insensitive) — the same student
  // cannot be listed twice in one group order.
  const seen = new Set();
  for (const n of rawNames) {
    const key = n.toLowerCase();
    if (seen.has(key)) {
      return NextResponse.json(
        { error: `"${n}" is listed more than once. Each participant must be unique.` },
        { status: 400 }
      );
    }
    seen.add(key);
  }

  try {
    const db = await getDb();
    const doc = {
      hostelBlock,
      roomNumber,
      deliveryTime: new Date(deliveryTime),
      requester: { id: me.id, name: me.name, role: me.role },
      participants: rawNames.map((name) => ({ name, status: "pending" })),
      status: "pending",
      clashWith: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("deliveryRequests").insertOne(doc);
    return NextResponse.json(
      { request: serializeRequest({ _id: result.insertedId, ...doc }) },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create request error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
