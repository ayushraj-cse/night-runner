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
      { error: "Only the runner can accept delivery requests" },
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
    if (reqDoc.status !== "pending") {
      return NextResponse.json(
        { error: `This request is already ${reqDoc.status}.` },
        { status: 409 }
      );
    }

    // CORE BUSINESS RULE: there is exactly one runner, so only one request
    // may ever sit in "accepted" status at a time. This is enforced here —
    // server-side — independent of whatever the frontend thinks the runner's
    // state is, so two conflicting requests can never both be accepted even
    // if requests are fired directly at the API.
    const activeRequest = await col.findOne({ status: "accepted" });
    if (activeRequest) {
      await col.updateOne(
        { _id: reqDoc._id },
        { $set: { status: "clash", clashWith: activeRequest._id, updatedAt: new Date() } }
      );
      return NextResponse.json(
        {
          error: `Runner unavailable — already on a delivery to ${activeRequest.hostelBlock}, Room ${activeRequest.roomNumber}. This request has been marked as a clash.`,
          conflictingRequest: serializeRequest(activeRequest),
        },
        { status: 409 }
      );
    }

    await col.updateOne(
      { _id: reqDoc._id },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    const updated = await col.findOne({ _id: reqDoc._id });
    return NextResponse.json({ request: serializeRequest(updated) });
  } catch (err) {
    console.error("Accept request error:", err);
    return NextResponse.json({ error: `Database error: ${err.message}` }, { status: 500 });
  }
}
