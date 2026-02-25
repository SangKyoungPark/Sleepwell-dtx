"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSoundContext } from "@/contexts/SoundContext";

function FormatSeconds(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SoundMiniPlayer() {
	const pathname = usePathname();
	const router = useRouter();
	const { isAnyPlaying, timerRemaining, stopAll } = useSoundContext();

	// Only show when playing and NOT on relax page
	if (!isAnyPlaying || pathname === "/relax") return null;

	return (
		<div className="fixed bottom-14 left-0 right-0 z-40">
			<div className="max-w-md mx-auto px-3">
				<div
					onClick={() => router.push("/relax")}
					className="bg-[var(--color-primary)]/20 backdrop-blur-md border border-[var(--color-primary)]/30 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer shadow-lg"
				>
					<div className="flex items-center gap-2 min-w-0">
						<span className="text-lg animate-pulse">{"\uD83C\uDFB5"}</span>
						<span className="text-sm font-medium truncate">
							{"\uC218\uBA74 \uC0AC\uC6B4\uB4DC \uC7AC\uC0DD \uC911"}
						</span>
						{timerRemaining !== null && (
							<span className="text-xs text-[var(--color-muted)] ml-1">
								{FormatSeconds(timerRemaining)}
							</span>
						)}
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							stopAll();
						}}
						className="ml-2 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold cursor-pointer hover:bg-red-500/30 transition-colors"
					>
						{"\uC815\uC9C0"}
					</button>
				</div>
			</div>
		</div>
	);
}
