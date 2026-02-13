"use client";

import { cn } from "@/lib/utils";

interface NumberSelectorProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  className?: string;
}

export function NumberSelector({
  label,
  value,
  options,
  onChange,
  className,
}: NumberSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm text-[var(--color-muted)]">{label}</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 py-3 rounded-xl text-center font-medium transition-all duration-200 cursor-pointer",
              value === opt
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface)] border-2 border-[var(--color-surface-light)] text-[var(--color-muted)] hover:border-[var(--color-muted)]",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
