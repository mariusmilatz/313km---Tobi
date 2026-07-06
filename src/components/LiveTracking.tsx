import { getLiveTrackingStatus, getRouteGeoJSON } from "@/lib/integrations";
import SectionHeading from "./ui/SectionHeading";
import GlassCard from "./ui/GlassCard";
import RouteMapLoader from "./RouteMapLoader";
import LiveStatsStrip from "./LiveStatsStrip";

// Server Component: fetches the initial live status + route geometry once on
// the server (so the first paint already has real data), then hands both to
// the client-side map, which takes over polling Supabase for fresh points.
export default async function LiveTracking() {
  const [status, routeGeoJSON] = await Promise.all([getLiveTrackingStatus(), getRouteGeoJSON()]);

  return (
    <section id="live" className="relative bg-paper px-6 py-16 md:px-10 md:py-24">
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
            <div className="flex aspect-[9/15.2] w-full items-center justify-center bg-terrain-light text-sm text-fog sm:aspect-[16/10] md:aspect-[21/9]">
              Route data not available yet.
            </div>
          )}

          {/* Stats strip — client component, polls /api/live-status every
              20s so the numbers actually move while someone's watching,
              instead of only updating on a page reload. */}
          <LiveStatsStrip initialStatus={status} />
        </GlassCard>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-fog">
          The route shown is Tobi&apos;s real planned trail. Live tracking goes active
          once he starts running.
        </p>
      </div>
    </section>
  );
}
