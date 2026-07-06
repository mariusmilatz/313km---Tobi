import { RouteStats } from "@/types";

// Known, fixed facts about the route. This does not change once the trail
// plan is set, so it stays static rather than going through the async
// integrations layer.
//
// Figures below are the real numbers from Tobi's actual Komoot tour
// (https://www.komoot.com/tour/3023957326), read directly off the tour page:
// 312 km, 6,760 m gain / 6,710 m loss, "Schwierig" (difficult) rating,
// highest point 660 m, lowest 140 m. The path geometry itself (the actual
// line on the map, in src/data/route.geo.json) is still the approximate
// placeholder — Komoot gates the GPX download behind sign-in + Premium, so
// that swap needs Tobi (or whoever has account access) to hit "Download" on
// that page and send the .gpx file. See README for the conversion step.
export const ROUTE_STATS: RouteStats = {
  totalDistanceKm: 312,
  totalDays: 7,
  startLocation: "Aachen",
  endLocation: "Trier",
  totalElevationGainM: 6760,
};
