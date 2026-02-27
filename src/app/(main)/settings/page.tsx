"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile, getDiaryEntries, getMissionLogs } from "@/lib/supabase/db";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { HeaderStars } from "@/components/ui/SleepIllustrations";
import { Toggle } from "@/components/ui/Toggle";
import { useNotification } from "@/hooks/useNotification";

interface UserProfile {
  name: string;
  startDate: string;
  currentWeek: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, close, success, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    startDate: "",
    currentWeek: 1,
  });
  const [showReset, setShowReset] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  const [missionCount, setMissionCount] = useState(0);
  const notification = useNotification();

  useEffect(() => {
    async function loadSettings() {
      if (user) {
        // Supabase에서 프로필 로드
        const { data: profileData } = await getProfile(user.id);
        if (profileData) {
          setProfile({
            name: profileData.name || user.user_metadata?.name || "",
            startDate: profileData.start_date || new Date().toISOString().split("T")[0],
            currentWeek: profileData.current_week || 1,
          });
        }
        // Supabase에서 통계 로드
        const { data: diaryData } = await getDiaryEntries(user.id);
        if (diaryData) setDiaryCount(diaryData.length);
        const { data: missionData } = await getMissionLogs(user.id);
        if (missionData) setMissionCount(Object.values(missionData).filter(Boolean).length);
      } else {
        // localStorage 폴백
        try {
          const data = JSON.parse(localStorage.getItem("userProfile") || "{}");
          if (data.name) {
            setProfile(data);
          } else {
            setProfile((prev) => ({
              ...prev,
              startDate: new Date().toISOString().split("T")[0],
            }));
          }
          setDiaryCount(JSON.parse(localStorage.getItem("sleepDiary") || "[]").length);
          const checks = JSON.parse(localStorage.getItem("missionLog") || "{}");
          setMissionCount(Object.values(checks).filter(Boolean).length);
        } catch { /* localStorage 데이터 손상 시 기본값 유지 */ }
      }
      setLoading(false);
    }
    loadSettings();
  }, [user]);

  async function saveProfileHandler() {
    localStorage.setItem("userProfile", JSON.stringify(profile));

    if (user) {
      const { error } = await updateProfile(user.id, {
        name: profile.name,
        start_date: profile.startDate,
        current_week: profile.currentWeek,
      });
      if (error) {
        info("로컬에 저장되었습니다 (서버 동기화 실패)");
        return;
      }
    }

    success("프로필이 저장되었습니다");
  }

  function exportData() {
    const allData = {
      profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
      sleepDiary: JSON.parse(localStorage.getItem("sleepDiary") || "[]"),
      missionLog: JSON.parse(localStorage.getItem("missionLog") || "{}"),
      sessionProgress: JSON.parse(localStorage.getItem("sessionProgress") || "{}"),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sleepwell-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    info("데이터가 다운로드되었습니다");
  }

  async function resetAllData() {
    localStorage.removeItem("sleepDiary");
    localStorage.removeItem("missionLog");
    localStorage.removeItem("sessionProgress");
    localStorage.removeItem("userProfile");

    // Supabase 서버 데이터도 삭제
    if (user) {
      const sb = createClient();
      if (sb) {
        await Promise.all([
          sb.from("sleep_diary").delete().eq("user_id", user.id),
          sb.from("mission_logs").delete().eq("user_id", user.id),
          sb.from("session_progress").delete().eq("user_id", user.id),
          sb.from("assessments").delete().eq("user_id", user.id),
        ]);
      }
    }

    setProfile({ name: "", startDate: new Date().toISOString().split("T")[0], currentWeek: 1 });
    setShowReset(false);
    window.location.reload();
  }

  if (loading) return <PageSkeleton cards={4} />;

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-24 animate-fade-in">
      <ToastContainer toasts={toasts} onClose={close} />

      {/* ━━━━━ 헤더 ━━━━━ */}
      <section
        className="relative px-6 pt-8 pb-6"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight">설정</h1>
              <HeaderStars />
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              프로필 및 앱 설정을 관리하세요
            </p>
          </div>

          {/* 프로필 아바타 영역 */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--color-primary-light)",
            }}
          >
            {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
          </div>
        </div>
      </section>

      <div className="px-6 space-y-4">

        {/* ━━━ 프로필 섹션 ━━━ */}
        <section className="animate-slide-up" aria-label="프로필 설정">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            프로필
          </h2>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block font-medium">이름</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="이름을 입력하세요"
                  className="w-full bg-[var(--color-background)] rounded-xl p-3 text-sm outline-none transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block font-medium">프로그램 시작일</label>
                <input
                  type="date"
                  value={profile.startDate}
                  onChange={(e) => setProfile({ ...profile, startDate: e.target.value })}
                  className="w-full bg-[var(--color-background)] rounded-xl p-3 text-sm outline-none transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block font-medium">현재 주차</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((w) => (
                    <button
                      key={w}
                      onClick={() => setProfile({ ...profile, currentWeek: w })}
                      className={cn(
                        "w-10 h-10 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200",
                        "active:scale-95",
                        profile.currentWeek === w
                          ? "text-white"
                          : "bg-[var(--color-background)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                      )}
                      style={profile.currentWeek === w ? {
                        background: "linear-gradient(135deg, #818cf8, #6366f1)",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                      } : {
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" size="md" onClick={saveProfileHandler} className="w-full">
                프로필 저장
              </Button>
            </div>
          </div>
        </section>

        {/* ━━━ 알림 설정 섹션 ━━━ */}
        <section className="animate-slide-up delay-75" aria-label="알림 설정">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            알림 설정
          </h2>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {!notification.supported ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  이 브라우저는 알림을 지원하지 않습니다.
                </p>
              </div>
            ) : notification.settings.permissionStatus === "denied" ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.1)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-medium">알림 권한이 차단되었습니다</p>
                    <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                      브라우저 설정에서 이 사이트의 알림을 허용해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Toggle
                  label="알림 받기"
                  description="리마인더 알림을 켜거나 끕니다"
                  checked={notification.settings.globalEnabled}
                  onChange={(checked) => notification.toggleGlobal(checked)}
                />
                {notification.settings.globalEnabled && (
                  <div className="space-y-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {notification.settings.reminders.map((reminder) => (
                      <div key={reminder.type} className="space-y-2">
                        <Toggle
                          label={reminder.label}
                          checked={reminder.enabled}
                          onChange={(checked) => notification.toggleReminder(reminder.type, checked)}
                        />
                        {reminder.enabled && (
                          <div className="pl-2">
                            <input
                              type="time"
                              value={reminder.time}
                              onChange={(e) => notification.updateReminderTime(reminder.type, e.target.value)}
                              className="bg-[var(--color-background)] rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200"
                              style={{
                                border: "1px solid rgba(255,255,255,0.06)",
                                colorScheme: "dark",
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ━━━ 계정 정보 (로그인 시) ━━━ */}
        {user && (
          <section className="animate-slide-up delay-150" aria-label="계정 정보">
            <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              계정 정보
            </h2>
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted)]">이메일</span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                  >
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
                  <span className="text-[var(--color-muted)]">로그인 방식</span>
                  <span>{user.app_metadata?.provider === "google" ? "Google" : "이메일"}</span>
                </div>
                <div className="flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
                  <span className="text-[var(--color-muted)]">데이터 저장</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block animate-pulse" />
                    <span className="text-[var(--color-success)] text-xs font-medium">클라우드 동기화</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ━━━ 내 데이터 요약 ━━━ */}
        <section className="animate-slide-up delay-200" aria-label="내 데이터">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            내 데이터
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1), var(--color-surface))",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />
              <p className="text-xs text-[var(--color-muted)] relative">수면 일지</p>
              <p className="text-2xl font-bold text-[var(--color-primary-light)] mt-1 relative">{diaryCount}<span className="text-sm font-normal">일</span></p>
            </div>
            <div
              className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.1), var(--color-surface))",
                border: "1px solid rgba(167,139,250,0.15)",
              }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)" }} />
              <p className="text-xs text-[var(--color-muted)] relative">완료 미션</p>
              <p className="text-2xl font-bold text-[var(--color-accent)] mt-1 relative">{missionCount}<span className="text-sm font-normal">개</span></p>
            </div>
          </div>
        </section>

        {/* ━━━ 데이터 관리 섹션 ━━━ */}
        <section className="animate-slide-up delay-300" aria-label="데이터 관리">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
              <polyline points="21,8 21,21 3,21 3,8" />
              <rect x="1" y="3" width="22" height="5" rx="1" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            데이터 관리
          </h2>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
              데이터를 JSON 파일로 백업하거나 모든 데이터를 초기화할 수 있습니다.
            </p>
            <div className="space-y-3">
              <Button variant="secondary" size="md" onClick={exportData} className="w-full">
                데이터 내보내기 (JSON)
              </Button>
              {!showReset ? (
                <button
                  onClick={() => setShowReset(true)}
                  className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-500/15 active:scale-[0.98]"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    color: "#f87171",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    모든 데이터 초기화
                  </span>
                </button>
              ) : (
                <div
                  className="rounded-xl p-4 animate-scale-in"
                  style={{
                    background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.25)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.15)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-red-400 font-medium">
                        정말 모든 데이터를 삭제하시겠습니까?
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                        수면 일지, 미션 기록, 세션 진행 상황이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowReset(false)}>
                      취소
                    </Button>
                    <button
                      onClick={resetAllData}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500 text-white cursor-pointer active:scale-95 transition-transform"
                    >
                      삭제 확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ━━━ 로그아웃 / 회원탈퇴 (로그인 사용자만) ━━━ */}
        {user && (
          <section className="animate-slide-up delay-400 space-y-3" aria-label="계정 관리">
            <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              계정 관리
            </h2>
            <button
              onClick={async () => {
                const supabase = createClient();
                if (supabase) {
                  await supabase.auth.signOut();
                }
                router.push("/login");
                router.refresh();
              }}
              className="w-full py-3 rounded-2xl text-sm font-medium cursor-pointer transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "var(--color-muted)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
            >
              로그아웃
            </button>

            {!showDeleteAccount ? (
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full py-3 rounded-2xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-500/15 active:scale-[0.98]"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  color: "#f87171",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  회원탈퇴
                </span>
              </button>
            ) : (
              <div
                className="rounded-2xl p-4 animate-scale-in"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.25)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.15)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-red-400 font-medium">
                      정말 탈퇴하시겠습니까?
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-1 leading-relaxed">
                      계정과 모든 데이터(수면 일지, 미션 기록, 세션, 채팅 등)가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteAccount(false)}
                  >
                    취소
                  </Button>
                  <button
                    onClick={async () => {
                      setDeletingAccount(true);
                      try {
                        const res = await fetch("/api/user/delete", { method: "POST" });
                        if (!res.ok) {
                          const body = await res.json();
                          alert(body.error || "회원탈퇴에 실패했습니다.");
                          return;
                        }
                        localStorage.clear();
                        router.push("/");
                        router.refresh();
                      } catch {
                        alert("회원탈퇴 중 오류가 발생했습니다.");
                      } finally {
                        setDeletingAccount(false);
                      }
                    }}
                    disabled={deletingAccount}
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500 text-white cursor-pointer disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    {deletingAccount ? "처리 중..." : "탈퇴 확인"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ━━━ 앱 정보 ━━━ */}
        <section className="animate-slide-up delay-500 pb-4" aria-label="앱 정보">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            앱 정보
          </h2>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-light))",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">앱 이름</span>
                <span className="font-medium">SleepWell DTx</span>
              </div>
              <div className="flex justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
                <span className="text-[var(--color-muted)]">버전</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-md font-mono"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                >
                  v1.0.0
                </span>
              </div>
              <div className="flex justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
                <span className="text-[var(--color-muted)]">기반 치료법</span>
                <span className="font-medium">CBT-I</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-4 leading-relaxed" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
              SleepWell DTx는 인지행동치료(CBT-I)에 기반한 불면증 디지털 치료제 프로토타입입니다.
              의료 기기가 아니며, 전문적인 진단이나 치료를 대체하지 않습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
