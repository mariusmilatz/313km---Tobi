import * as turf from "@turf/turf";
import { RouteGeoJSON, TrackPoint } from "@/types";

export interface RouteProgress {
  currentDay: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
}

// Snaps a raw GPS fix onto the route line to figure out which day's stage
// Tobi is on and how far into the total distance that puts him. Recomputes
// the total from whatever route geometry is currently loaded (placeholder or
// real GPX-derived line) rather than trusting a hardcoded constant to stay
// in sync.
export function computeProgressFromPoint(
  point: TrackPoint,
  route: RouteGeoJSON
): RouteProgress {
  const pt = turf.point([point.lng, point.lat]);

  let bestDay = route.features[0]?.properties.day ?? 1;
  let bestDistanceToLine = Infinity;
  let cumulativeBeforeBestDay = 0;
  let cumulativeWithinBestDay = 0;
  let runningTotalKm = 0;

  for (const feature of route.features) {
    const line = turf.lineString(feature.geometry.coordinates);
    const lengthKm = turf.length(line, { units: "kilometers" });
    const nearest = turf.nearestPointOnLine(line, pt, { units: "kilometers" });
    const distanceToLine = nearest.properties?.dist ?? Infinity;

    if (distanceToLine < bestDistanceToLine) {
      bestDistanceToLine = distanceToLine;
      bestDay = feature.properties.day;
      cumulativeBeforeBestDay = runningTotalKm;
      cumulativeWithinBestDay = nearest.properties?.location ?? 0;
    }

    runningTotalKm += lengthKm;
  }

  const distanceCoveredKm = cumulativeBeforeBestDay + cumulativeWithinBestDay;

  return {
    currentDay: bestDay,
    distanceCoveredKm: Math.round(distanceCoveredKm * 10) / 10,
    distanceRemainingKm: Math.round((runningTotalKm - distanceCoveredKm) * 10) / 10,
  };
}
