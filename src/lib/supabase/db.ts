import { createClient } from "./client";

const supabase = () => createClient();

// ── 필드 변환 (camelCase ↔ snake_case) ──

// 프론트엔드 → DB 변환 맵 (수면 일지)
const DIARY_FIELD_MAP: Record<string, string> = {
  bedtime: "bedtime",
  wakeTime: "wake_time",
  sleepOnsetLatency: "sleep_onset_latency",
  awakenings: "awakenings",
  waso: "waso",
  sleepQuality: "sleep_quality",
  morningMood: "morning_mood",
  totalSleepTime: "total_sleep_time",
  sleepEfficiency: "sleep_efficiency",
  stressLevel: "stress_level",
  caffeine: "caffeine",
  caffeineLastTime: "caffeine_last_time",
  exercise: "exercise",
  exerciseType: "exercise_type",
  nap: "nap",
  napDuration: "nap_duration",
  worryNote: "worry_note",
};

// DB → 프론트엔드 역변환 맵
const DIARY_FIELD_MAP_REVERSE: Record<string, string> = {};
for (const [k, v] of Object.entries(DIARY_FIELD_MAP)) {
  DIARY_FIELD_MAP_REVERSE[v] = k;
}

/** 프론트엔드 diary entry → DB 컬럼명 변환 */
export function diaryToDb(entry: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry)) {
    const dbKey = DIARY_FIELD_MAP[key];
    if (dbKey && value !== undefined) {
      result[dbKey] = value;
    }
  }
  return result;
}

/** DB 행 → 프론트엔드 diary entry 변환 */
export function dbToDiary(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { date: row.date };
  for (const [key, value] of Object.entries(row)) {
    const frontKey = DIARY_FIELD_MAP_REVERSE[key];
    if (frontKey && value != null) {
      result[frontKey] = value;
    }
  }
  return result;
}

// ── 수면 일지 ──

export async function saveDiaryEntry(
  userId: string,
  date: string,
  data: Record<string, unknown>,
) {
  const sb = supabase();
  const { error } = await sb
    .from("sleep_diary")
    .upsert(
      { user_id: userId, date, ...data },
      { onConflict: "user_id,date" },
    );
  return { error };
}

export async function getDiaryEntries(userId: string) {
  const sb = supabase();
  const { data, error } = await sb
    .from("sleep_diary")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  return { data, error };
}

// ── 미션 로그 ──

export async function toggleMission(
  userId: string,
  missionKey: string,
  completed: boolean,
) {
  const sb = supabase();
  if (completed) {
    const { error } = await sb
      .from("mission_logs")
      .upsert(
        { user_id: userId, mission_key: missionKey, completed: true },
        { onConflict: "user_id,mission_key" },
      );
    return { error };
  } else {
    const { error } = await sb
      .from("mission_logs")
      .delete()
      .eq("user_id", userId)
      .eq("mission_key", missionKey);
    return { error };
  }
}

export async function getMissionLogs(userId: string) {
  const sb = supabase();
  const { data, error } = await sb
    .from("mission_logs")
    .select("mission_key, completed")
    .eq("user_id", userId);
  const map: Record<string, boolean> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?.forEach((row: any) => {
    map[row.mission_key] = row.completed;
  });
  return { data: map, error };
}

// ── 세션 진행 ──

export async function saveSessionProgress(
  userId: string,
  progress: {
    completedSections: Record<string, boolean>;
    practiceChecks: Record<string, boolean>;
    reflectionText: Record<string, string>;
  },
) {
  const sb = supabase();
  const { error } = await sb
    .from("session_progress")
    .upsert(
      {
        user_id: userId,
        completed_sections: progress.completedSections,
        practice_checks: progress.practiceChecks,
        reflection_text: progress.reflectionText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  return { error };
}

export async function getSessionProgress(userId: string) {
  const sb = supabase();
  const { data, error } = await sb
    .from("session_progress")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { data, error };
}

// ── ISI 진단 ──

export async function saveAssessment(
  userId: string,
  scores: number[],
  totalScore: number,
  severity: string,
) {
  const sb = supabase();
  const { error } = await sb
    .from("assessments")
    .insert({
      user_id: userId,
      scores,
      total_score: totalScore,
      severity,
    });
  return { error };
}

export async function getAssessments(userId: string) {
  const sb = supabase();
  const { data, error } = await sb
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ── 프로필 ──

export async function getProfile(userId: string) {
  const sb = supabase();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function updateProfile(
  userId: string,
  profile: Record<string, unknown>,
) {
  const sb = supabase();
  const { error } = await sb
    .from("profiles")
    .update(profile)
    .eq("id", userId);
  return { error };
}
