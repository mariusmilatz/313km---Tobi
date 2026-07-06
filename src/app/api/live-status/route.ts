import { NextResponse } from "next/server";
import { getLiveTrackingStatus } from "@/lib/integrations";

// Small read-only JSON endpoint so client components can poll for fresh
// distance/day/last-update numbers without re-implementing the Supabase +
// route-progress computation in the browser bundle (see
// src/lib/integrations.ts and src/lib/route-progress.ts for the actual
// logic). Used by LiveStatsStrip and DaysList — the map's own marker still
// polls Supabase directly for the raw point, since it only needs lat/lng,
// not the derived day/distance math.
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getLiveTrackingStatus();
  return NextResponse.json(status);
}
