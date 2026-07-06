import Button from "./ui/Button";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper">
      {/*
        TODO: replace this gradient placeholder with a real cinematic background —
        either a muted looping <video> of the Eifelsteig trail, or a full-bleed
        still. Keep the light overlay so the title stays readable against it.
      */}
      <div className="absolute inset-0 bg-terrain-light" aria-hidden />
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-transparent"
        aria-hidden
      />

      {/* faint contour-line texture to suggest topography without being literal */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="contours" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1d1d1f" strokeWidth="1" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="#1d1d1f" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contours)" />
      </svg>

      <div className="relative z-10 mx-auto flex max-w-content flex-col items-center px-6 text-center">
        <span className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-fog">
          A Round Circle Films Documentary
        </span>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-graphite md:text-7xl">
          Tobi Runs the Eifelsteig
        </h1>
        <p className="mt-6 max-w-xl text-lg text-fog md:text-xl">
          313 km. 7 days. One trail across the Eifel.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href="#live" variant="primary">
            Track Live
          </Button>
          <Button href="#route" variant="secondary">
            View Route
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-fog">
        <div className="h-9 w-[1px] bg-gradient-to-b from-fog/60 to-transparent" />
      </div>
    </section>
  );
}
