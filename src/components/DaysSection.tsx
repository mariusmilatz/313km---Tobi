import { getLiveTrackingStatus } from "@/lib/integrations";
import SectionHeading from "./ui/SectionHeading";
import DaysList from "./DaysList";

// Server Component: fetches the initial live status once on the server (for
// a correct first paint), then hands off to DaysList (Client Component),
// which polls /api/live-status on the same 20s interval as the map and the
// stats strip, so each day's badge flips from upcoming -> in-progress ->
// completed live, without needing a page reload.
export default async function DaysSection() {
  const status = await getLiveTrackingStatus();

  return (
    <section id="days" className="bg-paper px-6 pb-16 md:px-10 md:pb-24">
      <div className="mx-auto max-w-content">
        <SectionHeading
          eyebrow="Seven Days"
          title="Stage by stage"
          subtitle="Each day's status updates automatically once live tracking goes active."
          tone="light"
        />

        <DaysList initialStatus={status} />
      </div>
    </section>
  );
}
