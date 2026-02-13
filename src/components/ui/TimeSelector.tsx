"use client";

import { cn } from "@/lib/utils";

interface TimeSelectorProps {
  label: string;
  value: string; // HH:mm
  onChange: (value: string) => void;
  className?: string;
}

export function TimeSelector({
  label,
  value,
  onChange,
  className,
}: TimeSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm text-[var(--color-muted)]">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border-2 border-[var(--color-surface-light)] text-[var(--color-foreground)] text-lg text-center focus:outline-none focus:border-[var(--color-primary)] transition-colors [color-scheme:dark]"
      />
    </div>
  );
}
