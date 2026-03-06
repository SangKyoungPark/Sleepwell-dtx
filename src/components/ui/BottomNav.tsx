"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** SVG 아이콘 컴포넌트 - 일관된 스트로크 스타일 */
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#818cf8" : "#64748b";
  const strokeWidth = active ? 2 : 1.5;

  const icons: Record<string, React.ReactNode> = {
    diary: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    mission: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill={active ? "#818cf8" : "none"} />
      </svg>
    ),
    home: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    relax: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" fill={active ? "rgba(129,140,248,0.2)" : "none"} />
        <circle cx="18" cy="16" r="3" fill={active ? "rgba(129,140,248,0.2)" : "none"} />
      </svg>
    ),
    coach: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <circle cx="9" cy="10" r="1" fill={stroke} />
        <circle cx="12" cy="10" r="1" fill={stroke} />
        <circle cx="15" cy="10" r="1" fill={stroke} />
      </svg>
    ),
    report: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    achievements: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}

const NAV_ITEMS = [
  { href: "/diary", iconName: "diary", label: "일지" },
  { href: "/mission", iconName: "mission", label: "미션" },
  { href: "/home", iconName: "home", label: "홈" },
  { href: "/relax", iconName: "relax", label: "이완" },
  { href: "/coach", iconName: "coach", label: "코치" },
  { href: "/achievements", iconName: "achievements", label: "업적" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(20,25,39,0.85)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center pt-2 pb-1.5 gap-1 transition-all duration-200 relative",
                "active:scale-90 active:opacity-70",
                isActive
                  ? "text-[var(--color-primary-light)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* 활성 탭 상단 인디케이터 */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full animate-nav-indicator"
                  style={{
                    width: 24,
                    background: "linear-gradient(90deg, #818cf8, #a78bfa)",
                    boxShadow: "0 0 8px rgba(129,140,248,0.5)",
                  }}
                />
              )}

              {/* 아이콘 영역 */}
              <span
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive && "animate-icon-glow",
                )}
                style={isActive ? {
                  "--glow-color": "rgba(129,140,248,0.5)",
                  background: "rgba(99,102,241,0.1)",
                } as React.CSSProperties : undefined}
              >
                <NavIcon name={item.iconName} active={isActive} />
              </span>

              {/* 라벨 */}
              <span
                className={cn(
                  "text-[10px] leading-none transition-all duration-200",
                  isActive ? "font-semibold text-[var(--color-primary-light)]" : "text-[var(--color-muted)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
