import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-2">
          Sleep<span className="text-[var(--color-primary-light)]">Well</span>
        </h1>
        <p className="text-[var(--color-muted)] text-lg mb-2">
          오늘 밤, 한 가지만 바꿔보세요
        </p>
        <p className="text-sm text-[var(--color-muted)] mb-10">
          CBT-I 기반 불면증 자가관리 프로그램
        </p>

        <Link
          href="/assessment"
          className="inline-block w-full px-6 py-4 bg-[var(--color-primary)] text-white rounded-xl text-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors"
        >
          불면증 자가진단 시작
        </Link>

        <p className="text-xs text-[var(--color-muted)] mt-4">
          약 2분 소요 · ISI 7문항
        </p>
      </div>
    </main>
  );
}
