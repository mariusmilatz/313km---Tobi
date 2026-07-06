# Tobi Runs the Eifelsteig

Apple-style cinematic landing page for the Round Circle Films documentary
"Tobi Runs the Eifelsteig" — 313 km, 7 days, Aachen → Trier.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. No external
services are connected yet — Garmin, Komoot, Supabase, and Mapbox are all
stubbed out behind placeholder components and a single integrations layer,
so wiring up real data later doesn't require touching the UI.

## Project structure

```
src/
  app/                Root layout + the single page (page.tsx)
  components/         One component per section (Hero, LiveTracking, etc.)
  components/ui/      Reusable primitives (Button, GlassCard, SectionHeading, Reveal, PulseDot)
  data/                Static content (days, updates, sponsors, route stats)
  lib/integrations.ts  Placeholder data-fetching functions — this is the
                        one file to touch when connecting real services
  types/               Shared TypeScript types used across data + components
```

## Where the future integrations plug in

Everything live/dynamic goes through `src/lib/integrations.ts`:

- `getLiveTrackingStatus()` — currently returns static "not started" mock
  data. Two documented options for later: embed Garmin's LiveTrack iframe
  directly (simplest, but it's Garmin's own map), or have Tobi's phone run a
  free GPS logger (e.g. Traccar Client) that posts to a small endpoint,
  storing points in Supabase, so the live dot renders on our own map. See
  the comments in that file for the full breakdown.
- `getRouteGeoJSON()` — currently returns `null`. Export the planned route
  from Komoot as GPX, convert it to GeoJSON, and return it here. From that
  point the route has nothing to do with Komoot anymore — it's just
  coordinates rendered with our own map library (MapLibre GL or Mapbox GL).

Route facts that don't change (313 km, 7 days, Aachen → Trier) live in
`src/data/route.ts` as static data, not through the integrations layer.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Getting this onto GitHub

This project was built and committed locally but not pushed automatically —
run these from a terminal on your own machine (inside the `tobi-runs-eifelsteig`
folder), or use GitHub Desktop and point it at this folder:

```bash
git remote -v   # should already show origin -> your GitHub repo
git push -u origin main
```

If `git push` asks for credentials, use a GitHub personal access token as the
password (GitHub no longer accepts account passwords for git operations).

## Deploying to Vercel (free, no credits needed)

1. Go to vercel.com → **Add New Project**.
2. Import the `313km---Tobi` GitHub repo.
3. Framework preset: Next.js (auto-detected). No environment variables are
   needed yet.
4. Deploy. Every future push to `main` redeploys automatically — no need to
   use Vercel's CLI or dashboard build credits.

## TODO before going live

- [ ] Replace the hero background placeholder with a real video/photo.
- [ ] Decide on the live-tracking approach (Garmin iframe vs. custom phone
      tracker + Supabase overlay) and implement `getLiveTrackingStatus()`.
- [ ] Export the Eifelsteig route from Komoot as GPX, convert to GeoJSON,
      and implement `getRouteGeoJSON()`; add a real map (MapLibre/Mapbox GL).
- [ ] Swap sponsor placeholders for real logos once partnerships are confirmed.
- [ ] Replace daily-update placeholders with real photos/video as they come in.
