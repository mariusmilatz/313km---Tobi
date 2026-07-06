import { UpdateItem } from "@/types";

// Placeholder daily-update entries so the grid has real structure to render.
// TODO: replace this static array with a live query (e.g. Supabase table
// `updates`, ordered by `timestamp desc`) once Tobi starts posting from the
// trail. Keep the UpdateItem shape the same so no component changes are needed.
//
// Captions are geography-matched to the real Trier -> Aachen day order in
// src/data/days.ts (day 1 = Trier -> Wittlich ... day 7 = Monschau -> Aachen).
export const UPDATES: UpdateItem[] = [
  {
    id: "u1",
    day: 1,
    type: "photo",
    caption: "First light leaving Trier, the Moselle behind him.",
    timestamp: "2026-08-10T05:30:00.000Z",
  },
  {
    id: "u2",
    day: 2,
    type: "video",
    caption: "Vineyard terraces above Wittlich.",
    timestamp: "2026-08-11T10:15:00.000Z",
  },
  {
    id: "u3",
    day: 3,
    type: "photo",
    caption: "Volcanic craters near Daun.",
    timestamp: "2026-08-12T07:00:00.000Z",
  },
  {
    id: "u4",
    day: 4,
    type: "photo",
    caption: "Deep into the volcanic Eifel toward Blankenheim.",
    timestamp: "2026-08-13T13:45:00.000Z",
  },
  {
    id: "u5",
    day: 5,
    type: "video",
    caption: "Ridge line above Blankenheim.",
    timestamp: "2026-08-14T09:20:00.000Z",
  },
  {
    id: "u6",
    day: 6,
    type: "photo",
    caption: "Forest trail near Monschau.",
    timestamp: "2026-08-15T16:00:00.000Z",
  },
  {
    id: "u7",
    day: 7,
    type: "photo",
    caption: "Crossing into the Hautes Fagnes, Aachen ahead.",
    timestamp: "2026-08-16T11:30:00.000Z",
  },
];
