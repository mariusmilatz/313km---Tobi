import { DayInfo } from "@/types";

// Seven stages across the Eifelsteig, Trier -> Aachen (south to north),
// ~311.5 km total.
//
// distanceKm and elevationGainM are computed directly from Tobi's real
// Komoot GPX export (see src/data/route.geo.json and
// scripts/build-route-from-gpx.mjs) — these are real numbers, not guesses.
//
// The day-by-day split itself is an EQUAL-DISTANCE split of the real path
// (~44.5 km/day), not Tobi's confirmed overnight stops — we don't have an
// authoritative list of which towns he's actually sleeping in each night.
// The from/to town names are just the nearest known town to each cut point,
// for a readable label. TODO: once the real stage plan is confirmed, adjust
// the cut points in scripts/build-route-from-gpx.mjs (and re-run it) so each
// day matches Tobi's actual overnight stops instead of an even 1/7th split.
//
// All days start as "upcoming" — statuses will flip to "in-progress" /
// "completed" automatically once live tracking data is wired in.
//
// TODO: once Tobi's real overnight-stop coordinates are confirmed, add them
// per day as `endPoint: { lat, lng }` (and optionally `startPoint`) — see
// the DayInfo type in src/types/index.ts. src/lib/route-progress.ts already
// checks for endPoint and will use it as a precise "stage complete" signal
// the moment it's populated; no other code changes needed.
export const DAYS: DayInfo[] = [
  {
    day: 1,
    title: "Up from the Moselle",
    from: "Trier",
    to: "Wittlich",
    distanceKm: 44.5,
    elevationGainM: 919,
    status: "upcoming",
  },
  {
    day: 2,
    title: "Vineyard Country",
    from: "Wittlich",
    to: "Manderscheid",
    distanceKm: 44.5,
    elevationGainM: 807,
    status: "upcoming",
  },
  {
    day: 3,
    title: "Maar Country",
    from: "Manderscheid",
    to: "Daun",
    distanceKm: 44.5,
    elevationGainM: 1120,
    status: "upcoming",
  },
  {
    day: 4,
    title: "Volcanic Eifel",
    from: "Daun",
    to: "Blankenheim",
    distanceKm: 44.5,
    elevationGainM: 704,
    status: "upcoming",
  },
  {
    day: 5,
    title: "Ridge Lines",
    from: "Blankenheim",
    to: "Hellenthal",
    distanceKm: 44.5,
    elevationGainM: 700,
    status: "upcoming",
  },
  {
    day: 6,
    title: "Border Forests",
    from: "Hellenthal",
    to: "Monschau",
    distanceKm: 44.5,
    elevationGainM: 1131,
    status: "upcoming",
  },
  {
    day: 7,
    title: "Into the Hautes Fagnes",
    from: "Monschau",
    to: "Aachen",
    distanceKm: 44.5,
    elevationGainM: 743,
    status: "upcoming",
  },
];
