"use client";

interface SizeProps {
  size?: number;
  className?: string;
}

/** 초승달 + 빛 일러스트 (히어로용, 크기 조절 가능) */
export function MoonIllustration({ size = 120, className = "" }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={`animate-float ${className}`}
    >
      {/* 달 뒤 빛 */}
      <circle cx="60" cy="60" r="50" fill="url(#moonGlow)" opacity="0.3" />
      <circle cx="60" cy="60" r="35" fill="url(#moonGlow)" opacity="0.15" />
      {/* 초승달 */}
      <path
        d="M75 30c-16.57 0-30 13.43-30 30s13.43 30 30 30c4.03 0 7.87-.8 11.38-2.24C79.44 93.4 70.18 97 60 97c-20.43 0-37-16.57-37-37s16.57-37 37-37c10.18 0 19.44 3.6 26.38 9.24A29.8 29.8 0 0075 30z"
        fill="url(#moonFace)"
      />
      {/* 달 표면 디테일 */}
      <circle cx="52" cy="55" r="3" fill="#d4a017" opacity="0.2" />
      <circle cx="62" cy="70" r="2" fill="#d4a017" opacity="0.15" />
      <circle cx="45" cy="68" r="1.5" fill="#d4a017" opacity="0.2" />
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonFace" x1="30" y1="30" x2="90" y2="90">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 반짝이는 별 배경 (absolute 배치, 부모 relative 필요) */
export function StarsBackground({ className = "" }: { className?: string }) {
  const stars = [
    { cx: "10%", cy: "15%", r: 1.5, delay: "0s" },
    { cx: "25%", cy: "8%", r: 1, delay: "0.5s" },
    { cx: "80%", cy: "12%", r: 1.8, delay: "1s" },
    { cx: "65%", cy: "25%", r: 1, delay: "1.5s" },
    { cx: "90%", cy: "35%", r: 1.3, delay: "0.3s" },
    { cx: "15%", cy: "40%", r: 1, delay: "0.8s" },
    { cx: "50%", cy: "5%", r: 1.2, delay: "1.2s" },
    { cx: "35%", cy: "30%", r: 0.8, delay: "0.7s" },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute animate-twinkle"
          style={{
            left: star.cx,
            top: star.cy,
            width: star.r * 2 + 4,
            height: star.r * 2 + 4,
            animationDelay: star.delay,
          }}
        >
          <svg
            width={star.r * 2 + 4}
            height={star.r * 2 + 4}
            viewBox="0 0 10 10"
            fill="none"
          >
            {/* 4각 별 */}
            <path
              d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z"
              fill="#e2e8f0"
              opacity="0.8"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** 구름 장식 */
export function CloudDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="160"
      height="60"
      viewBox="0 0 160 60"
      fill="none"
      className={`animate-float ${className}`}
      style={{ animationDuration: "6s" }}
    >
      <ellipse cx="80" cy="40" rx="60" ry="18" fill="url(#cloudGrad)" opacity="0.5" />
      <ellipse cx="55" cy="30" rx="30" ry="20" fill="url(#cloudGrad)" opacity="0.6" />
      <ellipse cx="100" cy="32" rx="35" ry="18" fill="url(#cloudGrad)" opacity="0.55" />
      <ellipse cx="75" cy="25" rx="25" ry="16" fill="url(#cloudGrad)" opacity="0.7" />
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="60">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 수면 캐릭터 (눈 감은 달 얼굴) */
export function SleepyCharacter({ size = 80, className = "" }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={`animate-float ${className}`}
    >
      {/* 달 빛 */}
      <circle cx="40" cy="40" r="38" fill="#fbbf24" opacity="0.08" />
      {/* 달 몸체 */}
      <circle cx="40" cy="40" r="28" fill="url(#sleepyMoon)" />
      {/* 잠자는 눈 (감은 눈) */}
      <path d="M28 36c2-3 6-3 8 0" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 36c2-3 6-3 8 0" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* 미소 */}
      <path d="M34 46c2 3 10 3 12 0" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 볼 홍조 */}
      <circle cx="28" cy="42" r="3" fill="#f59e0b" opacity="0.3" />
      <circle cx="52" cy="42" r="3" fill="#f59e0b" opacity="0.3" />
      {/* Zzz */}
      <text x="58" y="22" fill="#a78bfa" fontSize="10" fontWeight="bold" opacity="0.7" className="animate-twinkle">z</text>
      <text x="64" y="15" fill="#a78bfa" fontSize="8" fontWeight="bold" opacity="0.5" className="animate-twinkle" style={{ animationDelay: "0.3s" }}>z</text>
      <text x="68" y="10" fill="#a78bfa" fontSize="6" fontWeight="bold" opacity="0.3" className="animate-twinkle" style={{ animationDelay: "0.6s" }}>z</text>
      {/* 별빛 장식 */}
      <circle cx="12" cy="15" r="1.5" fill="#e2e8f0" opacity="0.5" className="animate-twinkle" />
      <circle cx="68" cy="65" r="1" fill="#e2e8f0" opacity="0.4" className="animate-twinkle" style={{ animationDelay: "0.8s" }} />
      <defs>
        <linearGradient id="sleepyMoon" x1="12" y1="12" x2="68" y2="68">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** AI 코치 캐릭터 (헤드셋 쓴 달) */
export function CoachCharacter({ size = 80, className = "" }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
    >
      {/* 달 빛 */}
      <circle cx="40" cy="42" r="36" fill="#818cf8" opacity="0.08" />
      {/* 달 몸체 */}
      <circle cx="40" cy="42" r="26" fill="url(#coachMoon)" />
      {/* 헤드셋 밴드 */}
      <path
        d="M16 38c0-14 10.75-24 24-24s24 10 24 24"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* 헤드셋 이어피스 (왼쪽) */}
      <rect x="12" y="34" width="8" height="14" rx="4" fill="#6366f1" />
      {/* 헤드셋 이어피스 (오른쪽) */}
      <rect x="60" y="34" width="8" height="14" rx="4" fill="#6366f1" />
      {/* 마이크 */}
      <path d="M62 48c4 2 6 6 4 8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="66" cy="58" r="3" fill="#6366f1" opacity="0.8" />
      {/* 눈 (열린 눈, 반짝이는) */}
      <circle cx="33" cy="40" r="3" fill="#1e1b4b" />
      <circle cx="47" cy="40" r="3" fill="#1e1b4b" />
      <circle cx="34" cy="39" r="1" fill="white" opacity="0.8" />
      <circle cx="48" cy="39" r="1" fill="white" opacity="0.8" />
      {/* 미소 */}
      <path d="M34 49c2 3 10 3 12 0" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 볼 홍조 */}
      <circle cx="28" cy="46" r="3" fill="#f59e0b" opacity="0.2" />
      <circle cx="52" cy="46" r="3" fill="#f59e0b" opacity="0.2" />
      <defs>
        <linearGradient id="coachMoon" x1="14" y1="16" x2="66" y2="68">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 페이지 헤더 장식용 작은 별들 */
export function HeaderStars({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className="animate-twinkle" style={{ animationDelay: "0s" }}>
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#818cf8" opacity="0.6" />
      </svg>
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="animate-twinkle" style={{ animationDelay: "0.5s" }}>
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#a78bfa" opacity="0.5" />
      </svg>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="animate-twinkle" style={{ animationDelay: "1s" }}>
        <path d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z" fill="#818cf8" opacity="0.4" />
      </svg>
    </div>
  );
}
