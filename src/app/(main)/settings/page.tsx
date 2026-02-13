"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface UserProfile {
  name: string;
  startDate: string;
  currentWeek: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    startDate: "",
    currentWeek: 1,
  });
  const [showReset, setShowReset] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saved, setSaved] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  const [missionCount, setMissionCount] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userProfile") || "{}");
    if (data.name) {
      setProfile(data);
    } else {
      setProfile((prev) => ({
        ...prev,
        startDate: new Date().toISOString().split("T")[0],
      }));
    }
    // 통계 로드
    setDiaryCount(JSON.parse(localStorage.getItem("sleepDiary") || "[]").length);
    const checks = JSON.parse(localStorage.getItem("missionChecks") || "{}");
    setMissionCount(Object.values(checks).filter(Boolean).length);
  }, []);

  function saveProfile() {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportData() {
    const allData = {
      profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
      sleepDiary: JSON.parse(localStorage.getItem("sleepDiary") || "[]"),
      missionLog: JSON.parse(localStorage.getItem("missionChecks") || "{}"),
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
    URL.revokeObjectURL(url);
    setShowExport(true);
    setTimeout(() => setShowExport(false), 3000);
  }

  function resetAllData() {
    localStorage.removeItem("sleepDiary");
    localStorage.removeItem("missionChecks");
    localStorage.removeItem("sessionProgress");
    localStorage.removeItem("userProfile");
    setProfile({ name: "", startDate: new Date().toISOString().split("T")[0], currentWeek: 1 });
    setShowReset(false);
    window.location.reload();
  }

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">설정</h1>
        <p className="text-sm text-[var(--color-muted)]">
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
            <Button variant="primary" size="md" onClick={saveProfile}>
              {saved ? "저장 완료!" : "프로필 저장"}
            </Button>
          </div>
        </div>

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
              {showExport ? "다운로드 완료!" : "데이터 내보내기 (JSON)"}
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
