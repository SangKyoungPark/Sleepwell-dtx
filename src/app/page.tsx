"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 로그인된 사용자 → 홈으로
        router.replace("/home");
      } else {
        // 비로그인 → 온보딩 완료 여부 확인
        const done = localStorage.getItem("onboardingDone");
        if (done === "true") {
          router.replace("/login");
        }
      }
    }
    checkAuth();
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

        <p className="text-sm text-[var(--color-muted)] mt-4">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--color-primary-light)] font-medium">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
