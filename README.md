# Tobi Runs the Eifelsteig

Apple-style cinematic landing page for the Round Circle Films documentary
"Tobi Runs the Eifelsteig" — 313 km, 7 days, Aachen → Trier.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. Live tracking
and the route map are wired up to a real Supabase backend; sponsors, daily
update photos/video, and the hero background are still placeholders (see
TODOs below).

## Project structure

```
src/
  app/                      Root layout + page + /api/ingest/traccar route
  components/               One component per section (Hero, LiveTracking, etc.)
  components/RouteMap.tsx    The map itself (MapLibre GL, client-only)
  components/RouteMapLoader.tsx  Dynamically loads RouteMap with ssr:false
  components/ui/            Reusable primitives (Button, GlassCard, SectionHeading, Reveal, PulseDot)
  data/                     Static content (days, updates, sponsors, route stats)
  data/route.geo.json        Route geometry — currently an APPROXIMATE PLACEHOLDER
  lib/integrations.ts        The one file that talks to Supabase — swap data
                              sources here, components never change
  lib/route-progress.ts      Snaps a live GPS point onto the route to figure
                              out which day/how far along Tobi is
  lib/supabase/publicClient.ts   Anon-key client (safe in the browser, read-only)
  lib/supabase/serviceClient.ts  Service-role client (server-only, used for writes)
  types/                     Shared TypeScript types
scripts/
  generate-placeholder-route.mjs  Regenerates route.geo.json — see below
supabase/
  functions/poll-garmin-livetrack/  Edge Function that polls Garmin (see below)
```

## How live tracking actually works

Two feeds write into one Supabase table (`track_points`); the map and the
"Seven Days" section both just read whichever row has the most recent
timestamp, so a stale feed is automatically superseded by a fresher one —
there's no manual "switch source" step.

**1. Garmin LiveTrack (primary).** Tobi's Garmin Instinct 2 Solar has no
cellular/satellite radio of its own — LiveTrack always relays through his
paired phone's Bluetooth + data connection. Garmin's official developer API
costs a one-time $5,000 production fee, so instead a Supabase Edge Function
(`supabase/functions/poll-garmin-livetrack`) polls the same public JSON
endpoint a browser hits when you open a Garmin LiveTrack share link. It's
unofficial and could break if Garmin changes something internally — that's
what the second feed is for.

**2. Traccar Client (backup).** Tobi's phone also runs
[Traccar Client](https://www.traccar.org/client/) (free, open source, iOS +
Android), configured to post directly to `/api/ingest/traccar`. If the
Garmin feed goes stale, the map quietly uses this feed instead.

**Each day, before Tobi starts running:**

1. Start a new Garmin LiveTrack session on his watch/Garmin Connect app and
   grab the share link. It looks like:
   `https://livetrack.garmin.com/session/<SESSION_ID>/token/<TOKEN>`
2. Update the config row in Supabase (SQL Editor, or `execute_sql` via the
   Supabase MCP) with that day's session ID and token:
   ```sql
   update garmin_livetrack_config
   set session_id = '<SESSION_ID>', token = '<TOKEN>', is_active = true, updated_at = now()
   where id = true;
   ```
3. That's it — the cron job (already scheduled, runs every 20s) picks it up
   automatically.

**At the end of the day:** when Tobi ends the LiveTrack session on his watch,
Garmin marks it "Expired". The polling function detects this on its next run
and automatically flips `is_active` back to `false` — polling stops, and the
map simply keeps showing his last known point (frozen) until tomorrow's
session is configured. No manual "pause" step needed.

## Setting up Traccar Client (the backup feed)

1. Install "Traccar Client" from the App Store / Play Store.
2. Server URL: `https://<your-vercel-domain>/api/ingest/traccar`
3. Device Identifier: whatever you set `TRACCAR_SHARED_SECRET` to in your
   environment variables (see below) — this is what stops random internet
   traffic from injecting fake positions.
4. Set the reporting frequency (e.g. every 30s) and start the service before
   Tobi sets off each day.

Note: Traccar's wire format has changed across app versions, and the exact
JSON shape it POSTs couldn't be verified end-to-end from this environment.
`/api/ingest/traccar` tries the two known shapes (flat query-style fields,
and a nested `location.coords` shape) — if pings aren't showing up once
Tobi's app is actually sending them, check the request in Vercel's function
logs and adjust `src/app/api/ingest/traccar/route.ts` accordingly.

## Environment variables

Copy `.env.local.example` to `.env.local` for local dev, and add the same
keys in Vercel (Project Settings → Environment Variables):

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Already filled in `.env.local.example` | Yes (safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Already filled in `.env.local.example` | Yes (safe — read-only via RLS) |
| `SUPABASE_URL` | Same as above | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` secret | **No — never expose this** |
| `TRACCAR_SHARED_SECRET` | Make up any random string | No |

The Supabase project (`tobi-runs-eifelsteig`, region eu-central-1) and the
`track_points` / `garmin_livetrack_config` tables already exist — you only
need to fill in the service role key and pick a Traccar secret.

## The route is currently a placeholder

`src/data/route.geo.json` is generated by `scripts/generate-placeholder-route.mjs`
from approximate town coordinates (Aachen, Monschau, Hellenthal, Blankenheim,
Stadtkyll, Daun, Manderscheid, Trier) with a gentle wiggle added so it doesn't
look like a ruler-straight line — it is **not** Tobi's real trail.

Once the real Komoot GPX export is available:

1. Export the planned Eifelsteig tour from Komoot as GPX.
2. Convert it to the same shape `route.geo.json` already uses — one
   `LineString` Feature per day, each with a `day` property (1–7). A GPX
   parsing library like `@tmcw/togeojson` plus `@turf/turf`'s `lineSlice` /
   `nearestPointOnLine` (cutting the line at the point nearest each stage's
   town) will do this cleanly.
3. Replace `src/data/route.geo.json` with the result. Nothing else changes —
   the map, the zoom-preset buttons, and the day/progress calculations in
   `src/lib/route-progress.ts` all key off the `day` property, not off any
   specific geometry.

## The map

`src/components/RouteMap.tsx` — one MapLibre GL map (no API key, no billing:
tiles come from [OpenFreeMap](https://openfreemap.org)), rendering the static
route (colored per day) and the live position marker together. Three buttons
give quick jumps — **Full Route** and **This Stage** call `fitBounds()`,
**Tobi** calls `flyTo()` centered on his last known point — but normal
scroll/pinch zooming always still works on top of that; the buttons don't
disable it.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Without `.env.local` configured, the site
still runs — the map just shows the static route with no live marker, and
the live stats show "Tracking not configured yet".

## Getting this onto GitHub

```bash
git remote -v   # should already show origin -> your GitHub repo
git push -u origin main
```

If `git push` asks for credentials, use a GitHub personal access token as the
password (GitHub no longer accepts account passwords for git operations).

## Deploying to Vercel (free, no credits needed)

1. Go to vercel.com → **Add New Project**.
2. Import the `313km---Tobi` GitHub repo.
3. **Framework Preset must be set to "Next.js"** (not "Other") — this
   determines the correct output directory automatically.
4. Add the environment variables listed above.
5. Deploy. Every future push to `main` redeploys automatically.

## TODO before going live

- [ ] Replace the hero background placeholder with a real video/photo.
- [ ] Export the real Eifelsteig route from Komoot and replace
      `src/data/route.geo.json` (see above).
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` and `TRACCAR_SHARED_SECRET` in Vercel.
- [ ] Install and configure Traccar Client on Tobi's phone.
- [ ] Verify `/api/ingest/traccar`'s parsing once real pings come in from
      Tobi's phone (see note above about Traccar's wire format).
- [ ] Each morning of the run: start Tobi's Garmin LiveTrack session and
      update `garmin_livetrack_config` with that day's session ID/token.
- [ ] Swap sponsor placeholders for real logos once partnerships are confirmed.
- [ ] Replace daily-update placeholders with real photos/video as they come in.
