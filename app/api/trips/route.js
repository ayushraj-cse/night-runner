// DEPRECATED — superseded by /api/requests as part of the Night Canteen
// Runner rewrite. This file could not be removed from disk because the
// sandbox's Linux bridge could not unlink it while OneDrive held a sync
// lock on the host side, so it is neutralized here instead. It is not
// imported or linked from any current frontend code.
import { NextResponse } from "next/server";

function gone() {
  return NextResponse.json(
    { error: "This endpoint has moved. Use /api/requests instead." },
    { status: 410 }
  );
}

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}
