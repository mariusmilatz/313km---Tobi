import { UpdateItem } from "@/types";
import Reveal from "./ui/Reveal";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
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
  return (
    <Reveal delay={index * 60} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-4xl border border-black/5 bg-white shadow-glass-light">
        {/* TODO: replace with an actual <Image>/<video> once update.mediaUrl
            is populated from real media storage. */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-graphite/10 via-graphite/[0.04] to-transparent">
          {update.type === "video" && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-glass-light transition-transform group-hover:scale-105">
              <div className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-graphite" />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-graphite">
            Day {update.day}
          </span>
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
