// Converts a real Komoot GPX export into src/data/route.geo.json.
//
// Usage:
//   1. Export the GPX from Komoot (or use an updated file from Tobi).
//   2. Place it next to this script (or update GPX_PATH below).
//   3. node scripts/build-route-from-gpx.mjs
//   4. Commit the resulting src/data/route.geo.json.
//
// What this does:
//   - Parses every <trkpt> (lat/lon/ele) from the GPX.
//   - Reverses the point order if needed so the line reads Trier -> Aachen
//     (the real running direction, south to north). Komoot's raw export for
//     this tour is already recorded Trier -> Aachen, so normally no reversal
//     happens — this check just guards against a differently-ordered export.
//   - Splits the path into 7 EQUAL-DISTANCE stages (~1/7th of the total
//     each). This is a placeholder split, not Tobi's confirmed overnight
//     stops — we don't have an authoritative list of which towns he's
//     actually sleeping in each night. Nearest-known-town matching was
//     tried first but produced wildly uneven day lengths (11 km to 82 km)
//     because the approximate town coordinates don't reliably sit close to
//     the real trail. If/when the real stage plan is confirmed, replace the
//     equal-distance cut points below with distance thresholds (or
//     nearest-point-to-known-waypoint matching) that match it.
//   - Simplifies each day's line with Ramer-Douglas-Peucker (no dependency
//     needed) so the GeoJSON stays a reasonable size for the browser.
//   - Computes real per-day distance and elevation gain from the actual
//     track (positive elevation deltas), used to update src/data/days.ts.
//
// No external packages required — safe to run with plain `node`.

import { readFileSync, writeFileSync } from "node:fs";

const GPX_PATH = new URL("./313km - Tobi.gpx", import.meta.url);
const OUTPUT_PATH = new URL("../src/data/route.geo.json", import.meta.url);
const NUM_DAYS = 7;
const SIMPLIFY_TOLERANCE_DEG = 0.00025; // ~20-25m

const TOWNS = [
  { name: "Aachen", lat: 50.7753, lng: 6.0839 },
  { name: "Roetgen", lat: 50.6497, lng: 6.1936 },
  { name: "Monschau", lat: 50.5564, lng: 6.2419 },
  { name: "Hellenthal", lat: 50.4833, lng: 6.4667 },
  { name: "Blankenheim", lat: 50.4386, lng: 6.6636 },
  { name: "Stadtkyll", lat: 50.35, lng: 6.5333 },
  { name: "Jünkerath", lat: 50.3392, lng: 6.5539 },
  { name: "Daun", lat: 50.1972, lng: 6.8306 },
  { name: "Manderscheid", lat: 50.1017, lng: 6.8875 },
  { name: "Wittlich", lat: 49.9897, lng: 6.8886 },
  { name: "Trier", lat: 49.7596, lng: 6.6441 },
];

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestTownLabel(pt) {
  let best = null;
  let bestDist = Infinity;
  for (const t of TOWNS) {
    const d = haversineKm(pt, t);
    if (d < bestDist) {
      bestDist = d;
      best = t.name;
    }
  }
  return best;
}

function perpendicularDistance(pt, a, b) {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(pt.lng - a.lng, pt.lat - a.lat);
  const t = Math.max(0, Math.min(1, ((pt.lng - a.lng) * dx + (pt.lat - a.lat) * dy) / lenSq));
  const projX = a.lng + t * dx;
  const projY = a.lat + t * dy;
  return Math.hypot(pt.lng - projX, pt.lat - projY);
}

function rdp(pts, epsilon) {
  if (pts.length < 3) return pts;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(pts.slice(0, index + 1), epsilon);
    const right = rdp(pts.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [pts[0], pts[pts.length - 1]];
}

function main() {
  const xml = readFileSync(GPX_PATH, "utf8");
  const trkptRe = /<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)<\/ele>/g;
  const rawPoints = [];
  let m;
  while ((m = trkptRe.exec(xml))) {
    rawPoints.push({ lat: Number(m[1]), lng: Number(m[2]), ele: Number(m[3]) });
  }

  if (rawPoints.length === 0) {
    throw new Error("No <trkpt> elements found — check GPX_PATH and file format.");
  }

  // Detect direction: if the file starts closer to Aachen than Trier,
  // reverse it so the output always reads Trier -> Aachen (the real
  // direction Tobi runs, south to north).
  const startsNearAachen =
    haversineKm(rawPoints[0], TOWNS.find((t) => t.name === "Aachen")) <
    haversineKm(rawPoints[0], TOWNS.find((t) => t.name === "Trier"));
  const points = startsNearAachen ? rawPoints.slice().reverse() : rawPoints;

  const cumKm = [0];
  for (let i = 1; i < points.length; i++) {
    cumKm.push(cumKm[i - 1] + haversineKm(points[i - 1], points[i]));
  }
  const totalKm = cumKm[cumKm.length - 1];

  function indexAtDistance(targetKm) {
    let lo = 0;
    let hi = cumKm.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumKm[mid] < targetKm) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  const cutIndices = [0];
  for (let d = 1; d < NUM_DAYS; d++) {
    cutIndices.push(indexAtDistance((totalKm / NUM_DAYS) * d));
  }
  cutIndices.push(points.length - 1);

  const features = [];
  const daySummaries = [];

  for (let d = 0; d < NUM_DAYS; d++) {
    const segment = points.slice(cutIndices[d], cutIndices[d + 1] + 1);

    let distKm = 0;
    let gainM = 0;
    for (let i = 1; i < segment.length; i++) {
      distKm += haversineKm(segment[i - 1], segment[i]);
      const delta = segment[i].ele - segment[i - 1].ele;
      if (delta > 0) gainM += delta;
    }

    const fromLabel = nearestTownLabel(segment[0]);
    const toLabel = nearestTownLabel(segment[segment.length - 1]);
    const simplified = rdp(segment, SIMPLIFY_TOLERANCE_DEG);

    features.push({
      type: "Feature",
      properties: { day: d + 1, from: fromLabel, to: toLabel },
      geometry: {
        type: "LineString",
        coordinates: simplified.map((p) => [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))]),
      },
    });

    daySummaries.push({
      day: d + 1,
      from: fromLabel,
      to: toLabel,
      distKm: Math.round(distKm * 10) / 10,
      gainM: Math.round(gainM),
    });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify({ type: "FeatureCollection", features }, null, 2));

  console.log(`Total distance: ${totalKm.toFixed(1)} km across ${points.length} points`);
  console.table(daySummaries);
  console.log(`\nWrote ${OUTPUT_PATH.pathname}`);
  console.log(
    "Copy the distKm/gainM/from/to values above into src/data/days.ts if the split changed."
  );
}

main();
