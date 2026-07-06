"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabasePublic } from "@/lib/supabase/publicClient";
import { LiveTrackingStatus, RouteGeoJSON } from "@/types";

// OpenFreeMap: genuinely free vector tiles, no API key, no usage billing.
// "positron" is a light, minimal basemap; we invert it with a CSS filter
// below to get a calm dark map that fits the site's dark sections, without
// needing a paid dark-style provider.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// One color per day, roughly stepping through the site's accent gradient.
const DAY_COLORS = ["#5EA8FF", "#6DBBDB", "#7FDBB6", "#A6E2A0", "#CFE28E", "#F0DB8E", "#FFD98E"];

const STALE_AFTER_MS = 15 * 60 * 1000; // no new point in 15 min = show "last seen" instead of "live"

interface RouteMapProps {
  routeGeoJSON: RouteGeoJSON;
  initialLiveStatus: LiveTrackingStatus;
}

function boundsOf(coordinates: [number, number][]): [[number, number], [number, number]] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function allCoordinates(route: RouteGeoJSON): [number, number][] {
  return route.features.flatMap((feature) => feature.geometry.coordinates);
}

function relativeTimeLabel(iso: string | undefined, now: number): string {
  if (!iso) return "Not started yet";
  const diffMin = Math.round((now - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} hr ago`;
}

function createLiveMarkerElement() {
  const el = document.createElement("div");
  el.className = "relative flex h-5 w-5 items-center justify-center";
  el.innerHTML = `
    <span class="absolute inline-flex h-full w-full rounded-full bg-accent-via opacity-75 animate-pulse-ring"></span>
    <span class="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent-via border-2 border-white shadow-glass"></span>
  `;
  return el;
}

export default function RouteMap({ routeGeoJSON, initialLiveStatus }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveTrackingStatus>(initialLiveStatus);
  const [mapReady, setMapReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Initialize the map once on mount.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [6.6, 50.3],
      zoom: 8,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: routeGeoJSON as any,
      });

      // The `as any` here sidesteps maplibre-gl's strict discriminated-union
      // types for style expressions, which are easy to trip on a fully valid
      // expression array (a common pain point with this library's TS types).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 4,
          "line-color": [
            "match",
            ["get", "day"],
            1, DAY_COLORS[0],
            2, DAY_COLORS[1],
            3, DAY_COLORS[2],
            4, DAY_COLORS[3],
            5, DAY_COLORS[4],
            6, DAY_COLORS[5],
            7, DAY_COLORS[6],
            "#ffffff",
          ],
        },
      } as any);

      const coords = allCoordinates(routeGeoJSON);
      if (coords.length > 0) {
        map.fitBounds(boundsOf(coords), { padding: 48, duration: 0 });
      }

      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the live marker positioned at the latest known point.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const point = liveStatus.lastPoint;
    if (!point) return;

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ element: createLiveMarkerElement() })
        .setLngLat([point.lng, point.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([point.lng, point.lat]);
    }
  }, [liveStatus.lastPoint, mapReady]);

  // Poll Supabase for the latest fix. If env vars aren't configured yet,
  // this silently no-ops and the map just shows the static route.
  useEffect(() => {
    if (!supabasePublic) return;
    // TypeScript's null-narrowing above doesn't carry into the closure
    // below, so capture it in a local const that's provably non-null.
    const supabase = supabasePublic;

    let cancelled = false;

    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from("track_points")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled || error || !data) return;

      setLiveStatus((prev) => ({
        ...prev,
        lastPoint: {
          lat: data.lat,
          lng: data.lng,
          elevationM: data.elevation_m ?? undefined,
          speedKmh: data.speed_kmh ?? undefined,
          timestamp: data.recorded_at,
        },
        lastUpdatedIso: data.recorded_at,
        source: data.source,
      }));
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Re-render every 30s purely so the "x min ago" label keeps counting up
  // between polls, without needing a new Supabase fetch each time.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  const handleFullRoute = useCallback(() => {
    const map = mapRef.current;
    const coords = allCoordinates(routeGeoJSON);
    if (!map || coords.length === 0) return;
    map.fitBounds(boundsOf(coords), { padding: 48, duration: 800 });
  }, [routeGeoJSON]);

  const handleStage = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeDay = liveStatus.currentDay ?? 1;
    const feature = routeGeoJSON.features.find((f) => f.properties.day === activeDay);
    if (!feature) return;
    map.fitBounds(boundsOf(feature.geometry.coordinates), { padding: 64, duration: 800 });
  }, [routeGeoJSON, liveStatus.currentDay]);

  const handleTobi = useCallback(() => {
    const map = mapRef.current;
    const point = liveStatus.lastPoint;
    if (!map || !point) return;
    map.flyTo({ center: [point.lng, point.lat], zoom: 14, duration: 1000 });
  }, [liveStatus.lastPoint]);

  const isStale =
    !liveStatus.lastUpdatedIso || now - new Date(liveStatus.lastUpdatedIso).getTime() > STALE_AFTER_MS;
  const hasLivePoint = Boolean(liveStatus.lastPoint);

  return (
    <div className="relative aspect-[9/15.2] w-full overflow-hidden sm:aspect-[16/10] md:aspect-[21/9]">
      {/* Natural light "positron" basemap — no color filter, matches the
          site's light theme directly instead of faking a dark map. */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Quick zoom presets */}
      <div className="absolute left-2 top-2 flex gap-0.5 rounded-full bg-white/80 p-1 shadow-glass-light backdrop-blur-md sm:left-4 sm:top-4 sm:gap-1.5">
        <button
          type="button"
          onClick={handleFullRoute}
          className="rounded-full px-2 py-1 text-[11px] font-medium text-graphite transition-colors hover:bg-black/[0.06] sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Full Route
        </button>
        <button
          type="button"
          onClick={handleStage}
          className="rounded-full px-2 py-1 text-[11px] font-medium text-graphite transition-colors hover:bg-black/[0.06] sm:px-3 sm:py-1.5 sm:text-xs"
        >
          This Stage
        </button>
        <button
          type="button"
          onClick={handleTobi}
          disabled={!hasLivePoint}
          className="rounded-full px-2 py-1 text-[11px] font-medium text-graphite transition-colors hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Tobi
        </button>
      </div>

      {/* Status badge — top-right corner at every size. Sits above the
          map's own bottom-right attribution control, which is why this
          isn't placed at the bottom on mobile. */}
      <div className="absolute right-2 top-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-graphite shadow-glass-light backdrop-blur-md sm:right-4 sm:top-4 sm:px-4 sm:py-1.5 sm:text-xs">
        {hasLivePoint && !isStale
          ? "Live now"
          : relativeTimeLabel(liveStatus.lastUpdatedIso, now)}
      </div>
    </div>
  );
}
