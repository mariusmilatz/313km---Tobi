import { UPDATES } from "@/data/updates";
import UpdateCard from "./UpdateCard";
import SectionHeading from "./ui/SectionHeading";

export default function DailyUpdates() {
  return (
    <section id="updates" className="bg-paper px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Daily Updates"
          title="From the trail"
          subtitle="Photos and clips posted as each day wraps up."
          tone="light"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {UPDATES.map((update, index) => (
            <UpdateCard key={update.id} update={update} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
