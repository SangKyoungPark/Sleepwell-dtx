"use client";

import { cn } from "@/lib/utils";
import {
  type BadgeDefinition,
  type UnlockedBadge,
  BADGE_RARITY_CONFIG,
  BADGE_CATEGORY_CONFIG,
} from "@/lib/badges";

interface BadgeCardProps {
  badge: BadgeDefinition;
  unlocked?: UnlockedBadge;
  isNew?: boolean;
  size?: "sm" | "md";
}

export function BadgeCard({ badge, unlocked, isNew, size = "md" }: BadgeCardProps) {
  const rarity = BADGE_RARITY_CONFIG[badge.rarity];
  const category = BADGE_CATEGORY_CONFIG[badge.category];
  const isLocked = !unlocked;

  return (
    <div
      className={cn(
        "rounded-2xl relative overflow-hidden transition-all duration-300",
        size === "sm" ? "p-3" : "p-4",
        isLocked && "opacity-40 grayscale",
        isNew && "animate-scale-in",
      )}
      style={{
        background: isLocked
          ? "linear-gradient(135deg, rgba(20,25,39,0.8), rgba(30,36,56,0.6))"
          : `linear-gradient(135deg, ${category.bg}, rgba(20,25,39,0.95))`,
        border: isLocked
          ? "1px solid rgba(255,255,255,0.05)"
          : `1px solid ${rarity.border}`,
        boxShadow: isNew ? `0 0 20px ${rarity.glow}` : "none",
      }}
    >
      {/* 등급 글로우 */}
      {!isLocked && (
        <div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${rarity.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className={cn("relative flex", size === "sm" ? "flex-col items-center text-center gap-2" : "items-center gap-3")}>
        {/* 아이콘 */}
        <div
          className={cn(
            "rounded-xl flex items-center justify-center flex-shrink-0",
            size === "sm" ? "w-12 h-12 text-2xl" : "w-14 h-14 text-3xl",
          )}
          style={{
            background: isLocked
              ? "rgba(30,36,56,0.8)"
              : `linear-gradient(135deg, ${rarity.glow}, ${category.bg})`,
            boxShadow: !isLocked ? `0 4px 12px ${rarity.glow}` : "none",
          }}
        >
          {isLocked ? "🔒" : badge.icon}
        </div>

        {/* 정보 */}
        <div className={cn("min-w-0", size === "sm" ? "" : "flex-1")}>
          <p className={cn(
            "font-semibold leading-snug",
            size === "sm" ? "text-xs" : "text-sm",
          )}>
            {badge.name}
          </p>
          <p className={cn(
            "text-[var(--color-muted)] mt-0.5 leading-relaxed",
            size === "sm" ? "text-[10px]" : "text-xs",
          )}>
            {badge.description}
          </p>

          {/* 등급 뱃지 */}
          {!isLocked && size === "md" && (
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${rarity.glow}`,
                  color: rarity.color,
                  border: `1px solid ${rarity.border}`,
                }}
              >
                {rarity.label}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: category.bg,
                  color: category.color,
                }}
              >
                {category.label}
              </span>
            </div>
          )}
        </div>

        {/* NEW 뱃지 */}
        {isNew && (
          <span
            className="absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              color: "white",
            }}
          >
            NEW
          </span>
        )}
      </div>
    </div>
  );
}

/** 배지 달성 축하 토스트/모달 컴포넌트 */
export function BadgeUnlockToast({
  badge,
  onClose,
}: {
  badge: BadgeDefinition;
  onClose: () => void;
}) {
  const rarity = BADGE_RARITY_CONFIG[badge.rarity];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="max-w-xs w-full rounded-3xl p-8 text-center animate-scale-in relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,25,39,0.98), rgba(30,36,56,0.95))",
          border: `2px solid ${rarity.border}`,
          boxShadow: `0 0 40px ${rarity.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 배경 파티클 효과 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${rarity.glow} 0%, transparent 60%)`,
          }}
        />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] mb-4 font-semibold">
            업적 달성!
          </p>

          {/* 아이콘 */}
          <div
            className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-4 animate-celebrate-pop"
            style={{
              background: `linear-gradient(135deg, ${rarity.glow}, rgba(20,25,39,0.8))`,
              border: `2px solid ${rarity.border}`,
              boxShadow: `0 8px 32px ${rarity.glow}`,
            }}
          >
            {badge.icon}
          </div>

          <h2
            className="text-xl font-bold mb-1"
            style={{ color: rarity.color }}
          >
            {badge.name}
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            {badge.description}
          </p>

          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, ${rarity.border}, ${rarity.glow})`,
              color: "white",
              boxShadow: `0 4px 16px ${rarity.glow}`,
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
