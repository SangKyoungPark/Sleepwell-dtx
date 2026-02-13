"use client";

import { cn } from "@/lib/utils";
import type { MorningMood } from "@/types";

interface MoodSelectorProps {
  label: string;
  value: MorningMood | null;
  onChange: (value: MorningMood) => void;
  className?: string;
}

const MOODS: { key: MorningMood; emoji: string; label: string }[] = [
  { key: "terrible", emoji: "😫", label: "최악" },
  { key: "bad", emoji: "😕", label: "나쁨" },
  { key: "neutral", emoji: "😐", label: "보통" },
  { key: "good", emoji: "🙂", label: "좋음" },
  { key: "great", emoji: "😊", label: "최고" },
];

export function MoodSelector({
  label,
  value,
  onChange,
  className,
}: MoodSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm text-[var(--color-muted)]">{label}</label>
      <div className="flex gap-2 justify-center">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            type="button"
            onClick={() => onChange(mood.key)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 cursor-pointer",
              value === mood.key
                ? "bg-[var(--color-primary)]/15 scale-110"
                : "hover:bg-[var(--color-surface-light)]",
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span
              className={cn(
                "text-xs",
                value === mood.key
                  ? "text-[var(--color-foreground)] font-medium"
                  : "text-[var(--color-muted)]",
              )}
            >
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
