"use client";

import { SleepyCharacter } from "@/components/ui/SleepIllustrations";

interface Props {
	visible: boolean;
	onStartSound: () => void;
	onDismiss: () => void;
}

export function SleepSoundPrompt({ visible, onStartSound, onDismiss }: Props) {
	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onDismiss}
			/>

			{/* Card */}
			<div className="relative bg-[var(--color-surface)] rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
				{/* Illustration */}
				<div className="flex justify-center mb-4">
					<SleepyCharacter size={100} />
				</div>

				{/* Text */}
				<h2 className="text-lg font-bold text-center mb-2">
					곧 취침 시간이에요
				</h2>
				<p className="text-sm text-[var(--color-muted)] text-center leading-relaxed mb-6">
					수면 사운드와 함께<br />편안한 밤을 보내보세요
				</p>

				{/* Buttons */}
				<div className="flex flex-col gap-2.5">
					<button
						onClick={onStartSound}
						className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
					>
						🎵 수면 사운드 켜기
					</button>
					<button
						onClick={onDismiss}
						className="w-full py-3 rounded-xl bg-[var(--color-surface-light)] text-[var(--color-muted)] font-medium text-sm transition-all cursor-pointer hover:text-[var(--color-foreground)]"
					>
						괜찮아요
					</button>
				</div>
			</div>
		</div>
	);
}
