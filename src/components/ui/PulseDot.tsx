interface PulseDotProps {
  active?: boolean;
  className?: string;
}

// Small live-indicator dot with a soft expanding ring when active.
export default function PulseDot({ active = false, className = "" }: PulseDotProps) {
  return (
    <span className={`relative inline-flex h-2.5 w-2.5 ${className}`}>
      {active && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent-via animate-pulse-ring" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          active ? "bg-accent-via" : "bg-fog"
        }`}
      />
    </span>
  );
}
