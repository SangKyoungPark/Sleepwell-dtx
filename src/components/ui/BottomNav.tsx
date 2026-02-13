"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/diary", icon: "📝", label: "일지" },
  { href: "/mission", icon: "🎯", label: "미션" },
  { href: "/home", icon: "🏠", label: "홈" },
  { href: "/relax", icon: "🧘", label: "이완" },
  { href: "/report", icon: "📊", label: "리포트" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-surface-light)]">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors",
                isActive
                  ? "text-[var(--color-primary-light)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={cn("text-xs", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
