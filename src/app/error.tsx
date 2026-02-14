"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <p className="text-4xl mb-4">😴</p>
      <h2 className="text-lg font-bold mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-[var(--color-muted)] text-center mb-6">
        예상치 못한 오류가 발생했어요.<br />
        다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm cursor-pointer"
      >
        다시 시도
      </button>
    </main>
  );
}
