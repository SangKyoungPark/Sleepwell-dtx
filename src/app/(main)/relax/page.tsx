"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BreathingExercise } from "@/components/relax/BreathingExercise";
import { PMRExercise } from "@/components/relax/PMRExercise";
import { BodyScanExercise } from "@/components/relax/BodyScanExercise";
import { SleepSoundMixer } from "@/components/relax/SleepSoundMixer";
import { CloudDecoration, HeaderStars } from "@/components/ui/SleepIllustrations";

type Tool = "menu" | "breathing" | "pmr" | "bodyscan" | "sound";

/** 도구별 SVG 아이콘 (테마 컬러 그라데이션) */
function ToolIcon({ type, size = 36 }: { type: Tool; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    sound: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="soundGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <path d="M13 8v20l12-6V14L13 8z" fill="url(#soundGrad)" opacity="0.9" />
        <path d="M28 13c1.5 2 1.5 8 0 10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <path d="M31 10c2.5 4 2.5 12 0 16" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    breathing: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="breathGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="10" stroke="url(#breathGrad)" strokeWidth="2.5" fill="none" />
        <circle cx="18" cy="18" r="5" fill="url(#breathGrad)" opacity="0.3" />
        <path d="M18 6v4M18 26v4M6 18h4M26 18h4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    pmr: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="pmrGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d="M18 8c-4 0-7 3-7 7v6c0 4 3 7 7 7s7-3 7-7v-6c0-4-3-7-7-7z" stroke="url(#pmrGrad)" strokeWidth="2" fill="none" />
        <path d="M14 18h8" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 22h8" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="18" cy="14" r="1.5" fill="#f87171" opacity="0.6" />
      </svg>
    ),
    bodyscan: (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="10" r="4" stroke="url(#scanGrad)" strokeWidth="2" fill="none" />
        <path d="M18 14v8M14 28l4-6 4 6" stroke="url(#scanGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 18h12" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  };

  return <>{icons[type] || null}</>;
}

interface ToolConfig {
  id: Tool;
  title: string;
  description: string;
  duration: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  accentColor: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: "sound",
    title: "수면 사운드",
    description: "백색소음, 빗소리, 파도 등 8종 믹싱",
    duration: "자유 설정",
    gradient: "from-indigo-500/15 to-violet-500/10",
    glowColor: "rgba(99,102,241,0.35)",
    borderColor: "rgba(99,102,241,0.2)",
    accentColor: "#818cf8",
  },
  {
    id: "breathing",
    title: "4-7-8 호흡법",
    description: "4초 들숨, 7초 참기, 8초 날숨",
    duration: "약 2분",
    gradient: "from-blue-500/15 to-cyan-500/10",
    glowColor: "rgba(59,130,246,0.35)",
    borderColor: "rgba(59,130,246,0.2)",
    accentColor: "#60a5fa",
  },
  {
    id: "pmr",
    title: "점진적 근이완법",
    description: "발부터 머리까지 긴장-이완 반복",
    duration: "약 3분",
    gradient: "from-rose-500/15 to-orange-500/10",
    glowColor: "rgba(244,63,94,0.35)",
    borderColor: "rgba(244,63,94,0.2)",
    accentColor: "#f87171",
  },
  {
    id: "bodyscan",
    title: "바디스캔 명상",
    description: "몸 전체를 천천히 관찰하는 명상",
    duration: "약 5분",
    gradient: "from-purple-500/15 to-fuchsia-500/10",
    glowColor: "rgba(168,85,247,0.35)",
    borderColor: "rgba(168,85,247,0.2)",
    accentColor: "#c084fc",
  },
];

const TIPS = [
  { icon: "clock", title: "최적 시간", desc: "취침 15~30분 전에 사용하면 효과적입니다" },
  { icon: "moon", title: "환경 조성", desc: "조명을 어둡게 하고 편안한 자세로 해보세요" },
  { icon: "repeat", title: "루틴 형성", desc: "매일 같은 이완법을 반복하면 수면 신호가 됩니다" },
];

function TipIcon({ name }: { name: string }) {
  if (name === "clock") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
      <polyline points="17,1 21,5 17,9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7,23 3,19 7,15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

/** 헤더 일러스트 - 구름+달+별 조합 */
function RelaxHeaderIllustration() {
  return (
    <div className="relative w-[180px] h-[80px] flex-shrink-0">
      {/* 달빛 글로우 */}
      <div
        className="absolute top-1 right-6 w-14 h-14 rounded-full animate-soft-breath"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
        }}
      />
      {/* 구름 */}
      <div className="absolute bottom-0 left-0">
        <CloudDecoration className="opacity-40" />
      </div>
      {/* 미니 달 */}
      <svg
        width="32" height="32" viewBox="0 0 32 32" fill="none"
        className="absolute top-2 right-8 animate-float"
        style={{ animationDuration: "5s" }}
      >
        <path
          d="M20 6c-5.5 0-10 4.5-10 10s4.5 10 10 10c1.3 0 2.6-.3 3.8-.7C21.2 27.8 18 29 14.5 29 7.6 29 2 23.4 2 16.5S7.6 4 14.5 4c3.5 0 6.7 1.2 9.3 3.7C22.6 6.3 21.3 6 20 6z"
          fill="url(#miniMoonGrad)"
        />
        <defs>
          <linearGradient id="miniMoonGrad" x1="2" y1="4" x2="24" y2="29">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      {/* 별 */}
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="absolute top-1 right-2 animate-twinkle">
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#e2e8f0" opacity="0.6" />
      </svg>
      <svg width="6" height="6" viewBox="0 0 10 10" fill="none" className="absolute top-6 right-0 animate-twinkle" style={{ animationDelay: "0.7s" }}>
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#a78bfa" opacity="0.5" />
      </svg>
      <svg width="5" height="5" viewBox="0 0 10 10" fill="none" className="absolute top-0 left-12 animate-twinkle" style={{ animationDelay: "1.2s" }}>
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#818cf8" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function RelaxPage() {
  const [activeTool, setActiveTool] = useState<Tool>("menu");

  if (activeTool === "sound") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-24">
        <SleepSoundMixer onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "breathing") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-24">
        <BreathingExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "pmr") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-24">
        <PMRExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  if (activeTool === "bodyscan") {
    return (
      <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-24">
        <BodyScanExercise onBack={() => setActiveTool("menu")} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-24 animate-fade-in">
      {/* ━━━━━ 헤더 섹션 (몽환적 분위기) ━━━━━ */}
      <section
        className="relative px-6 pt-8 pb-6"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight">이완 도구</h1>
              <HeaderStars />
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              취침 전 긴장을 풀어주는 도구들
            </p>
          </div>
          <RelaxHeaderIllustration />
        </div>
      </section>

      <div className="px-6 space-y-4">
        {/* ━━━━━ 도구 카드 목록 ━━━━━ */}
        {TOOLS.map((tool, index) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "w-full text-left rounded-2xl p-5 relative overflow-hidden group",
              "transition-all duration-200 cursor-pointer active:scale-[0.98]",
              "animate-relax-card",
            )}
            style={{
              background: `linear-gradient(135deg, var(--color-surface), var(--color-surface-light))`,
              border: `1px solid ${tool.borderColor}`,
              animationDelay: `${index * 80}ms`,
            }}
          >
            {/* hover glow 오버레이 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${tool.glowColor.replace("0.35", "0.08")}, transparent)`,
                boxShadow: `inset 0 0 30px ${tool.glowColor.replace("0.35", "0.05")}`,
              }}
            />

            {/* 우측 상단 배경 오라 */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${tool.glowColor.replace("0.35", "0.1")} 0%, transparent 70%)`,
              }}
            />

            <div className="relative flex items-center gap-4">
              {/* 아이콘 원형 배경 */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${tool.glowColor.replace("0.35", "0.2")}, ${tool.glowColor.replace("0.35", "0.08")})`,
                  boxShadow: `0 4px 16px ${tool.glowColor.replace("0.35", "0.15")}`,
                }}
              >
                <ToolIcon type={tool.id} size={36} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] leading-snug">{tool.title}</p>
                <p className="text-sm text-[var(--color-muted)] mt-0.5 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${tool.glowColor.replace("0.35", "0.12")}`,
                      color: tool.accentColor,
                    }}
                  >
                    {tool.duration}
                  </span>
                </div>
              </div>

              {/* 화살표 */}
              <span
                className="text-sm transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: tool.accentColor, opacity: 0.7 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </span>
            </div>
          </button>
        ))}

        {/* ━━━━━ 추천 가이드 섹션 ━━━━━ */}
        <section className="pt-4 animate-slide-up delay-300" aria-label="추천 사용법">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            추천 사용법
          </h2>

          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: "linear-gradient(135deg, rgba(20,25,39,0.95), rgba(30,36,56,0.8))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {TIPS.map((tip, i) => (
              <div
                key={tip.title}
                className={cn(
                  "flex items-start gap-3",
                  i < TIPS.length - 1 && "pb-3 border-b border-white/5",
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(99,102,241,0.1)" }}
                >
                  <TipIcon name={tip.icon} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug">{tip.title}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
