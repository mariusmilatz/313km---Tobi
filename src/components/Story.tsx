import Reveal from "./ui/Reveal";

export default function Story() {
  return (
    <section id="story" className="relative bg-paper px-6 py-28 md:px-10 md:py-40">
      <div
        className="pointer-events-none absolute inset-0 bg-hero-glow opacity-70"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-fog">
            The Story
          </span>
        </Reveal>

        <Reveal delay={100}>
          <p className="mt-8 text-3xl font-medium leading-snug tracking-tight text-graphite md:text-4xl">
            This isn&apos;t about a finish line. It&apos;s about what a body and a mind
            find out about each other over seven days, alone on a trail.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-fog">
            Tobi is running the Eifelsteig self-supported — 313 kilometers of forest,
            ridgeline, and volcanic landscape between Aachen and Trier. No support crew,
            no shortcuts. Just the trail, the weather, and whatever&apos;s left in the tank
            by day seven. Round Circle Films is following the whole thing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
