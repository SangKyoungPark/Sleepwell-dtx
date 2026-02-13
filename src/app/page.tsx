"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 온보딩 완료한 사용자는 홈으로 바로 이동
    const done = localStorage.getItem("onboardingDone");
    if (done === "true") {
      router.replace("/home");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-950 to-slate-900">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-6">🌙</p>
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
          href="/onboarding"
          className="inline-block w-full px-6 py-4 bg-[var(--color-primary)] text-white rounded-xl text-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors"
        >
          시작하기
        </Link>

        <p className="text-xs text-[var(--color-muted)] mt-4">
          6주 프로그램 · 매일 5분 투자
        </p>
      </div>
    </main>
  );
}
