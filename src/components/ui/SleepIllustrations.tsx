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

/** 수면 점수 원형 프로그레스 링 */
interface SleepScoreRingProps {
  value: number;       // 0~100 (수면효율 %)
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function SleepScoreRing({
  value,
  size = 96,
  strokeWidth = 8,
  className = "",
}: SleepScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  const trackColor = "#1e2438";
  const ringColor =
    clampedValue >= 85
      ? "#34d399"
      : clampedValue >= 70
      ? "#fbbf24"
      : "#f87171";

  const glowColor =
    clampedValue >= 85
      ? "rgba(52,211,153,0.4)"
      : clampedValue >= 70
      ? "rgba(251,191,36,0.4)"
      : "rgba(248,113,113,0.4)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`-rotate-90 ${className}`}
    >
      <defs>
        <filter id="ringGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ringColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={ringColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* 트랙 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* 채워진 링 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#ringGradient)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${glowColor})`,
          transition: "stroke-dashoffset 1.2s ease-out",
        }}
      />
    </svg>
  );
}

/** 홈 히어로 배경 - 큰 달빛 오라 */
export function HeroMoonAura({ className = "" }: { className?: string }) {
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      fill="none"
      className={`animate-float ${className}`}
      style={{ animationDuration: "5s" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="heroAura1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heroAura2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroMoonFace" x1="60" y1="60" x2="200" y2="200">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* 외부 오라 */}
      <circle cx="130" cy="130" r="125" fill="url(#heroAura1)" />
      {/* 달 글로우 */}
      <circle cx="130" cy="130" r="80" fill="url(#heroAura2)" />
      {/* 달 본체 */}
      <path
        d="M158 72c-32 0-58 26-58 58s26 58 58 58c8 0 15-1.5 22-4.3C169 194 150 202 130 202c-39.8 0-72-32.2-72-72s32.2-72 72-72c20 0 38 8 50.8 21A57.7 57.7 0 00158 72z"
        fill="url(#heroMoonFace)"
      />
      {/* 달 표면 크레이터 */}
      <circle cx="118" cy="122" r="5" fill="#d97706" opacity="0.15" />
      <circle cx="138" cy="145" r="3.5" fill="#d97706" opacity="0.12" />
      <circle cx="108" cy="140" r="2.5" fill="#d97706" opacity="0.15" />
      {/* Zzz 텍스트 */}
      <text x="168" y="88" fill="#a78bfa" fontSize="18" fontWeight="bold" opacity="0.7" className="animate-twinkle" transform="rotate(90, 168, 88)">z</text>
      <text x="180" y="72" fill="#a78bfa" fontSize="14" fontWeight="bold" opacity="0.5" className="animate-twinkle" transform="rotate(90, 180, 72)" style={{ animationDelay: "0.4s" }}>z</text>
      <text x="190" y="60" fill="#a78bfa" fontSize="10" fontWeight="bold" opacity="0.3" className="animate-twinkle" transform="rotate(90, 190, 60)" style={{ animationDelay: "0.8s" }}>z</text>
      {/* 별 장식 */}
      <circle cx="60" cy="75" r="2" fill="#e2e8f0" opacity="0.5" />
      <circle cx="200" cy="190" r="1.5" fill="#e2e8f0" opacity="0.4" />
      <circle cx="195" cy="80" r="1" fill="#e2e8f0" opacity="0.6" />
    </svg>
  );
}

/** 수면 일지 헤더 일러스트 (노트+달) */
export function DiaryIllustration({ size = 80, className = "" }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={`animate-float ${className}`}
      aria-hidden="true"
    >
      {/* 빛 오라 */}
      <circle cx="40" cy="40" r="38" fill="url(#diaryGlow)" opacity="0.2" />
      {/* 노트패드 */}
      <rect x="20" y="18" width="36" height="44" rx="4" fill="url(#diaryPad)" />
      <rect x="20" y="18" width="36" height="44" rx="4" stroke="#818cf8" strokeWidth="1" opacity="0.3" />
      {/* 줄 */}
      <line x1="26" y1="30" x2="50" y2="30" stroke="#6366f1" strokeWidth="0.8" opacity="0.3" />
      <line x1="26" y1="36" x2="48" y2="36" stroke="#6366f1" strokeWidth="0.8" opacity="0.25" />
      <line x1="26" y1="42" x2="44" y2="42" stroke="#6366f1" strokeWidth="0.8" opacity="0.2" />
      {/* 달 아이콘 (노트 위) */}
      <circle cx="52" cy="22" r="10" fill="url(#diaryMoon)" />
      <circle cx="56" cy="19" r="8" fill="#1e2438" />
      {/* 별 */}
      <circle cx="16" cy="28" r="1.2" fill="#e2e8f0" opacity="0.5" className="animate-twinkle" />
      <circle cx="64" cy="55" r="1" fill="#e2e8f0" opacity="0.4" className="animate-twinkle" style={{ animationDelay: "0.5s" }} />
      {/* Zzz */}
      <text x="60" y="16" fill="#a78bfa" fontSize="8" fontWeight="bold" opacity="0.6" className="animate-twinkle">z</text>
      <text x="65" y="11" fill="#a78bfa" fontSize="6" fontWeight="bold" opacity="0.4" className="animate-twinkle" style={{ animationDelay: "0.4s" }}>z</text>
      <defs>
        <radialGradient id="diaryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diaryPad" x1="20" y1="18" x2="56" y2="62">
          <stop offset="0%" stopColor="#1e2438" />
          <stop offset="100%" stopColor="#141927" />
        </linearGradient>
        <linearGradient id="diaryMoon" x1="42" y1="12" x2="62" y2="32">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 미션 페이지 헤더 일러스트 (타겟+별) */
export function MissionIllustration({ size = 80, className = "" }: SizeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={`animate-float ${className}`}
      aria-hidden="true"
    >
      {/* 빛 오라 */}
      <circle cx="40" cy="40" r="38" fill="url(#missionGlow)" opacity="0.15" />
      {/* 타겟 외부 링 */}
      <circle cx="40" cy="40" r="26" stroke="#6366f1" strokeWidth="2" opacity="0.3" />
      <circle cx="40" cy="40" r="18" stroke="#818cf8" strokeWidth="2" opacity="0.4" />
      <circle cx="40" cy="40" r="10" stroke="#a78bfa" strokeWidth="2" opacity="0.5" />
      {/* 중심 */}
      <circle cx="40" cy="40" r="4" fill="url(#missionCenter)" />
      {/* 깃발 */}
      <line x1="40" y1="14" x2="40" y2="6" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 6L50 10L40 14Z" fill="#6366f1" opacity="0.7" />
      {/* 별 장식 */}
      <path d="M14 20L15 23L18 24L15 25L14 28L13 25L10 24L13 23Z" fill="#fbbf24" opacity="0.6" className="animate-twinkle" />
      <path d="M62 56L63 58.5L66 59.5L63 60.5L62 63L61 60.5L58 59.5L61 58.5Z" fill="#818cf8" opacity="0.5" className="animate-twinkle" style={{ animationDelay: "0.7s" }} />
      <circle cx="66" cy="20" r="1.2" fill="#e2e8f0" opacity="0.5" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
      <circle cx="18" cy="60" r="1" fill="#e2e8f0" opacity="0.4" className="animate-twinkle" style={{ animationDelay: "1s" }} />
      <defs>
        <radialGradient id="missionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="missionCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** 축하 화면용 미니 별/반짝이 파티클 */
export function CelebrationParticles({ className = "" }: { className?: string }) {
  const particles = [
    { x: "15%", y: "10%", color: "#818cf8", size: 6, delay: "0s" },
    { x: "80%", y: "15%", color: "#fbbf24", size: 5, delay: "0.2s" },
    { x: "30%", y: "5%", color: "#34d399", size: 4, delay: "0.4s" },
    { x: "65%", y: "20%", color: "#a78bfa", size: 7, delay: "0.1s" },
    { x: "10%", y: "25%", color: "#f59e0b", size: 5, delay: "0.3s" },
    { x: "90%", y: "8%", color: "#6366f1", size: 4, delay: "0.5s" },
    { x: "50%", y: "3%", color: "#fde68a", size: 6, delay: "0.15s" },
    { x: "40%", y: "22%", color: "#34d399", size: 3, delay: "0.35s" },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-confetti-drift"
          style={{
            left: p.x,
            top: p.y,
            animationDelay: p.delay,
            animationDuration: `${1.5 + Math.random() * 1}s`,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 10 10" fill="none">
            <path
              d="M5 0L5.9 3.5L10 5L5.9 6.5L5 10L4.1 6.5L0 5L4.1 3.5Z"
              fill={p.color}
              opacity="0.8"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** 원형 수면 효율 게이지 (일지 완료 화면용, 큰 사이즈) */
interface SleepEfficiencyGaugeProps {
  efficiency: number;
  totalSleepMinutes: number;
  size?: number;
  className?: string;
}

export function SleepEfficiencyGauge({
  efficiency,
  totalSleepMinutes,
  size = 160,
  className = "",
}: SleepEfficiencyGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, efficiency));
  const offset = circumference - (clamped / 100) * circumference;

  const hours = Math.floor(totalSleepMinutes / 60);
  const minutes = totalSleepMinutes % 60;

  const ringColor = clamped >= 85 ? "#34d399" : clamped >= 70 ? "#fbbf24" : "#f87171";
  const glowColor = clamped >= 85
    ? "rgba(52,211,153,0.35)"
    : clamped >= 70
    ? "rgba(251,191,36,0.35)"
    : "rgba(248,113,113,0.35)";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        style={
          {
            "--circumference": circumference,
            "--target-offset": offset,
          } as React.CSSProperties
        }
      >
        <defs>
          <linearGradient id="effGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 배경 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e2438"
          strokeWidth={strokeWidth}
        />
        {/* 프로그레스 링 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#effGaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-ring-draw"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: ringColor }}>
          {efficiency}%
        </span>
        <span className="text-xs text-[var(--color-muted)] mt-1">수면 효율</span>
        <span className="text-sm font-semibold text-[var(--color-primary-light)] mt-1">
          {hours}h {minutes > 0 ? `${minutes}m` : ""}
        </span>
      </div>
    </div>
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
