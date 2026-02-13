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
    if (!supabase) {
      setError("Supabase가 설정되지 않았습니다. .env.local 파일을 확인하세요.");
      setLoading(false);
      return;
    }
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
