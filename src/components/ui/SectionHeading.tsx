import { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string | ReactNode;
  align?: "center" | "left";
  tone?: "dark" | "light";
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  const titleColor = tone === "dark" ? "text-mist" : "text-graphite";
  const subtitleColor = "text-fog";

  return (
    <Reveal>
      <div className={`flex flex-col ${alignClass} max-w-2xl mb-16 md:mb-20 gap-4`}>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-via">
            {eyebrow}
          </span>
        )}
        <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight ${titleColor}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-lg leading-relaxed ${subtitleColor}`}>{subtitle}</p>
        )}
      </div>
    </Reveal>
  );
}
