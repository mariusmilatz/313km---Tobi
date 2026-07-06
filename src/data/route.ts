import { RouteStats } from "@/types";

// Known, fixed facts about the route. This does not change once the trail
// plan is set, so it stays static rather than going through the async
// integrations layer.
//
// Figures below are the real numbers from Tobi's actual Komoot tour
// (https://www.komoot.com/tour/3023957326): 312 km, 6,760 m gain / 6,710 m
// loss (per the Komoot page), "Schwierig" (difficult) rating, highest point
// 660 m, lowest 140 m. The path geometry (src/data/route.geo.json) is built
// from his real GPX export via scripts/build-route-from-gpx.mjs.
//
// Direction: Tobi runs south to north, Trier -> Aachen (not the other way
// around) — the GPX file's own recorded point order confirms this.
export const ROUTE_STATS: RouteStats = {
  totalDistanceKm: 312,
  totalDays: 7,
  startLocation: "Trier",
  endLocation: "Aachen",
  totalElevationGainM: 6760,
};
