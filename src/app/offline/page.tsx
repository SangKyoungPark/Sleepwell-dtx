"use client";

export default function OfflinePage() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
			<div className="text-6xl mb-6">🌙</div>
			<h1 className="text-xl font-bold mb-2">오프라인 상태예요</h1>
			<p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">
				인터넷 연결이 끊겼어요.<br />
				연결이 복구되면 다시 시도해 주세요.
			</p>
			<button
				onClick={() => window.location.reload()}
				className="px-6 py-3 rounded-2xl text-sm font-medium bg-[var(--color-primary)] text-white cursor-pointer hover:opacity-90 transition-opacity"
			>
				다시 시도
			</button>
		</main>
	);
}
