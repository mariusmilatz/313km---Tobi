import { RouteStats } from "@/types";

// Known, fixed facts about the route. This does not change once the trail
// plan is set, so it stays static rather than going through the async
// integrations layer.
export const ROUTE_STATS: RouteStats = {
  totalDistanceKm: 313,
  totalDays: 7,
  startLocation: "Aachen",
  endLocation: "Trier",
  totalElevationGainM: 7200,
};
