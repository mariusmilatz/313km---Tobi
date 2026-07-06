"use client";

import dynamic from "next/dynamic";
import { LiveTrackingStatus, RouteGeoJSON } from "@/types";

// maplibre-gl touches browser-only APIs, so it must never be rendered on the
// server. `ssr: false` is only allowed inside a Client Component boundary
// (this file), which is why RouteMap itself is loaded through here rather
// than being imported directly by the Server Component that uses it.
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[9/16] w-full animate-pulse items-center justify-center bg-terrain-light text-sm text-fog sm:aspect-[16/10] md:aspect-[21/9]">
      Loading map…
    </div>
  ),
});

interface RouteMapLoaderProps {
  routeGeoJSON: RouteGeoJSON;
  initialLiveStatus: LiveTrackingStatus;
}

export default function RouteMapLoader(props: RouteMapLoaderProps) {
  return <RouteMap {...props} />;
}
