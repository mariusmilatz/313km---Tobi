import { DayInfo } from "@/types";

// Seven stages across the Eifelsteig, Aachen -> Trier, ~311.5 km total.
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
// day matches Tobi's actual overnight stops instead of a even 1/7th split.
//
// All days start as "upcoming" — statuses will flip to "in-progress" /
// "completed" automatically once live tracking data is wired in.
export const DAYS: DayInfo[] = [
  {
    day: 1,
    title: "Into the Hautes Fagnes",
    from: "Aachen",
    to: "Monschau",
    distanceKm: 44.5,
    elevationGainM: 908,
    status: "upcoming",
  },
  {
    day: 2,
    title: "Border Forests",
    from: "Monschau",
    to: "Hellenthal",
    distanceKm: 44.6,
    elevationGainM: 1174,
    status: "upcoming",
  },
  {
    day: 3,
    title: "Ridge Lines",
    from: "Hellenthal",
    to: "Blankenheim",
    distanceKm: 44.5,
    elevationGainM: 687,
    status: "upcoming",
  },
  {
    day: 4,
    title: "Volcanic Eifel",
    from: "Blankenheim",
    to: "Daun",
    distanceKm: 44.4,
    elevationGainM: 704,
    status: "upcoming",
  },
  {
    day: 5,
    title: "Maar Country",
    from: "Daun",
    to: "Manderscheid",
    distanceKm: 44.5,
    elevationGainM: 1035,
    status: "upcoming",
  },
  {
    day: 6,
    title: "Vineyard Approach",
    from: "Manderscheid",
    to: "Wittlich",
    distanceKm: 44.5,
    elevationGainM: 657,
    status: "upcoming",
  },
  {
    day: 7,
    title: "Down to the Moselle",
    from: "Wittlich",
    to: "Trier",
    distanceKm: 44.5,
    elevationGainM: 906,
    status: "upcoming",
  },
];
