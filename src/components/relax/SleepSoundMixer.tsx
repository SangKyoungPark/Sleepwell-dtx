"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSoundContext } from "@/contexts/SoundContext";
import { VolumeSlider } from "@/components/ui/VolumeSlider";
import { HeaderStars } from "@/components/ui/SleepIllustrations";
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
	{ type: "white", emoji: "\uD83D\uDCFB", name: "\uBC31\uC0C9\uC18C\uC74C", category: "noise" },
	{ type: "pink", emoji: "\uD83C\uDF38", name: "\uD551\uD06C\uC18C\uC74C", category: "noise" },
	{ type: "brown", emoji: "\uD83D\uDFE4", name: "\uAC08\uC0C9\uC18C\uC74C", category: "noise" },
	{ type: "rain", emoji: "\uD83C\uDF27\uFE0F", name: "\uBE57\uC18C\uB9AC", category: "nature" },
	{ type: "wave", emoji: "\uD83C\uDF0A", name: "\uD30C\uB3C4\uC18C\uB9AC", category: "nature" },
	{ type: "wind", emoji: "\uD83D\uDCA8", name: "\uBC14\uB78C\uC18C\uB9AC", category: "nature" },
	{ type: "cricket", emoji: "\uD83E\uDD97", name: "\uADC0\uB69C\uB77C\uBBF8", category: "nature" },
	{ type: "binaural", emoji: "\uD83E\uDDE0", name: "\uBC14\uC774\uB178\uB7F4 \uBE44\uD2B8", category: "special" },
];

const CATEGORIES: { id: Category; label: string }[] = [
	{ id: "all", label: "\uC804\uCCB4" },
	{ id: "noise", label: "\uB178\uC774\uC988" },
	{ id: "nature", label: "\uC790\uC5F0" },
	{ id: "special", label: "\uD2B9\uC218" },
];

const TIMER_OPTIONS = [
	{ value: null as number | null, label: "\uBB34\uC81C\uD55C" },
	{ value: 15, label: "15\uBD84" },
	{ value: 30, label: "30\uBD84" },
	{ value: 45, label: "45\uBD84" },
	{ value: 60, label: "60\uBD84" },
];

function FormatSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
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
				&larr; \uC774\uC644 \uB3C4\uAD6C
			</button>

			{/* Header card */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-blue-500/15 border border-indigo-500/20 p-5 mb-6">
				{/* Background decoration */}
				<div className="absolute top-2 right-3 opacity-60">
					<HeaderStars />
				</div>
				<div className="absolute -bottom-3 -right-3 text-6xl opacity-10 select-none">
					{"\uD83C\uDF19"}
				</div>

				<div className="relative">
					<div className="flex items-center gap-2 mb-1.5">
						<span className="text-2xl">{"\uD83C\uDFB5"}</span>
						<h2 className="text-lg font-bold">\uC218\uBA74 \uC0AC\uC6B4\uB4DC</h2>
					</div>
					<p className="text-sm text-[var(--color-muted)] leading-relaxed">
						\uC5EC\uB7EC \uC18C\uB9AC\uB97C \uC870\uD569\uD558\uC5EC<br />\uB098\uB9CC\uC758 \uC218\uBA74 \uD658\uACBD\uC744 \uB9CC\uB4E4\uC5B4\uBCF4\uC138\uC694
					</p>
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
											{isPlaying ? "\uC7AC\uC0DD \uC911" : "\uD0ED\uD558\uC5EC \uC7AC\uC0DD"}
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
						<span className="text-sm font-medium">\uC804\uCCB4 \uBCFC\uB968</span>
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
						<span className="text-sm font-medium">\u23F1 \uC2AC\uB9BD \uD0C0\uC774\uBA38</span>
						<span className="text-sm text-[var(--color-muted)]">
							{timerRemaining !== null
								? FormatSeconds(timerRemaining)
								: state.timerMinutes
									? `${state.timerMinutes}\uBD84`
									: "\uBB34\uC81C\uD55C"}
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
					\uC804\uCCB4 \uC815\uC9C0
				</button>
			)}

			{/* Tips */}
			{!isAnyPlaying && (
				<div className="bg-[var(--color-surface)] rounded-2xl p-4 mt-2">
					<h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">\uD83D\uDCA1 \uC0AC\uC6A9 \uD301</h3>
					<ul className="text-xs text-[var(--color-muted)] space-y-1">
						<li>&bull; \uC5EC\uB7EC \uC18C\uB9AC\uB97C \uB3D9\uC2DC\uC5D0 \uC7AC\uC0DD\uD558\uC5EC \uBB35\uC2F1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4</li>
						<li>&bull; \uBC14\uC774\uB178\uB7F4 \uBE44\uD2B8\uB294 \uC774\uC5B4\uD3F0/\uD5E4\uB4DC\uD3F0 \uCC29\uC6A9\uC744 \uAD8C\uC7A5\uD569\uB2C8\uB2E4</li>
						<li>&bull; \uC2AC\uB9BD \uD0C0\uC774\uBA38\uB97C \uC124\uC815\uD558\uBA74 \uC790\uB3D9\uC73C\uB85C \uAEBC\uC9D1\uB2C8\uB2E4</li>
						<li>&bull; \uB2E4\uB978 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD574\uB3C4 \uC18C\uB9AC\uB294 \uACC4\uC18D \uC7AC\uC0DD\uB429\uB2C8\uB2E4</li>
					</ul>
				</div>
			)}
		</div>
	);
}
