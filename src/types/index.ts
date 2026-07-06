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
}

export type UpdateMediaType = "photo" | "video";

export interface UpdateItem {
  id: string;
  day: number;
  type: UpdateMediaType;
  caption: string;
  timestamp: string; // ISO string
  mediaUrl?: string; // TODO: populate once media storage (e.g. Supabase Storage) is connected
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
  currentDay?: number;
  lastPoint?: TrackPoint;
  distanceCoveredKm?: number;
  distanceRemainingKm?: number;
  lastUpdatedLabel?: string; // human-readable, e.g. "2 min ago"
}

// Minimal GeoJSON LineString shape, enough for rendering a static route on a map.
export interface RouteGeoJSON {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
}
