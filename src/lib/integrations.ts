import { LiveTrackingStatus, RouteGeoJSON } from "@/types";

/**
 * INTEGRATIONS LAYER — placeholder implementations only.
 *
 * Nothing here talks to Garmin, Komoot, Supabase, or Mapbox yet. Every
 * function below returns static/mock data so the UI has something real to
 * render, but is shaped exactly like the eventual live data so wiring up a
 * real backend later is a drop-in replacement — no component changes needed.
 *
 * ---------------------------------------------------------------------------
 * LIVE TRACKING — two options to choose between later:
 *
 * Option A — Garmin LiveTrack embed
 *   Simplest to wire up: embed Tobi's Garmin LiveTrack share page in an
 *   iframe. Fast, but it's Garmin's own map/styling and can't be overlaid
 *   on our custom route map or merged with the Komoot-derived GPX line.
 *
 * Option B — Custom overlay (recommended for a fully branded map)
 *   1. Tobi's phone runs a lightweight GPS logger (e.g. the free, open
 *      source "Traccar Client" app for iOS/Android) configured to POST
 *      position pings to a custom endpoint every N seconds.
 *   2. That endpoint (a Next.js API route or a Supabase Edge Function)
 *      writes each ping into a Supabase table, e.g.:
 *        track_points(lat, lng, elevation_m, speed_kmh, recorded_at)
 *   3. getLiveTrackingStatus() below queries Supabase for the latest point
 *      (and recent history) instead of returning MOCK_LIVE_STATUS.
 *   4. The frontend can poll on an interval, or use a Supabase Realtime
 *      subscription for push updates.
 *   Tobi keeps using his Garmin watch for his own personal stats/workout
 *   recording — that's independent of this live-tracking feed.
 *
 * TODO: pick an option (or support both) and implement the real fetch here.
 * ---------------------------------------------------------------------------
 * ROUTE — Komoot decouples cleanly:
 *   Export the planned Eifelsteig tour from Komoot as a GPX file, convert it
 *   to GeoJSON (a one-time script, e.g. with `@tmcw/togeojson` or `gpx2geojson`),
 *   and store the result as a static asset (or in Supabase Storage). From
 *   that point on the route has nothing to do with Komoot anymore — it's
 *   just coordinates we own and render with our own map library (e.g.
 *   MapLibre GL or Mapbox GL).
 *
 * TODO: run the GPX -> GeoJSON conversion and return the real geometry here.
 * ---------------------------------------------------------------------------
 */

const MOCK_LIVE_STATUS: LiveTrackingStatus = {
  isLive: false,
  currentDay: undefined,
  lastPoint: undefined,
  distanceCoveredKm: undefined,
  distanceRemainingKm: undefined,
  lastUpdatedLabel: "Not started yet",
};

export async function getLiveTrackingStatus(): Promise<LiveTrackingStatus> {
  // TODO: replace with a real fetch — either a Garmin LiveTrack proxy call,
  // or a Supabase query against a `track_points` table (see notes above).
  return MOCK_LIVE_STATUS;
}

export async function getRouteGeoJSON(): Promise<RouteGeoJSON | null> {
  // TODO: return the parsed GPX-derived GeoJSON LineString once it's exported
  // from Komoot and converted. Returning null keeps the map section in its
  // "coming soon" placeholder state.
  return null;
}
