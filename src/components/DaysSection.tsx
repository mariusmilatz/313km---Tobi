import { DAYS } from "@/data/days";
import { getLiveTrackingStatus } from "@/lib/integrations";
import { DayInfo, DayStatus } from "@/types";
import DayCard from "./DayCard";
import SectionHeading from "./ui/SectionHeading";

// Server Component: derives each day's status from the same live tracking
// data the map uses, so this list and the map never disagree about where
// Tobi is. Days before the current one are "completed", the current one is
// "in-progress" (only while a live point is actually fresh), and the rest
// stay "upcoming" — the static status field in src/data/days.ts is just the
// pre-race fallback for when no tracking data exists yet.
export default async function DaysSection() {
  const status = await getLiveTrackingStatus();

  const days: DayInfo[] = DAYS.map((day): DayInfo => {
    if (!status.currentDay) return day;
    if (day.day < status.currentDay) return { ...day, status: "completed" as DayStatus };
    if (day.day === status.currentDay) {
      const nextStatus: DayStatus = status.isLive ? "in-progress" : "completed";
      return { ...day, status: nextStatus };
    }
    return { ...day, status: "upcoming" as DayStatus };
  });

  return (
    <section id="days" className="bg-paper px-6 pb-28 md:px-10 md:pb-36">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Seven Days"
          title="Stage by stage"
          subtitle="Each day's status updates automatically once live tracking goes active."
          tone="light"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day, index) => (
            <DayCard key={day.day} day={day} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
