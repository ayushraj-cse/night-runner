// DEPRECATED — superseded by /api/requests/[id]/accept. See note in
// app/api/trips/route.js for why this stub exists instead of being deleted.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has moved. Use /api/requests/[id]/accept instead." },
    { status: 410 }
  );
}
