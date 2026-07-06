import { LiveTrackingStatus, RouteGeoJSON } from "@/types";
import { supabasePublic } from "./supabase/publicClient";
import { computeProgressFromPoint } from "./route-progress";
import routeGeoJSON from "@/data/route.geo.json";

/**
 * INTEGRATIONS LAYER.
 *
 * This is the one file that talks to the outside world. Everything else
 * (components, data files) is written against the types in src/types, so
 * swapping a data source here never requires touching the UI.
 *
 * ---------------------------------------------------------------------------
 * LIVE TRACKING — currently reads from Supabase's `track_points` table.
 * Two feeds write into that same table (see README for setup steps):
 *
 *   1. Garmin LiveTrack — a scheduled Supabase Edge Function polls Tobi's
 *      LiveTrack session (reverse-engineered public JSON endpoint behind his
 *      share link, no official $5k Garmin API needed) every ~20-30s and
 *      inserts rows with source = 'garmin'.
 *   2. Traccar Client (phone app, free/open source) — posts directly to
 *      /api/ingest/traccar, which inserts rows with source = 'traccar'.
 *
 * Whichever source has the most recent `recorded_at` wins — this function
 * always just reads the single latest row, so a stale Garmin feed
 * automatically gets superseded by a fresher Traccar point and vice versa.
 * No special "switch feeds" logic needed.
 *
 * Garmin's watch has no cellular/satellite radio of its own — LiveTrack
 * always relays through the paired phone's Bluetooth + data connection, so
 * gaps are expected wherever phone signal drops (e.g. forest valleys).
 * ---------------------------------------------------------------------------
 * ROUTE — src/data/route.geo.json is now built from Tobi's real Komoot GPX
 * export (see scripts/build-route-from-gpx.mjs), so the line itself is the
 * actual trail, not a guess. The one thing that's still approximate: the
 * 7-day split is an EQUAL-DISTANCE split (~44.5 km/day), not Tobi's confirmed
 * overnight stops — we don't have an authoritative list of which towns he's
 * actually sleeping in each night. TODO: once that's confirmed, adjust the
 * cut points in the build script and re-run it; nothing else needs to
 * change — the map, stage-zoom buttons, and progress math all key off the
 * `day` property on each feature, not off any particular geometry.
 * ---------------------------------------------------------------------------
 */

export async function getLiveTrackingStatus(): Promise<LiveTrackingStatus> {
  if (!supabasePublic) {
    // NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY aren't set
    // yet (e.g. local dev before .env.local is configured). Fail soft.
    return { isLive: false, lastUpdatedLabel: "Tracking not configured yet" };
  }

  const { data, error } = await supabasePublic
    .from("track_points")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { isLive: false, lastUpdatedLabel: "Not started yet" };
  }

  const point = {
    lat: data.lat as number,
    lng: data.lng as number,
    elevationM: (data.elevation_m as number | null) ?? undefined,
    speedKmh: (data.speed_kmh as number | null) ?? undefined,
    timestamp: data.recorded_at as string,
  };

  const progress = computeProgressFromPoint(point, routeGeoJSON as unknown as RouteGeoJSON);
  const minutesAgo = Math.round((Date.now() - new Date(point.timestamp).getTime()) / 60000);

  return {
    isLive: minutesAgo < 15,
    currentDay: progress.currentDay,
    lastPoint: point,
    distanceCoveredKm: progress.distanceCoveredKm,
    distanceRemainingKm: progress.distanceRemainingKm,
    lastUpdatedLabel: minutesAgo < 1 ? "Just now" : `${minutesAgo} min ago`,
    lastUpdatedIso: point.timestamp,
    source: data.source as "garmin" | "traccar",
  };
}

export async function getRouteGeoJSON(): Promise<RouteGeoJSON | null> {
  // TODO: swap this static import for the real Komoot-derived route once
  // it exists (see notes above).
  return routeGeoJSON as unknown as RouteGeoJSON;
}
