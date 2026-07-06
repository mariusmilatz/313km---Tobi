import { DayInfo } from "@/types";

// Seven stages across the Eifelsteig, Aachen -> Trier, 313 km total.
// All days start as "upcoming" — statuses will flip to "in-progress" /
// "completed" automatically once live tracking data is wired in.
// TODO: once the live tracking source (see src/lib/integrations.ts) is
// connected, derive `status` and `date` from real data instead of this list.
export const DAYS: DayInfo[] = [
  {
    day: 1,
    title: "Into the Hautes Fagnes",
    from: "Aachen",
    to: "Monschau",
    distanceKm: 46,
    elevationGainM: 980,
    status: "upcoming",
  },
  {
    day: 2,
    title: "Border Forests",
    from: "Monschau",
    to: "Hellenthal",
    distanceKm: 42,
    elevationGainM: 890,
    status: "upcoming",
  },
  {
    day: 3,
    title: "Ridge Lines",
    from: "Hellenthal",
    to: "Blankenheim",
    distanceKm: 45,
    elevationGainM: 1050,
    status: "upcoming",
  },
  {
    day: 4,
    title: "The Quiet Middle",
    from: "Blankenheim",
    to: "Stadtkyll",
    distanceKm: 40,
    elevationGainM: 870,
    status: "upcoming",
  },
  {
    day: 5,
    title: "Volcanic Eifel",
    from: "Stadtkyll",
    to: "Daun",
    distanceKm: 48,
    elevationGainM: 1120,
    status: "upcoming",
  },
  {
    day: 6,
    title: "Maar Country",
    from: "Daun",
    to: "Manderscheid",
    distanceKm: 44,
    elevationGainM: 960,
    status: "upcoming",
  },
  {
    day: 7,
    title: "Down to the Moselle",
    from: "Manderscheid",
    to: "Trier",
    distanceKm: 48,
    elevationGainM: 1330,
    status: "upcoming",
  },
];
