import { SPONSORS } from "@/data/sponsors";
import SectionHeading from "./ui/SectionHeading";
import Reveal from "./ui/Reveal";

export default function Sponsors() {
  return (
    <section id="sponsors" className="bg-paper px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Supported By"
          title="Partners on the trail"
          tone="light"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {SPONSORS.map((sponsor, index) => (
            <Reveal key={sponsor.id} delay={index * 50}>
              {/* TODO: replace with real logo images once partnerships are confirmed */}
              <div className="flex aspect-[3/2] items-center justify-center rounded-3xl border border-black/[0.06] bg-black/[0.02] px-4 text-center transition-colors hover:bg-black/[0.05]">
                <span className="text-xs font-medium text-fog">{sponsor.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
