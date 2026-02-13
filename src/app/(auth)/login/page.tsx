"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다"
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full">
        {/* 로고 */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">🌙</p>
          <h1 className="text-3xl font-bold">
            Sleep<span className="text-[var(--color-primary-light)]">Well</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            다시 오신 것을 환영합니다
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full bg-[var(--color-surface)] rounded-xl p-3.5 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              minLength={6}
              className="w-full bg-[var(--color-surface)] rounded-xl p-3.5 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-base font-medium bg-[var(--color-primary)] text-white cursor-pointer disabled:opacity-50 transition-colors hover:bg-[var(--color-primary-light)]"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[var(--color-surface-light)]" />
            <span className="text-xs text-[var(--color-muted)]">또는</span>
            <div className="flex-1 h-px bg-[var(--color-surface-light)]" />
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            className="w-full py-3.5 rounded-xl text-sm font-medium bg-[var(--color-surface)] text-[var(--color-foreground)] cursor-pointer hover:bg-[var(--color-surface-light)] transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Google로 로그인
          </button>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-[var(--color-muted)] mt-6">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-primary-light)] font-medium"
          >
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
