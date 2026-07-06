import { DAYS } from "@/data/days";
import DayCard from "./DayCard";
import SectionHeading from "./ui/SectionHeading";

export default function DaysSection() {
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
          {DAYS.map((day, index) => (
            <DayCard key={day.day} day={day} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
