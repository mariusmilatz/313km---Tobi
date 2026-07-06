import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/serviceClient";

// Ingest endpoint for Tobi's phone-based backup tracker (Traccar Client, or
// any other app that speaks the same "OsmAnd protocol" most GPS logger apps
// support). Point the app's server URL at:
//   https://<your-domain>/api/ingest/traccar
//
// NOTE ON WIRE FORMAT: Traccar's documented protocol sends fields as flat
// query parameters (id, lat, lon, altitude, speed [knots], timestamp), either
// as a GET request or as a form/query-string POST body. Some client app
// versions instead send a nested JSON shape ({ location: { coords: {...} },
// device_id }) with speed in m/s. This endpoint tries the flat shape first
// and falls back to the nested one, but since the exact wire format can
// differ by app/version, plan to double-check this once Tobi's app is
// actually configured and sending real pings — inspect a request (e.g. via
// Vercel's function logs) and adjust the parsing below if needed.
//
// TRACCAR_SHARED_SECRET (optional but recommended): set this env var to any
// random string, then configure the same value as the "Device Identifier" in
// the tracker app. Requests with a non-matching id are rejected, so random
// internet traffic can't inject fake positions into the public map.

export const dynamic = "force-dynamic";

interface ExtractedFix {
  id?: string;
  lat?: number;
  lng?: number;
  elevationM?: number;
  speedKmh?: number;
  timestampRaw?: string | number;
}

function knotsToKmh(knots: number): number {
  return Math.round(knots * 1.852 * 10) / 10;
}

function metersPerSecondToKmh(mps: number): number {
  return Math.round(mps * 3.6 * 10) / 10;
}

function extractFlat(obj: Record<string, unknown>): ExtractedFix | null {
  const lat = obj.lat !== undefined ? Number(obj.lat) : undefined;
  const lng = obj.lon !== undefined ? Number(obj.lon) : obj.lng !== undefined ? Number(obj.lng) : undefined;
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  const speedRaw = obj.speed !== undefined ? Number(obj.speed) : undefined;
  return {
    id: typeof obj.id === "string" ? obj.id : undefined,
    lat,
    lng,
    elevationM: obj.altitude !== undefined ? Number(obj.altitude) : undefined,
    speedKmh: speedRaw !== undefined && !Number.isNaN(speedRaw) ? knotsToKmh(speedRaw) : undefined,
    timestampRaw: obj.timestamp as string | number | undefined,
  };
}

function extractNested(obj: Record<string, unknown>): ExtractedFix | null {
  const location = obj.location as Record<string, unknown> | undefined;
  const coords = location?.coords as Record<string, unknown> | undefined;
  if (!coords || coords.latitude === undefined || coords.longitude === undefined) {
    return null;
  }
  const speedRaw = coords.speed !== undefined ? Number(coords.speed) : undefined;
  return {
    id: typeof obj.device_id === "string" ? obj.device_id : undefined,
    lat: Number(coords.latitude),
    lng: Number(coords.longitude),
    elevationM: coords.altitude !== undefined ? Number(coords.altitude) : undefined,
    speedKmh: speedRaw !== undefined && !Number.isNaN(speedRaw) ? metersPerSecondToKmh(speedRaw) : undefined,
    timestampRaw: location?.timestamp as string | number | undefined,
  };
}

function parseTimestamp(raw: string | number | undefined): string {
  if (raw === undefined || raw === null || raw === "") return new Date().toISOString();
  const num = Number(raw);
  if (!Number.isNaN(num)) {
    // Traccar sends seconds or milliseconds since epoch depending on config.
    const ms = num > 1e12 ? num : num * 1000;
    return new Date(ms).toISOString();
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function queryParamsToObject(params: URLSearchParams): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

async function extractFix(req: NextRequest): Promise<ExtractedFix | null> {
  if (req.method === "GET") {
    return extractFlat(queryParamsToObject(req.nextUrl.searchParams));
  }

  const text = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = queryParamsToObject(new URLSearchParams(text));
  }

  return extractFlat(body) ?? extractNested(body);
}

async function handleIngest(req: NextRequest) {
  const fix = await extractFix(req);

  if (!fix) {
    return NextResponse.json({ error: "could not find lat/lon in request" }, { status: 400 });
  }

  const expectedId = process.env.TRACCAR_SHARED_SECRET;
  if (expectedId && fix.id !== expectedId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!supabaseService) {
    return NextResponse.json(
      { error: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured on the server" },
      { status: 500 }
    );
  }

  const { error } = await supabaseService.from("track_points").insert({
    source: "traccar",
    lat: fix.lat,
    lng: fix.lng,
    elevation_m: fix.elevationM ?? null,
    speed_kmh: fix.speedKmh ?? null,
    recorded_at: parseTimestamp(fix.timestampRaw),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  return handleIngest(req);
}

export async function POST(req: NextRequest) {
  return handleIngest(req);
}
