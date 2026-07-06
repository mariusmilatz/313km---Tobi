import { UpdateItem } from "@/types";

// Placeholder daily-update entries so the grid has real structure to render.
// TODO: replace this static array with a live query (e.g. Supabase table
// `updates`, ordered by `timestamp desc`) once Tobi starts posting from the
// trail. Keep the UpdateItem shape the same so no component changes are needed.
export const UPDATES: UpdateItem[] = [
  {
    id: "u1",
    day: 1,
    type: "photo",
    caption: "First light leaving Aachen.",
    timestamp: "2026-08-10T05:30:00.000Z",
  },
  {
    id: "u2",
    day: 1,
    type: "video",
    caption: "Crossing into the Hautes Fagnes.",
    timestamp: "2026-08-10T10:15:00.000Z",
  },
  {
    id: "u3",
    day: 2,
    type: "photo",
    caption: "Forest trail near Monschau.",
    timestamp: "2026-08-11T07:00:00.000Z",
  },
  {
    id: "u4",
    day: 3,
    type: "photo",
    caption: "Ridge line above Blankenheim.",
    timestamp: "2026-08-12T13:45:00.000Z",
  },
  {
    id: "u5",
    day: 5,
    type: "video",
    caption: "Volcanic craters near Daun.",
    timestamp: "2026-08-14T09:20:00.000Z",
  },
  {
    id: "u6",
    day: 7,
    type: "photo",
    caption: "The Moselle comes into view.",
    timestamp: "2026-08-16T16:00:00.000Z",
  },
];
