// SUPERSEDED — kept only for reference/history.
//
// This was the original placeholder route generator, used before Tobi's
// real Komoot GPX export was available. src/data/route.geo.json is now
// built from his actual GPX via scripts/build-route-from-gpx.mjs instead —
// use that script, not this one.
//
// (Original doc comment below, for context on how the old placeholder worked.)
//
// One-off generator for an APPROXIMATE placeholder route line, used only
// until the real Komoot GPX export for the Eifelsteig is available.
// Produces a GeoJSON FeatureCollection with one LineString per day, each
// carrying a `day` property so the map can filter/zoom to a single stage.
//
// Waypoint coordinates are approximate town locations, not the real trail.

import { writeFileSync } from "node:fs";

const WAYPOINTS = [
  { name: "Aachen", lat: 50.7753, lng: 6.0839 },
  { name: "Monschau", lat: 50.5564, lng: 6.2419 },
  { name: "Hellenthal", lat: 50.4833, lng: 6.4667 },
  { name: "Blankenheim", lat: 50.4386, lng: 6.6636 },
  { name: "Stadtkyll", lat: 50.35, lng: 6.5333 },
  { name: "Daun", lat: 50.1972, lng: 6.8306 },
  { name: "Manderscheid", lat: 50.1017, lng: 6.8875 },
  { name: "Trier", lat: 49.7596, lng: 6.6441 },
];

const POINTS_PER_DAY = 24;

function interpolateDay(from, to, dayIndex) {
  const coords = [];
  // perpendicular unit vector for a gentle wiggle, so the line doesn't look
  // like a ruler-straight placeholder
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;

  for (let i = 0; i <= POINTS_PER_DAY; i++) {
    const t = i / POINTS_PER_DAY;
    const baseLng = from.lng + dx * t;
    const baseLat = from.lat + dy * t;
    // two overlapping sine waves so consecutive days don't look identical
    const wiggle =
      Math.sin(t * Math.PI * 3 + dayIndex) * 0.012 +
      Math.sin(t * Math.PI * 7 + dayIndex * 2) * 0.004;
    const wiggleDamp = Math.sin(t * Math.PI); // 0 at both ends, so segments join cleanly
    coords.push([
      Number((baseLng + perpX * wiggle * wiggleDamp).toFixed(6)),
      Number((baseLat + perpY * wiggle * wiggleDamp).toFixed(6)),
    ]);
  }
  return coords;
}

const features = [];
for (let i = 0; i < WAYPOINTS.length - 1; i++) {
  const from = WAYPOINTS[i];
  const to = WAYPOINTS[i + 1];
  features.push({
    type: "Feature",
    properties: {
      day: i + 1,
      from: from.name,
      to: to.name,
    },
    geometry: {
      type: "LineString",
      coordinates: interpolateDay(from, to, i),
    },
  });
}

const geojson = {
  type: "FeatureCollection",
  features,
};

writeFileSync("/tmp/routegen/route.geo.json", JSON.stringify(geojson, null, 2));
console.log("wrote", features.length, "day segments");
