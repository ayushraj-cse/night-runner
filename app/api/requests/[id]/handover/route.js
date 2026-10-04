import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { serializeRequest } from "@/models/deliveryRequest";

// Marks an individual participant's delivery outcome: received or sleeping.
// Each participant gets their own independent outcome — the request as a
// whole never collapses this down to a single status.
export async function POST(req, { params }) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (me.role !== "runner") {
    return NextResponse.json(
      { error: "Only the runner can record a handover outcome" },
      { status: 403 }
    );
  }

  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Delivery request not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name;
  const status = body?.status;
  if (!name || !["received", "sleeping"].includes(status)) {
    return NextResponse.json(
      { error: "A participant name and outcome of received/sleeping are required" },
      { status: 400 }
    );
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
        { error: "Handover outcomes can only be recorded on an active (accepted) delivery" },
        { status: 409 }
      );
    }
    const hasParticipant = reqDoc.participants.some((p) => p.name === name);
    if (!hasParticipant) {
      return NextResponse.json(
        { error: "That participant is not on this delivery request" },
        { status: 404 }
      );
    }

    await col.updateOne(
      { _id: reqDoc._id, "participants.name": name },
      { $set: { "participants.$.status": status, updatedAt: new Date() } }
    );
    const updated = await col.findOne({ _id: reqDoc._id });
    return NextResponse.json({ request: serializeRequest(updated) });
  } catch (err) {
    console.error("Handover error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
