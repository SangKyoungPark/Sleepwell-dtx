"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all duration-200 cursor-pointer active:scale-95",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        variant === "primary" &&
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]",
        variant === "secondary" &&
          "bg-[var(--color-surface-light)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-light)]/80",
        variant === "ghost" &&
          "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-base",
        size === "lg" && "w-full px-6 py-4 text-lg",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
