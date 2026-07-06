import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveTracking from "@/components/LiveTracking";
import RouteOverview from "@/components/RouteOverview";
import DaysSection from "@/components/DaysSection";
import Story from "@/components/Story";
import DailyUpdates from "@/components/DailyUpdates";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";

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
