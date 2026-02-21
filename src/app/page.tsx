"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MoonIllustration, StarsBackground } from "@/components/ui/SleepIllustrations";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();

      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace("/home");
          return;
        }
      }

      // 비로그인 또는 Supabase 미설정 → 온보딩 완료 여부 확인
      const done = localStorage.getItem("onboardingDone");
      if (done === "true") {
        // Supabase 미설정 시 로그인 안 거치고 바로 홈
        router.replace(supabase ? "/login" : "/home");
      }
    }
    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* 0.0s - 별 배경 페이드인 */}
      <div className="absolute inset-0" style={{ animation: "fadeIn 1s ease-out 0s both" }}>
        <StarsBackground />
      </div>
      <div className="text-center max-w-md relative z-10">
        {/* 0.3s - 달 떠오르기 */}
        <div className="flex justify-center mb-4" style={{ animation: "moonRise 0.8s ease-out 0.3s both" }}>
          <MoonIllustration size={100} />
        </div>
        {/* 0.7s - 타이틀 페이드인 */}
        <h1 className="text-4xl font-bold mb-2" style={{ animation: "fadeIn 0.5s ease-out 0.7s both" }}>
          Sleep<span className="text-[var(--color-primary-light)]">Well</span>
        </h1>
        {/* 1.0s - 서브텍스트 슬라이드업 */}
        <p className="text-[var(--color-muted)] text-lg mb-2" style={{ animation: "slideUp 0.4s ease-out 1.0s both" }}>
          오늘 밤, 한 가지만 바꿔보세요
        </p>
        <p className="text-sm text-[var(--color-muted)] mb-10" style={{ animation: "slideUp 0.4s ease-out 1.1s both" }}>
          CBT-I 기반 불면증 자가관리 프로그램
        </p>

        {/* 1.3s - 버튼 바운스인 */}
        <Link
          href="/onboarding"
          className="inline-block w-full px-6 py-4 bg-[var(--color-primary)] text-white rounded-xl text-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors"
          style={{ animation: "bounceIn 0.6s ease-out 1.3s both" }}
        >
          시작하기
        </Link>

        {/* 1.6s - 로그인 링크 페이드인 */}
        <p className="text-sm text-[var(--color-muted)] mt-4" style={{ animation: "fadeIn 0.5s ease-out 1.6s both" }}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--color-primary-light)] font-medium">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
