import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DATA_TABLES = [
  "chat_messages",
  "sleep_diary",
  "mission_logs",
  "session_progress",
  "assessments",
  "profiles",
] as const;

export async function POST() {
  // 1. 현재 로그인 사용자 확인
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 미설정" },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 },
    );
  }

  // 2. Admin 클라이언트 생성
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "서버 설정 오류 (service_role key 미설정)" },
      { status: 500 },
    );
  }

  // 3. 사용자 데이터 삭제 (데이터 테이블 → profiles → auth)
  for (const table of DATA_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    if (error) {
      console.error(`[회원탈퇴] ${table} 삭제 실패:`, error.message);
      return NextResponse.json(
        { error: `데이터 삭제 실패 (${table})` },
        { status: 500 },
      );
    }
  }

  // 4. Auth 사용자 삭제
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    console.error("[회원탈퇴] auth 삭제 실패:", authError.message);
    return NextResponse.json(
      { error: "계정 삭제 실패" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
