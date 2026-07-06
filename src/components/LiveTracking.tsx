import { getLiveTrackingStatus } from "@/lib/integrations";
import SectionHeading from "./ui/SectionHeading";
import GlassCard from "./ui/GlassCard";
import PulseDot from "./ui/PulseDot";

// Server Component: awaits getLiveTrackingStatus(), which today returns
// static mock data (see src/lib/integrations.ts) but will later be swapped
// for a real Garmin LiveTrack read or a Supabase query — no props change.
export default async function LiveTracking() {
  const status = await getLiveTrackingStatus();

  return (
    <section id="live" className="relative bg-ink px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Live Tracking"
          title="Follow Tobi in real time"
          subtitle="Once Tobi sets off, his position will update here — overlaid on the route below, not on a third-party map."
          tone="dark"
        />

        <GlassCard tone="dark" className="relative overflow-hidden">
          {/* Map placeholder */}
          <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
            <div className="absolute inset-0 bg-terrain" aria-hidden />
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.12]"
              aria-hidden
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="live-contours" width="140" height="140" patternUnits="userSpaceOnUse">
                  <path
                    d="M0,70 C35,40 105,100 140,70"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#live-contours)" />
            </svg>

            {/* TODO: swap this placeholder marker for a real map (MapLibre/Mapbox GL)
                rendering the GPX-derived route line plus a live position marker
                sourced from getLiveTrackingStatus(). */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PulseDot active={status.isLive} className="scale-[2.4]" />
            </div>

            <div className="absolute right-6 top-6 rounded-full bg-black/30 px-4 py-1.5 text-xs font-medium text-mist backdrop-blur-md">
              {status.isLive ? "Live now" : "Not started yet"}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-4xl bg-white/10 md:grid-cols-4">
            {[
              { label: "Distance covered", value: status.distanceCoveredKm ? `${status.distanceCoveredKm} km` : "—" },
              { label: "Distance remaining", value: status.distanceRemainingKm ? `${status.distanceRemainingKm} km` : "—" },
              { label: "Current day", value: status.currentDay ? `Day ${status.currentDay}` : "—" },
              { label: "Last update", value: status.lastUpdatedLabel ?? "—" },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-soft px-6 py-6 text-center">
                <p className="text-2xl font-semibold text-mist">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-fog">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-fog">
          Live tracking will go active once Tobi starts running. Check back on race day.
        </p>
      </div>
    </section>
  );
}
