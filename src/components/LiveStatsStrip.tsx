"use client";

import { useEffect, useState } from "react";
import { LiveTrackingStatus } from "@/types";

const POLL_MS = 20000;

// Client Component so the numbers keep moving while someone's watching the
// page, instead of only updating on a full reload. Starts from the
// server-rendered value for a correct first paint, then polls
// /api/live-status on the same interval the map uses for its marker.
export default function LiveStatsStrip({ initialStatus }: { initialStatus: LiveTrackingStatus }) {
  const [status, setStatus] = useState<LiveTrackingStatus>(initialStatus);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/live-status", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: LiveTrackingStatus = await res.json();
        if (!cancelled) setStatus(data);
      } catch {
        // Network hiccup — just try again on the next tick.
      }
    };

    const interval = setInterval(fetchStatus, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const stats = [
    { label: "Distance covered", value: status.distanceCoveredKm ? `${status.distanceCoveredKm} km` : "—" },
    { label: "Distance remaining", value: status.distanceRemainingKm ? `${status.distanceRemainingKm} km` : "—" },
    { label: "Current day", value: status.currentDay ? `Day ${status.currentDay}` : "—" },
    { label: "Last update", value: status.lastUpdatedLabel ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-4xl bg-black/[0.06] md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white px-6 py-6 text-center">
          <p className="text-2xl font-semibold text-graphite">{stat.value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-fog">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
