"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSoundContext } from "@/contexts/SoundContext";
import { VolumeSlider } from "@/components/ui/VolumeSlider";
import type { SoundType } from "@/lib/audio/SleepSoundEngine";

interface Props {
	onBack: () => void;
}

type Category = "all" | "noise" | "nature" | "special";

interface SoundInfo {
	type: SoundType;
	emoji: string;
	name: string;
	category: Category;
}

const SOUNDS: SoundInfo[] = [
	{ type: "white", emoji: "📻", name: "백색소음", category: "noise" },
	{ type: "pink", emoji: "🌸", name: "핑크소음", category: "noise" },
	{ type: "brown", emoji: "🟤", name: "갈색소음", category: "noise" },
	{ type: "rain", emoji: "🌧️", name: "빗소리", category: "nature" },
	{ type: "wave", emoji: "🌊", name: "파도소리", category: "nature" },
	{ type: "wind", emoji: "💨", name: "바람소리", category: "nature" },
	{ type: "cricket", emoji: "🦗", name: "귀뚜라미", category: "nature" },
	{ type: "binaural", emoji: "🧠", name: "바이노럴 비트", category: "special" },
];

const CATEGORIES: { id: Category; label: string }[] = [
	{ id: "all", label: "전체" },
	{ id: "noise", label: "노이즈" },
	{ id: "nature", label: "자연" },
	{ id: "special", label: "특수" },
];

const TIMER_OPTIONS = [
	{ value: null as number | null, label: "무제한" },
	{ value: 15, label: "15분" },
	{ value: 30, label: "30분" },
	{ value: 45, label: "45분" },
	{ value: 60, label: "60분" },
];

function FormatSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 헤더 일러스트: 헤드폰 쓴 달 + 음표 + 별 */
function SoundHeaderIllustration() {
	return (
		<svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="animate-float">
			{/* 배경 글로우 */}
			<circle cx="50" cy="50" r="45" fill="url(#soundGlow)" opacity="0.2" />

			{/* 달 몸체 */}
			<circle cx="50" cy="50" r="28" fill="url(#soundMoon)" />

			{/* 잠자는 눈 */}
			<path d="M38 46c2-3 6-3 8 0" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
			<path d="M54 46c2-3 6-3 8 0" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />

			{/* 미소 */}
			<path d="M44 56c2 2.5 10 2.5 12 0" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />

			{/* 볼 홍조 */}
			<circle cx="37" cy="52" r="3" fill="#f59e0b" opacity="0.25" />
			<circle cx="63" cy="52" r="3" fill="#f59e0b" opacity="0.25" />

			{/* 헤드폰 밴드 */}
			<path d="M24 46c0-15 11.5-26 26-26s26 11 26 26" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" fill="none" />

			{/* 헤드폰 이어피스 */}
			<rect x="19" y="42" width="9" height="15" rx="4.5" fill="#818cf8" />
			<rect x="72" y="42" width="9" height="15" rx="4.5" fill="#818cf8" />

			{/* 음표 1 */}
			<g opacity="0.7" className="animate-twinkle">
				<circle cx="14" cy="24" r="3" fill="#a78bfa" />
				<line x1="17" y1="24" x2="17" y2="14" stroke="#a78bfa" strokeWidth="1.5" />
				<path d="M17 14c2-1 5-1 5 1" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
			</g>

			{/* 음표 2 */}
			<g opacity="0.5" className="animate-twinkle" style={{ animationDelay: "0.6s" }}>
				<circle cx="82" cy="18" r="2.5" fill="#818cf8" />
				<line x1="84.5" y1="18" x2="84.5" y2="10" stroke="#818cf8" strokeWidth="1.2" />
				<path d="M84.5 10c1.5-1 4-1 4 0.8" stroke="#818cf8" strokeWidth="1.2" fill="none" />
			</g>

			{/* 별 장식 */}
			<path d="M88 38l0.7 1.5 1.8 0.3-1.3 1.2 0.3 1.7-1.5-0.8-1.5 0.8 0.3-1.7-1.3-1.2 1.8-0.3z" fill="#e2e8f0" opacity="0.6" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
			<path d="M10 38l0.5 1 1.2 0.2-0.9 0.8 0.2 1.2-1-0.6-1 0.6 0.2-1.2-0.9-0.8 1.2-0.2z" fill="#e2e8f0" opacity="0.4" className="animate-twinkle" style={{ animationDelay: "0.9s" }} />

			<defs>
				<radialGradient id="soundGlow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
					<stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="soundMoon" x1="22" y1="22" x2="78" y2="78">
					<stop offset="0%" stopColor="#fde68a" />
					<stop offset="100%" stopColor="#f59e0b" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function SleepSoundMixer({ onBack }: Props) {
	const {
		state,
		isAnyPlaying,
		timerRemaining,
		toggleSound,
		setVolume,
		setMasterVolume,
		setTimer,
		stopAll,
	} = useSoundContext();

	const [category, setCategory] = useState<Category>("all");
	const [showTimer, setShowTimer] = useState(false);

	const filtered = category === "all"
		? SOUNDS
		: SOUNDS.filter((s) => s.category === category);

	return (
		<div className="flex flex-col">
			{/* Back button */}
			<button onClick={onBack} className="self-start text-[var(--color-muted)] mb-4 cursor-pointer">
				← 이완 도구
			</button>

			{/* Header card with illustration */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-blue-500/15 border border-indigo-500/20 p-5 mb-6">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<h2 className="text-lg font-bold mb-1">수면 사운드</h2>
						<p className="text-sm text-[var(--color-muted)] leading-relaxed">
							여러 소리를 조합하여<br />나만의 수면 환경을 만들어보세요
						</p>
					</div>
					<div className="flex-shrink-0 -mr-2 -my-2">
						<SoundHeaderIllustration />
					</div>
				</div>
			</div>

			{/* Category tabs */}
			<div className="flex gap-2 mb-5 overflow-x-auto">
				{CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						onClick={() => setCategory(cat.id)}
						className={cn(
							"px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all cursor-pointer",
							category === cat.id
								? "bg-[var(--color-primary)] text-white"
								: "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
						)}
					>
						{cat.label}
					</button>
				))}
			</div>

			{/* Sound cards grid */}
			<div className="grid grid-cols-2 gap-3 mb-6">
				{filtered.map((sound) => {
					const isPlaying = state.sounds[sound.type]?.playing;
					const volume = state.sounds[sound.type]?.volume ?? 0.5;

					return (
						<div
							key={sound.type}
							className={cn(
								"rounded-2xl p-4 border-2 transition-all",
								isPlaying
									? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40"
									: "bg-[var(--color-surface)] border-[var(--color-surface-light)]",
							)}
						>
							<button
								onClick={() => toggleSound(sound.type)}
								className="w-full text-left cursor-pointer"
							>
								<div className="flex items-center gap-3">
									<span className="text-3xl">{sound.emoji}</span>
									<div className="flex-1 min-w-0">
										<p className={cn(
											"text-sm font-semibold truncate",
											isPlaying && "text-[var(--color-primary-light)]",
										)}>
											{sound.name}
										</p>
										<p className="text-xs text-[var(--color-muted)]">
											{isPlaying ? "재생 중" : "탭하여 재생"}
										</p>
									</div>
								</div>
							</button>

							{isPlaying && (
								<div className="mt-3">
									<VolumeSlider
										value={volume}
										onChange={(v) => setVolume(sound.type, v)}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Master volume */}
			{isAnyPlaying && (
				<div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">전체 볼륨</span>
						<span className="text-sm text-[var(--color-muted)]">
							{Math.round(state.masterVolume * 100)}%
						</span>
					</div>
					<VolumeSlider
						value={state.masterVolume}
						onChange={setMasterVolume}
					/>
				</div>
			)}

			{/* Timer */}
			{isAnyPlaying && (
				<div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-4">
					<button
						onClick={() => setShowTimer(!showTimer)}
						className="w-full flex items-center justify-between cursor-pointer"
					>
						<span className="text-sm font-medium">⏱ 슬립 타이머</span>
						<span className="text-sm text-[var(--color-muted)]">
							{timerRemaining !== null
								? FormatSeconds(timerRemaining)
								: state.timerMinutes
									? `${state.timerMinutes}분`
									: "무제한"}
						</span>
					</button>

					{showTimer && (
						<div className="flex flex-wrap gap-2 mt-3">
							{TIMER_OPTIONS.map((opt) => (
								<button
									key={opt.label}
									onClick={() => {
										setTimer(opt.value);
										setShowTimer(false);
									}}
									className={cn(
										"px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer",
										state.timerMinutes === opt.value
											? "bg-[var(--color-primary)] text-white"
											: "bg-[var(--color-surface-light)] text-[var(--color-muted)]",
									)}
								>
									{opt.label}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Stop all button */}
			{isAnyPlaying && (
				<button
					onClick={stopAll}
					className="w-full py-3 rounded-2xl bg-red-500/10 text-red-400 border-2 border-red-500/20 font-semibold text-sm transition-all cursor-pointer hover:bg-red-500/20"
				>
					전체 정지
				</button>
			)}

			{/* Tips */}
			{!isAnyPlaying && (
				<div className="bg-[var(--color-surface)] rounded-2xl p-4 mt-2">
					<h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">💡 사용 팁</h3>
					<ul className="text-xs text-[var(--color-muted)] space-y-1">
						<li>• 여러 소리를 동시에 재생하여 믹싱할 수 있습니다</li>
						<li>• 바이노럴 비트는 이어폰/헤드폰 착용을 권장합니다</li>
						<li>• 슬립 타이머를 설정하면 자동으로 꺼집니다</li>
						<li>• 다른 페이지로 이동해도 소리는 계속 재생됩니다</li>
					</ul>
				</div>
			)}
		</div>
	);
}
