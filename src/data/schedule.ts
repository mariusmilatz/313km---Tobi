// Real-world calendar schedule for the run — used as the primary anchor for
// "which day is it," instead of relying purely on GPS nearest-point
// matching. Nearest-point matching alone can misfire (e.g. a stray test
// ping far from the trail snapping to whichever day segment happens to be
// geometrically closest, even on a day that isn't race day at all) — the
// calendar gives a sane, always-available fallback and a window to keep
// position-based matching honest.
//
// TODO: confirm this is still the real start date closer to race day.
export const RACE_START_DATE = "2026-08-16"; // Day 1: Trier -> Wittlich
export const RACE_TOTAL_DAYS = 7;

function utcDayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
}

function daysSinceStart(now: Date): number {
  const start = new Date(`${RACE_START_DATE}T00:00:00Z`);
  return utcDayNumber(now) - utcDayNumber(start);
}

// Which day (1-7) "today" corresponds to if the run is exactly on schedule
// (one stage per calendar day, no rest days). Returns null before the race
// starts. Clamps to day 7 if it's run long or the calendar has moved past
// the planned finish, rather than returning null (keeps showing "Day 7"
// instead of reverting to a countdown).
export function calendarDayNumber(now: Date = new Date()): number | null {
  const diff = daysSinceStart(now);
  if (diff < 0) return null;
  return Math.min(diff + 1, RACE_TOTAL_DAYS);
}

// Days remaining until race start (0 on/after start day).
export function daysUntilStart(now: Date = new Date()): number {
  return Math.max(0, -daysSinceStart(now));
}
