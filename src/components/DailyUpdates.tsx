import { getDailyUpdates } from "@/lib/integrations";
import { INSTAGRAM_URL } from "@/data/social";
import UpdateCard from "./UpdateCard";
import Reveal from "./ui/Reveal";
import InstagramIcon from "./ui/InstagramIcon";

// Horizontal, swipe/scroll slider (not a grid) — snap-scroll with native
// touch/trackpad gestures, no carousel library needed. Also links out to
// Instagram so people can follow Tobi's day-to-day stories in real time,
// not just the recap here.
//
// Server Component: content comes from getDailyUpdates(), which reads
// straight from Marius's shared Google Drive folder once configured (see
// src/lib/drive.ts) and falls back to the static src/data/updates.ts
// placeholders otherwise.
export default async function DailyUpdates() {
  const updates = await getDailyUpdates();

  return (
    <section id="updates" className="bg-paper px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 flex flex-col items-center gap-6 text-center md:mb-16 md:flex-row md:items-end md:justify-between md:text-left">
          <Reveal>
            <div className="flex max-w-2xl flex-col items-center gap-4 md:items-start">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-via">
                Daily Updates
              </span>
              <h2 className="text-4xl font-semibold tracking-tight text-graphite md:text-5xl">
                From the trail
              </h2>
              <p className="text-lg leading-relaxed text-fog">
                Photos and clips posted as each day wraps up. Swipe or scroll to see more.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            {/* TODO: point this at Tobi's / Round Circle Films' real
                Instagram handle once confirmed — see src/data/social.ts */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-5 py-3 text-sm font-medium text-graphite backdrop-blur-md transition-colors hover:bg-black/[0.07]"
            >
              <InstagramIcon />
              Follow on Instagram
            </a>
          </Reveal>
        </div>

        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10">
          {updates.map((update, index) => (
            <UpdateCard
              key={update.id}
              update={update}
              index={index}
              className="w-[78vw] max-w-[340px] flex-none snap-start sm:w-[320px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
