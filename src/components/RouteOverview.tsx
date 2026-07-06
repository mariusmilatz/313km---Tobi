import { ROUTE_STATS } from "@/data/route";
import { getRouteGeoJSON } from "@/lib/integrations";
import SectionHeading from "./ui/SectionHeading";
import GlassCard from "./ui/GlassCard";

export default async function RouteOverview() {
  // TODO: once getRouteGeoJSON() returns real geometry (see integrations.ts),
  // render it with MapLibre/Mapbox GL here instead of the static placeholder below.
  const routeGeoJSON = await getRouteGeoJSON();

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
          subtitle="The full Eifelsteig, broken into seven running days through forest, ridgeline, and volcanic maar country."
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

        {/* Route map placeholder */}
        <GlassCard tone="light" className="mt-10 overflow-hidden">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-4xl bg-gradient-to-br from-graphite/5 via-graphite/[0.02] to-transparent md:aspect-[21/9]">
            <svg viewBox="0 0 400 160" className="h-2/3 w-2/3 opacity-40" aria-hidden>
              <path
                d="M10,130 C60,100 90,140 130,90 C160,50 200,80 230,40 C260,10 320,40 390,20"
                fill="none"
                stroke="currentColor"
                className="text-graphite"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={routeGeoJSON ? "0" : "6 8"}
              />
            </svg>
            <span className="absolute bottom-6 rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium text-fog shadow-glass-light">
              Interactive route map coming soon
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
