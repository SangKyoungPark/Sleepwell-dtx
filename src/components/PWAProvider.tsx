"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

export function PWAProvider() {
	const { updateAvailable, applyUpdate, canInstall, promptInstall } = useServiceWorker();

	return (
		<>
			{/* 앱 설치 유도 배너 */}
			<InstallPrompt canInstall={canInstall} onInstall={promptInstall} />

			{/* 업데이트 토스트 */}
			{updateAvailable && (
				<div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
					<div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-lg border border-[var(--color-primary)]">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">새 버전이 있어요</p>
								<p className="text-xs text-[var(--color-muted)] mt-0.5">
									새로고침하면 업데이트됩니다
								</p>
							</div>
							<button
								onClick={applyUpdate}
								className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white cursor-pointer"
							>
								업데이트
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
