"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[var(--color-muted)]">
          {current} / {total}
        </span>
        <span className="text-sm text-[var(--color-muted)]">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
