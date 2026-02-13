"use client";

import { cn } from "@/lib/utils";
import { ISI_OPTIONS } from "@/lib/constants";

interface ScoreSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {ISI_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
            "border-2 text-left",
            value === option.value
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-foreground)]"
              : "border-[var(--color-surface-light)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-muted)]",
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              value === option.value
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-light)] text-[var(--color-muted)]",
            )}
          >
            {option.value}
          </div>
          <span className="text-base">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
