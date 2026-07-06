import { getLiveTrackingStatus, getRouteGeoJSON } from "@/lib/integrations";
import SectionHeading from "./ui/SectionHeading";
import GlassCard from "./ui/GlassCard";
import RouteMapLoader from "./RouteMapLoader";

// Server Component: fetches the initial live status + route geometry once on
// the server (so the first paint already has real data), then hands both to
// the client-side map, which takes over polling Supabase for fresh points.
export default async function LiveTracking() {
  const [status, routeGeoJSON] = await Promise.all([getLiveTrackingStatus(), getRouteGeoJSON()]);

  return (
    <section id="live" className="relative bg-paper px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Live Tracking"
          title="Follow Tobi in real time"
          subtitle="One map: the full route, each day's stage, and Tobi's live position, all in the same view. Use the buttons for quick jumps, or scroll/pinch to zoom freely."
          tone="light"
        />

        <GlassCard tone="light" className="relative overflow-hidden">
          {routeGeoJSON ? (
            <RouteMapLoader routeGeoJSON={routeGeoJSON} initialLiveStatus={status} />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-terrain-light text-sm text-fog md:aspect-[21/9]">
              Route data not available yet.
            </div>
          )}

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-4xl bg-black/[0.06] md:grid-cols-4">
            {[
              { label: "Distance covered", value: status.distanceCoveredKm ? `${status.distanceCoveredKm} km` : "—" },
              { label: "Distance remaining", value: status.distanceRemainingKm ? `${status.distanceRemainingKm} km` : "—" },
              { label: "Current day", value: status.currentDay ? `Day ${status.currentDay}` : "—" },
              { label: "Last update", value: status.lastUpdatedLabel ?? "—" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-6 py-6 text-center">
                <p className="text-2xl font-semibold text-graphite">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-fog">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-fog">
          The route shown is Tobi&apos;s real planned trail. Live tracking goes active
          once he starts running.
        </p>
      </div>
    </section>
  );
}
