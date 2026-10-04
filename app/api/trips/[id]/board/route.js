// DEPRECATED — superseded by /api/requests/[id]/handover. See note in
// app/api/trips/route.js for why this stub exists instead of being deleted.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has moved. Use /api/requests/[id]/handover instead." },
    { status: 410 }
  );
}
