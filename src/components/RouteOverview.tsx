import { ROUTE_STATS } from "@/data/route";
import SectionHeading from "./ui/SectionHeading";
import GlassCard from "./ui/GlassCard";

// The interactive map lives once, in the Live Tracking section above this
// one — full route, per-day stages, and Tobi's live position all in a single
// map. This section intentionally stays map-free and just surfaces the
// headline stats, so there's never a second, separate map to reconcile.
export default function RouteOverview() {
  const stats = [
    { label: "Total distance", value: `${ROUTE_STATS.totalDistanceKm} km` },
    { label: "Days on trail", value: `${ROUTE_STATS.totalDays}` },
    { label: "Route", value: `${ROUTE_STATS.startLocation} → ${ROUTE_STATS.endLocation}` },
    { label: "Elevation gain", value: `${ROUTE_STATS.totalElevationGainM.toLocaleString()} m` },
  ];

  return (
    <section id="route" className="bg-paper px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="The Route"
          title="Aachen to Trier, on foot"
          subtitle="The full Eifelsteig, broken into seven running days through forest, ridgeline, and volcanic maar country. See the interactive map in the Live Tracking section above."
          tone="light"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} tone="light" className="px-6 py-8 text-center">
              <p className="text-3xl font-semibold text-graphite md:text-4xl">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-fog">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
