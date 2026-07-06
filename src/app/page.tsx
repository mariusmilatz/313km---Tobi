import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveTracking from "@/components/LiveTracking";
import RouteOverview from "@/components/RouteOverview";
import DaysSection from "@/components/DaysSection";
import Story from "@/components/Story";
import DailyUpdates from "@/components/DailyUpdates";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";

// Without this, Next.js may statically cache the Supabase reads inside
// LiveTracking/DaysSection at build time, and the "live" data (day statuses,
// distance stats) would never update again on the server-rendered parts of
// the page. The map's own marker still polls client-side regardless, but the
// stats strip and day cards only render server-side, so this matters.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LiveTracking />
        <RouteOverview />
        <DaysSection />
        <Story />
        <DailyUpdates />
        <Sponsors />
      </main>
      <Footer />
    </>
  );
}
