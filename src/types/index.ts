// Shared types for the "Tobi Runs the Eifelsteig" site.
// These shapes are designed so that swapping placeholder/static data for real
// integrations (Garmin, Komoot/GPX, Supabase, Mapbox) later only means changing
// the *source* of the data in src/lib/integrations.ts — the components and
// their props stay the same.

export type DayStatus = "upcoming" | "in-progress" | "completed";

export interface DayInfo {
  day: number;
  title: string;
  from: string;
  to: string;
  distanceKm: number;
  elevationGainM: number;
  status: DayStatus;
  date?: string; // ISO date string, optional until the schedule is locked
  // Real GPS coordinates of this stage's overnight stops, once Tobi's exact
  // start/end points are confirmed (see src/data/days.ts). Not yet
  // populated — until then, day boundaries are approximated from the
  // equal-distance route split in src/data/route.geo.json. Once these are
  // filled in, src/lib/route-progress.ts uses endPoint to know precisely
  // when a stage is actually finished, instead of just estimating.
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
}

export type UpdateMediaType = "photo" | "video";

export interface UpdateItem {
  id: string;
  day: number | null; // null for items that aren't tied to a specific day (e.g. a teaser)
  type: UpdateMediaType;
  caption: string;
  timestamp: string; // ISO string
  mediaUrl?: string; // TODO: populate once media storage (e.g. Supabase Storage) is connected
  // The fields below are only populated for updates sourced from Google
  // Drive (see src/lib/drive.ts) — static/placeholder entries leave them
  // undefined and UpdateCard falls back to the plain gradient placeholder.
  label?: string; // display label, e.g. "Day 3" or "Teaser" (derived from the filename)
  isTeaser?: boolean;
  driveFileId?: string;
  thumbnailUrl?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier?: "title" | "supporting" | "gear";
  logoUrl?: string; // TODO: replace with real logo asset URLs
  href?: string;
}

export interface RouteStats {
  totalDistanceKm: number;
  totalDays: number;
  startLocation: string;
  endLocation: string;
  totalElevationGainM: number;
}

// A single GPS fix, whatever the eventual source (Garmin LiveTrack export,
// or a phone-based tracker like Traccar Client posting to a custom endpoint).
export interface TrackPoint {
  lat: number;
  lng: number;
  elevationM?: number;
  timestamp: string;
  speedKmh?: number;
}

export interface LiveTrackingStatus {
  isLive: boolean;
  // False before the real race window (src/data/schedule.ts) has opened.
  // While false, currentDay/distance fields are meaningless and should be
  // replaced in the UI by a countdown using daysUntilStart instead.
  hasStarted: boolean;
  daysUntilStart?: number; // only meaningful while hasStarted is false
  currentDay?: number;
  lastPoint?: TrackPoint;
  // Whole-route totals.
  totalDistanceCoveredKm?: number;
  totalDistanceRemainingKm?: number;
  // Just today's stage (currentDay) — resets each day, hits 0 remaining
  // when Tobi reaches that day's real end point (once configured).
  todayDistanceCoveredKm?: number;
  todayDistanceRemainingKm?: number;
  lastUpdatedLabel?: string; // human-readable fallback for first paint, e.g. "2 min ago"
  lastUpdatedIso?: string; // raw timestamp so client components can keep the label fresh
  source?: "garmin" | "traccar"; // whichever feed produced the most recent point
}

// Minimal GeoJSON shapes, enough for rendering the route on a map. The route
// is one FeatureCollection with one LineString per day (see the `day`
// property), so the map can show the whole trail or zoom to a single stage.
export interface RouteDayFeature {
  type: "Feature";
  properties: {
    day: number;
    from: string;
    to: string;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
}

export interface RouteGeoJSON {
  type: "FeatureCollection";
  features: RouteDayFeature[];
}
