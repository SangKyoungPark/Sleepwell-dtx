"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  label: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarRating({
  label,
  value,
  max = 5,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm text-[var(--color-muted)]">{label}</label>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "text-3xl transition-all duration-200 cursor-pointer hover:scale-110",
              star <= value
                ? "text-[var(--color-warning)]"
                : "text-[var(--color-surface-light)]",
            )}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
