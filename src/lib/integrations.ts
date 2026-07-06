import { LiveTrackingStatus, RouteGeoJSON, TrackPoint, UpdateItem } from "@/types";
import { supabasePublic } from "./supabase/publicClient";
import { computeDayProgress } from "./route-progress";
import { getDriveUpdates } from "./drive";
import { calendarDayNumber, daysUntilStart as computeDaysUntilStart } from "@/data/schedule";
import { DAYS } from "@/data/days";
import routeGeoJSON from "@/data/route.geo.json";
import { UPDATES } from "@/data/updates";

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
 * "CURRENT DAY" — anchored to the real calendar (src/data/schedule.ts), not
 * pure GPS proximity. Before RACE_START_DATE, there's no meaningful "day" at
 * all (hasStarted: false, use daysUntilStart for a countdown) — this avoids
 * a stray/test GPS point snapping to whichever day segment is geometrically
 * closest and showing something like "Day 7" before the run has even
 * started. Once the race window opens, the calendar-expected day both
 * restricts which day-segments are considered for GPS matching and anchors
 * the boundary hysteresis in route-progress.ts, so a slight overshoot past a
 * stage's end doesn't cause the displayed day to flicker forward and back.
 * This assumes Tobi runs close to one stage per calendar day — if he ever
 * runs noticeably ahead of or behind that schedule, the window may need
 * adjusting. Once real per-day start/end coordinates are added to
 * src/data/days.ts, day transitions can be driven by actually reaching that
 * point instead of leaning on the calendar as much.
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

interface LatestPoint {
  point: TrackPoint;
  source: "garmin" | "traccar";
  minutesAgo: number;
}

async function fetchLatestPoint(): Promise<LatestPoint | null> {
  if (!supabasePublic) return null;

  const { data, error } = await supabasePublic
    .from("track_points")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const point: TrackPoint = {
    lat: data.lat as number,
    lng: data.lng as number,
    elevationM: (data.elevation_m as number | null) ?? undefined,
    speedKmh: (data.speed_kmh as number | null) ?? undefined,
    timestamp: data.recorded_at as string,
  };
  const minutesAgo = Math.round((Date.now() - new Date(point.timestamp).getTime()) / 60000);

  return { point, source: data.source as "garmin" | "traccar", minutesAgo };
}

function updateLabel(minutesAgo: number | undefined): string {
  if (minutesAgo === undefined) return "Not started yet";
  if (minutesAgo < 1) return "Just now";
  return `${minutesAgo} min ago`;
}

export async function getLiveTrackingStatus(): Promise<LiveTrackingStatus> {
  const expectedDay = calendarDayNumber();

  if (expectedDay === null) {
    // Pre-race: still surface a genuinely fresh signal if one exists (handy
    // while testing the tracking pipeline before race day), but never turn
    // it into a day number or distance stat — those only mean something
    // once the real race window has opened.
    const latest = await fetchLatestPoint();
    return {
      isLive: latest ? latest.minutesAgo < 15 : false,
      hasStarted: false,
      daysUntilStart: computeDaysUntilStart(),
      lastPoint: latest?.point,
      lastUpdatedLabel: updateLabel(latest?.minutesAgo),
      lastUpdatedIso: latest?.point.timestamp,
      source: latest?.source,
    };
  }

  const latest = await fetchLatestPoint();

  if (!latest) {
    // Race window is open but no point has ever landed (Supabase not
    // configured, or genuinely no pings yet) — still show the
    // calendar-expected day rather than nothing.
    return {
      isLive: false,
      hasStarted: true,
      currentDay: expectedDay,
      lastUpdatedLabel: "Not started yet",
    };
  }

  const allowedDays = [expectedDay - 1, expectedDay, expectedDay + 1].filter(
    (d) => d >= 1 && d <= 7
  );

  const progress = computeDayProgress(latest.point, routeGeoJSON as unknown as RouteGeoJSON, DAYS, {
    allowedDays,
    anchorDay: expectedDay,
  });

  return {
    isLive: latest.minutesAgo < 15,
    hasStarted: true,
    currentDay: progress.currentDay,
    lastPoint: latest.point,
    totalDistanceCoveredKm: progress.totalDistanceCoveredKm,
    totalDistanceRemainingKm: progress.totalDistanceRemainingKm,
    todayDistanceCoveredKm: progress.todayDistanceCoveredKm,
    todayDistanceRemainingKm: progress.todayDistanceRemainingKm,
    lastUpdatedLabel: updateLabel(latest.minutesAgo),
    lastUpdatedIso: latest.point.timestamp,
    source: latest.source,
  };
}

export async function getRouteGeoJSON(): Promise<RouteGeoJSON | null> {
  // TODO: swap this static import for the real Komoot-derived route once
  // it exists (see notes above).
  return routeGeoJSON as unknown as RouteGeoJSON;
}

/**
 * DAILY UPDATES — pulled from the shared Google Drive folder (see
 * src/lib/drive.ts) once GOOGLE_DRIVE_API_KEY is configured; Marius labels
 * each upload with "(Day N)" or "(Teaser)" at the end of the filename and it
 * shows up here automatically, already sorted and labeled. Falls back to the
 * static src/data/updates.ts placeholders if Drive isn't configured yet, or
 * the folder is temporarily empty/unreachable, so the section never breaks.
 */
export async function getDailyUpdates(): Promise<UpdateItem[]> {
  const driveItems = await getDriveUpdates();
  return driveItems.length > 0 ? driveItems : UPDATES;
}
