import { DayInfo } from "@/types";
import GlassCard from "./ui/GlassCard";
import Reveal from "./ui/Reveal";

const STATUS_LABEL: Record<DayInfo["status"], string> = {
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
};

const STATUS_PROGRESS: Record<DayInfo["status"], number> = {
  upcoming: 0,
  "in-progress": 55,
  completed: 100,
};

export default function DayCard({ day, index }: { day: DayInfo; index: number }) {
  const progress = STATUS_PROGRESS[day.status];

  return (
    <Reveal delay={index * 60}>
      <GlassCard tone="light" className="flex h-full flex-col justify-between p-7">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">
              Day {day.day}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                day.status === "completed"
                  ? "bg-accent-via/20 text-graphite"
                  : day.status === "in-progress"
                  ? "bg-accent-from/20 text-graphite"
                  : "bg-graphite/5 text-fog"
              }`}
            >
              {STATUS_LABEL[day.status]}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-semibold tracking-tight text-graphite">
            {day.title}
          </h3>
          <p className="mt-1 text-sm text-fog">
            {day.from} → {day.to}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline justify-between text-sm text-graphite">
            <span className="font-medium">{day.distanceKm} km</span>
            <span className="text-fog">{day.elevationGainM} m gain</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite/10">
            <div
              className="h-full rounded-full bg-accent-gradient transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </GlassCard>
    </Reveal>
  );
}
