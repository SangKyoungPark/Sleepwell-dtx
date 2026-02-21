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
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20 animate-fade-in">
      <ToastContainer toasts={toasts} onClose={close} />
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">설정</h1>
          <HeaderStars />
        </div>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          프로필 및 앱 설정
        </p>
      </div>

      <div className="space-y-4">
        {/* 프로필 */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-4">
            프로필
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--color-muted)] mb-1 block">이름</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="이름을 입력하세요"
                className="w-full bg-[var(--color-background)] rounded-xl p-3 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] mb-1 block">프로그램 시작일</label>
              <input
                type="date"
                value={profile.startDate}
                onChange={(e) => setProfile({ ...profile, startDate: e.target.value })}
                className="w-full bg-[var(--color-background)] rounded-xl p-3 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)] mb-1 block">현재 주차</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <button
                    key={w}
                    onClick={() => setProfile({ ...profile, currentWeek: w })}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-medium cursor-pointer transition-colors",
                      profile.currentWeek === w
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-light)] text-[var(--color-muted)]",
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="primary" size="md" onClick={saveProfileHandler}>
              프로필 저장
            </Button>
          </div>
        </div>

        {/* 계정 정보 (로그인 시) */}
        {user && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
              계정 정보
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">이메일</span>
                <span className="text-[var(--color-primary-light)]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">로그인 방식</span>
                <span>{user.app_metadata?.provider === "google" ? "Google" : "이메일"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">데이터 저장</span>
                <span className="text-[var(--color-success)]">클라우드 동기화</span>
              </div>
            </div>
          </div>
        )}

        {/* 내 데이터 요약 */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
            내 데이터
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--color-muted)]">수면 일지</p>
              <p className="text-xl font-bold text-[var(--color-primary-light)]">{diaryCount}일</p>
            </div>
            <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--color-muted)]">완료 미션</p>
              <p className="text-xl font-bold text-[var(--color-accent)]">{missionCount}개</p>
            </div>
          </div>
        </div>

        {/* 데이터 내보내기 */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-2">
            데이터 관리
          </h3>
          <p className="text-xs text-[var(--color-muted)] mb-4">
            데이터를 JSON 파일로 백업하거나 모든 데이터를 초기화할 수 있습니다.
          </p>
          <div className="space-y-2">
            <Button variant="secondary" size="md" onClick={exportData}>
              데이터 내보내기 (JSON)
            </Button>
            {!showReset ? (
              <button
                onClick={() => setShowReset(true)}
                className="w-full py-2.5 rounded-xl text-sm text-red-400 bg-red-500/10 cursor-pointer"
              >
                모든 데이터 초기화
              </button>
            ) : (
              <div className="bg-red-500/10 rounded-xl p-4">
                <p className="text-sm text-red-400 font-medium mb-2">
                  정말 모든 데이터를 삭제하시겠습니까?
                </p>
                <p className="text-xs text-[var(--color-muted)] mb-3">
                  수면 일지, 미션 기록, 세션 진행 상황이 모두 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowReset(false)}>
                    취소
                  </Button>
                  <button
                    onClick={resetAllData}
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500 text-white cursor-pointer"
                  >
                    삭제 확인
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 로그아웃 / 회원탈퇴 (로그인 사용자만) */}
        {user && (
          <div className="space-y-2">
            <button
              onClick={async () => {
                const supabase = createClient();
                if (supabase) {
                  await supabase.auth.signOut();
                }
                router.push("/login");
                router.refresh();
              }}
              className="w-full py-3 rounded-2xl text-sm font-medium bg-[var(--color-surface)] text-[var(--color-muted)] cursor-pointer hover:text-white transition-colors"
            >
              로그아웃
            </button>

            {!showDeleteAccount ? (
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full py-3 rounded-2xl text-sm font-medium bg-red-500/10 text-red-400 cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                회원탈퇴
              </button>
            ) : (
              <div className="bg-red-500/10 rounded-2xl p-4">
                <p className="text-sm text-red-400 font-medium mb-2">
                  정말 탈퇴하시겠습니까?
                </p>
                <p className="text-xs text-[var(--color-muted)] mb-3">
                  계정과 모든 데이터(수면 일지, 미션 기록, 세션, 채팅 등)가 영구 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </p>
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
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500 text-white cursor-pointer disabled:opacity-50"
                  >
                    {deletingAccount ? "처리 중..." : "탈퇴 확인"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 앱 정보 */}
        <div className="bg-[var(--color-surface)] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">
            앱 정보
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">앱 이름</span>
              <span>SleepWell DTx</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">버전</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">기반 치료법</span>
              <span>CBT-I</span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-4 leading-relaxed">
            SleepWell DTx는 인지행동치료(CBT-I)에 기반한 불면증 디지털 치료제 프로토타입입니다.
            의료 기기가 아니며, 전문적인 진단이나 치료를 대체하지 않습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
