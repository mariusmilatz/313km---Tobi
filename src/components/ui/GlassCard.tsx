import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}

export default function GlassCard({ children, tone = "dark", className = "" }: GlassCardProps) {
  const styles =
    tone === "dark"
      ? "bg-white/[0.05] border border-white/10 shadow-glass backdrop-blur-xl"
      : "bg-white/70 border border-black/5 shadow-glass-light backdrop-blur-xl";

  return <div className={`rounded-4xl ${styles} ${className}`}>{children}</div>;
}
