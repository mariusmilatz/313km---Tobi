"use client";

import { useEffect, useState } from "react";
import { LiveTrackingStatus } from "@/types";

const POLL_MS = 20000;

function currentDayLabel(status: LiveTrackingStatus): string {
  if (!status.hasStarted) {
    const days = status.daysUntilStart ?? 0;
    if (days <= 0) return "Starts today";
    if (days === 1) return "1 day until start";
    return `${days} days until start`;
  }
  return status.currentDay ? `Day ${status.currentDay}` : "—";
}

function km(value: number | undefined): string {
  return value !== undefined ? `${value} km` : "—";
}

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

  // Today's stage progress first (what changes minute to minute while
  // watching), then the whole-route totals and last-update timestamp.
  const stats = [
    { label: "Today's distance covered", value: km(status.todayDistanceCoveredKm) },
    { label: "Today's distance remaining", value: km(status.todayDistanceRemainingKm) },
    { label: "Current day", value: currentDayLabel(status) },
    { label: "Total distance covered", value: km(status.totalDistanceCoveredKm) },
    { label: "Total distance remaining", value: km(status.totalDistanceRemainingKm) },
    { label: "Last update", value: status.lastUpdatedLabel ?? "—" },
  ];

  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-b-4xl bg-black/[0.06] md:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white px-2 py-3 text-center md:px-3 md:py-4">
          <p className="text-base font-semibold text-graphite md:text-lg">{stat.value}</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-wide text-fog md:text-[10px]">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
