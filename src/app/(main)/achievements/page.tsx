"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/useAchievements";
import { BadgeCard, BadgeUnlockToast } from "@/components/ui/BadgeCard";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { HeaderStars, StarsBackground } from "@/components/ui/SleepIllustrations";
import {
  BADGES,
  getBadgeById,
  BADGE_CATEGORY_CONFIG,
  type BadgeCategory,
} from "@/lib/badges";

type FilterTab = "all" | BadgeCategory;

const FILTER_TABS: { id: FilterTab; label: string; icon: string }[] = [
  { id: "all", label: "전체", icon: "🏅" },
  { id: "streak", label: "연속", icon: "🔥" },
  { id: "mission", label: "미션", icon: "🎯" },
  { id: "efficiency", label: "효율", icon: "💤" },
  { id: "program", label: "프로그램", icon: "📚" },
  { id: "relax", label: "이완", icon: "🧘" },
  { id: "coach", label: "코치", icon: "🤖" },
];

export default function AchievementsPage() {
  const { unlockedBadges, newBadges, totalBadges, loading, clearNewBadges } =
    useAchievements();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(
    () => newBadges[0] || null,
  );

  if (loading) return <PageSkeleton cards={6} />;

  const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));
  const unlockedCount = unlockedBadges.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  // 필터된 배지 목록
  const filteredBadges =
    filter === "all"
      ? BADGES
      : BADGES.filter((b) => b.category === filter);

  // 잠금 해제된 것 먼저, 그 다음 잠긴 것
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id) ? 0 : 1;
    const bUnlocked = unlockedIds.has(b.id) ? 0 : 1;
    return aUnlocked - bUnlocked;
  });

  function handleCloseModal() {
    setShowUnlockModal(null);
    clearNewBadges();
  }

  const modalBadge = showUnlockModal ? getBadgeById(showUnlockModal) : null;

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-24 animate-fade-in overflow-x-hidden">
      {/* 배지 달성 모달 */}
      {modalBadge && (
        <BadgeUnlockToast badge={modalBadge} onClose={handleCloseModal} />
      )}

      {/* ━━━━━ 헤더 영역 ━━━━━ */}
      <section
        className="relative px-6 pt-8 pb-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(251,191,36,0.06) 0%, transparent 100%)",
        }}
        aria-label="업적 헤더"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <StarsBackground className="opacity-20" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold tracking-tight">업적</h1>
                <HeaderStars />
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                꾸준한 노력이 빛나는 순간
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))",
                border: "1px solid rgba(251,191,36,0.25)",
                boxShadow: "0 4px 16px rgba(251,191,36,0.15)",
              }}
            >
              🏆
            </div>
          </div>

          {/* 전체 진행도 */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">
                  달성률
                </p>
                <p className="text-3xl font-bold mt-1">
                  <span style={{ color: "#fbbf24" }}>{unlockedCount}</span>
                  <span className="text-sm text-[var(--color-muted)] font-normal">
                    {" "}
                    / {totalBadges}
                  </span>
                </p>
              </div>

              {/* 원형 프로그레스 */}
              <div className="relative" style={{ width: 64, height: 64 }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  className="-rotate-90"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#1e2438"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={
                      2 * Math.PI * 26 -
                      (progressPercent / 100) * 2 * Math.PI * 26
                    }
                    style={{
                      transition: "stroke-dashoffset 0.8s ease-out",
                      filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#fbbf24" }}
                  >
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[var(--color-surface-light)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 space-y-5 mt-2">
        {/* ━━━━━ 필터 탭 ━━━━━ */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            const categoryCount =
              tab.id === "all"
                ? unlockedCount
                : BADGES.filter(
                    (b) =>
                      b.category === tab.id && unlockedIds.has(b.id),
                  ).length;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "relative px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0 active:scale-95 flex items-center gap-1.5",
                  isActive
                    ? "text-white font-semibold"
                    : "text-[var(--color-muted)]",
                )}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(251,191,36,0.35), rgba(245,158,11,0.25))"
                    : "var(--color-surface)",
                  border: isActive
                    ? "1px solid rgba(251,191,36,0.4)"
                    : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {categoryCount > 0 && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(251,191,36,0.15)",
                      color: isActive ? "white" : "#fbbf24",
                    }}
                  >
                    {categoryCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ━━━━━ 배지 그리드 ━━━━━ */}
        <div className="grid grid-cols-2 gap-3">
          {sortedBadges.map((badge, idx) => {
            const unlocked = unlockedBadges.find(
              (b) => b.badgeId === badge.id,
            );
            const isNew = newBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className="animate-card-stagger"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <BadgeCard
                  badge={badge}
                  unlocked={unlocked}
                  isNew={isNew}
                  size="sm"
                />
              </div>
            );
          })}
        </div>

        {/* 빈 상태 */}
        {sortedBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-[var(--color-muted)]">
              이 카테고리에 배지가 없습니다
            </p>
          </div>
        )}

        {/* ━━━━━ 팁 카드 ━━━━━ */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(20,25,39,0.9))",
            border: "1px solid rgba(251,191,36,0.12)",
          }}
        >
          <span className="text-lg flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-[var(--color-warning)] mb-1">
              업적 달성 팁
            </p>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              매일 꾸준히 수면 일지를 기록하고 미션을 완료하면 더 많은 업적을
              달성할 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
