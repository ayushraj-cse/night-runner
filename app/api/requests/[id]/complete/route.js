import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { serializeRequest } from "@/models/deliveryRequest";

export async function POST(req, { params }) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (me.role !== "runner") {
    return NextResponse.json(
      { error: "Only the runner can complete a delivery" },
      { status: 403 }
    );
  }

  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Delivery request not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const col = db.collection("deliveryRequests");
    const reqDoc = await col.findOne({ _id: new ObjectId(id) });
    if (!reqDoc) {
      return NextResponse.json({ error: "Delivery request not found" }, { status: 404 });
    }
    if (reqDoc.status !== "accepted") {
      return NextResponse.json(
        { error: "Only an active (accepted) delivery can be completed" },
        { status: 409 }
      );
    }

    // Backend-enforced rule: every participant must have a recorded outcome
    // (received or sleeping) before the trip can be closed out. The runner
    // cannot finish a delivery while someone's status is still undecided.
    const outstanding = reqDoc.participants.filter((p) => p.status === "pending");
    if (outstanding.length > 0) {
      return NextResponse.json(
        {
          error: `Mark an outcome for everyone before completing. Still pending: ${outstanding
            .map((p) => p.name)
            .join(", ")}.`,
        },
        { status: 409 }
      );
    }

    await col.updateOne(
      { _id: reqDoc._id },
      { $set: { status: "completed", completedAt: new Date(), updatedAt: new Date() } }
    );
    const updated = await col.findOne({ _id: reqDoc._id });
    return NextResponse.json({ request: serializeRequest(updated) });
  } catch (err) {
    console.error("Complete request error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
