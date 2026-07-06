"use client";

import { useState } from "react";
import { UpdateItem } from "@/types";
import Reveal from "./ui/Reveal";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// Badge text: real Drive uploads carry a `label` ("Day 3" / "Teaser" /
// whatever unrecognized bracket text was used) parsed from the filename;
// static placeholder entries (src/data/updates.ts) just have a plain
// `day` number, so fall back to "Day N" for those.
function badgeText(update: UpdateItem) {
  if (update.label) return update.label;
  if (update.day != null) return `Day ${update.day}`;
  return null;
}

export default function UpdateCard({
  update,
  index,
  className = "",
}: {
  update: UpdateItem;
  index: number;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const badge = badgeText(update);
  const canEmbed = Boolean(update.driveFileId);

  return (
    <Reveal delay={index * 60} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-4xl border border-black/5 bg-white shadow-glass-light">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-graphite/10 via-graphite/[0.04] to-transparent">
          {isPlaying && canEmbed ? (
            // Loaded only once clicked, on purpose — Drive can rate-limit
            // if too many embeds try to stream at once, so we don't mount
            // every iframe on page load.
            <iframe
              src={`https://drive.google.com/file/d/${update.driveFileId}/preview`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay"
              allowFullScreen
            />
          ) : (
            <>
              {update.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Drive-hosted thumbnail, not a local/optimizable asset
                <img
                  src={update.thumbnailUrl}
                  alt={update.caption}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                // TODO: replace with a real placeholder image once available.
                <div className="absolute inset-0" aria-hidden />
              )}

              {update.type === "video" && (
                <button
                  type="button"
                  onClick={() => canEmbed && setIsPlaying(true)}
                  disabled={!canEmbed}
                  aria-label={`Play: ${update.caption}`}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-glass-light transition-transform hover:scale-105 disabled:cursor-not-allowed"
                >
                  <div className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-graphite" />
                </button>
              )}

              {badge && (
                <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-graphite">
                  {badge}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm leading-relaxed text-graphite">{update.caption}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-fog">
            {formatTimestamp(update.timestamp)}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
