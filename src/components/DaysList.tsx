"use client";

import { useEffect, useState } from "react";
import { DAYS } from "@/data/days";
import { DayInfo, DayStatus, LiveTrackingStatus } from "@/types";
import DayCard from "./DayCard";

const POLL_MS = 20000;

// Same status-derivation logic that used to live directly in DaysSection
// (Server Component) — moved here so it can re-run on every poll, not just
// once at page load. Days before the current one are "completed", the
// current one is "in-progress" only while a live point is actually fresh,
// and the rest stay "upcoming".
function deriveDays(status: LiveTrackingStatus): DayInfo[] {
  return DAYS.map((day): DayInfo => {
    if (!status.currentDay) return day;
    if (day.day < status.currentDay) return { ...day, status: "completed" as DayStatus };
    if (day.day === status.currentDay) {
      const nextStatus: DayStatus = status.isLive ? "in-progress" : "completed";
      return { ...day, status: nextStatus };
    }
    return { ...day, status: "upcoming" as DayStatus };
  });
}

export default function DaysList({ initialStatus }: { initialStatus: LiveTrackingStatus }) {
  const [days, setDays] = useState<DayInfo[]>(() => deriveDays(initialStatus));

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/live-status", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: LiveTrackingStatus = await res.json();
        if (!cancelled) setDays(deriveDays(data));
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

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {days.map((day, index) => (
        <DayCard key={day.day} day={day} index={index} />
      ))}
    </div>
  );
}
