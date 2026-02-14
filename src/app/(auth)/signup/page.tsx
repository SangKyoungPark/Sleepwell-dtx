"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase가 설정되지 않았습니다. .env.local 파일을 확인하세요.");
      setLoading(false);
      return;
    }

    // 회원가입
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 프로필에 이름 저장 (트리거로 생성된 프로필에 이름 업데이트)
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ name })
        .eq("id", data.user.id);
    }

    // 이메일 확인이 필요한 경우
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // 바로 로그인된 경우
    router.push("/onboarding");
    router.refresh();
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-5xl mb-4">📧</p>
          <h2 className="text-xl font-bold mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            <span className="text-[var(--color-primary-light)]">{email}</span>
            으로<br />인증 링크를 보냈습니다.
          </p>
          <p className="text-xs text-[var(--color-muted)] mb-8">
            이메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium"
          >
            로그인 페이지로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">🌙</p>
          <h1 className="text-3xl font-bold">
            Sleep<span className="text-[var(--color-primary-light)]">Well</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            더 나은 수면의 시작
          </p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              className="w-full bg-[var(--color-surface)] rounded-xl p-3.5 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
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
              placeholder="6자 이상"
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
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--color-surface-light)]" />
          <span className="text-xs text-[var(--color-muted)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-surface-light)]" />
        </div>

        {/* Google 회원가입 */}
        <button
          type="button"
          onClick={async () => {
            setError("");
            const supabase = createClient();
            if (!supabase) {
              setError("Supabase가 설정되지 않았습니다.");
              return;
            }
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });
            if (error) setError(error.message);
          }}
          className="w-full py-3.5 rounded-xl text-base font-medium bg-[var(--color-surface)] border border-[var(--color-surface-light)] cursor-pointer transition-colors hover:bg-[var(--color-surface-light)] flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 회원가입
        </button>

        <p className="text-center text-sm text-[var(--color-muted)] mt-6">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary-light)] font-medium"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
