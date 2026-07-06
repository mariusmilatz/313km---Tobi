import * as turf from "@turf/turf";
import { DayInfo, RouteGeoJSON, TrackPoint } from "@/types";

export interface DayProgress {
  currentDay: number;
  totalDistanceCoveredKm: number;
  totalDistanceRemainingKm: number;
  todayDistanceCoveredKm: number;
  todayDistanceRemainingKm: number;
}

// A slight overshoot past a day's end (or a slightly-early ping into the
// next day) shouldn't immediately flip which day is displayed — require the
// point to be unambiguously further into the next day's segment before
// accepting the flip. Keeps the "current day" from flickering right at a
// stage boundary.
const BOUNDARY_HYSTERESIS_KM = 0.3;

// Once Tobi's real overnight-stop coordinates are set on a day (see
// DayInfo.endPoint in src/data/days.ts), being within this distance of that
// exact point counts as "arrived" — a more literal signal than the
// segment-geometry estimate, which is only ever an approximation of the
// real trail.
const ENDPOINT_ARRIVAL_THRESHOLD_KM = 0.15;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Snaps a raw GPS fix onto the route line to figure out which day's stage
// Tobi is on, and both his progress through that single stage ("today") and
// through the whole route ("total").
//
// `anchorDay` (typically the calendar-expected day from src/data/schedule.ts)
// does two jobs: it restricts which day-segments are even considered (so an
// off-route or stray point can't snap to a geometrically-nearby day that
// isn't plausible given the actual calendar date — see the "Day 7" bug from
// a test ping in Cologne), and it anchors the boundary hysteresis above.
export function computeDayProgress(
  point: TrackPoint,
  route: RouteGeoJSON,
  days: DayInfo[],
  options: { allowedDays?: number[]; anchorDay?: number } = {}
): DayProgress {
  const pt = turf.point([point.lng, point.lat]);
  const { allowedDays, anchorDay } = options;

  const lines = route.features.map((feature) => {
    const line = turf.lineString(feature.geometry.coordinates);
    return {
      day: feature.properties.day,
      line,
      lengthKm: turf.length(line, { units: "kilometers" }),
    };
  });

  const totalRouteKm = lines.reduce((sum, l) => sum + l.lengthKm, 0);
  const cumulativeBeforeDay = (day: number) =>
    lines.filter((l) => l.day < day).reduce((sum, l) => sum + l.lengthKm, 0);

  const candidates = allowedDays ? lines.filter((l) => allowedDays.includes(l.day)) : [];
  const pool = candidates.length > 0 ? candidates : lines;

  let best = pool[0];
  let bestDistanceToLine = Infinity;
  let bestLocationKm = 0;

  for (const candidate of pool) {
    const nearest = turf.nearestPointOnLine(candidate.line, pt, { units: "kilometers" });
    const distanceToLine = nearest.properties?.dist ?? Infinity;
    if (distanceToLine < bestDistanceToLine) {
      bestDistanceToLine = distanceToLine;
      best = candidate;
      bestLocationKm = nearest.properties?.location ?? 0;
    }
  }

  let currentDay = best.day;
  let todayDistanceCoveredKm = bestLocationKm;
  let todayDistanceRemainingKm = Math.max(0, best.lengthKm - bestLocationKm);

  if (anchorDay && currentDay > anchorDay && todayDistanceCoveredKm < BOUNDARY_HYSTERESIS_KM) {
    const anchorLine = lines.find((l) => l.day === anchorDay);
    if (anchorLine) {
      currentDay = anchorDay;
      todayDistanceCoveredKm = anchorLine.lengthKm;
      todayDistanceRemainingKm = 0;
    }
  }

  // Real end-point override, once configured for this day: arriving within
  // ENDPOINT_ARRIVAL_THRESHOLD_KM of the actual overnight stop always counts
  // as "today's stage is done," regardless of what the line-geometry
  // estimate says.
  const dayInfo = days.find((d) => d.day === currentDay);
  if (dayInfo?.endPoint && haversineKm(point, dayInfo.endPoint) < ENDPOINT_ARRIVAL_THRESHOLD_KM) {
    todayDistanceRemainingKm = 0;
  }

  const totalDistanceCoveredKm = cumulativeBeforeDay(currentDay) + todayDistanceCoveredKm;

  return {
    currentDay,
    totalDistanceCoveredKm: Math.round(totalDistanceCoveredKm * 10) / 10,
    totalDistanceRemainingKm: Math.round((totalRouteKm - totalDistanceCoveredKm) * 10) / 10,
    todayDistanceCoveredKm: Math.round(todayDistanceCoveredKm * 10) / 10,
    todayDistanceRemainingKm: Math.round(todayDistanceRemainingKm * 10) / 10,
  };
}
