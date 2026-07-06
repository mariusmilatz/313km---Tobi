import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium tracking-tight transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98]";

  const styles =
    variant === "primary"
      ? "bg-accent-gradient text-ink shadow-glass"
      : "bg-black/[0.04] text-graphite border border-black/10 backdrop-blur-md hover:bg-black/[0.07]";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
