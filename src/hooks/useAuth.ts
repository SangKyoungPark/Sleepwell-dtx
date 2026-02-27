"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Supabase 미설정 → 항상 비로그인 상태
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(async ({ data: { user: fetchedUser } }) => {
      if (fetchedUser) {
        // 자동로그인 체크: autoLogin이 false이고 sessionStorage 마커가 없으면 로그아웃
        const autoLogin = localStorage.getItem("autoLogin");
        const sessionActive = sessionStorage.getItem("sw_session_active");

        if (autoLogin === "false" && !sessionActive) {
          // 브라우저가 닫혔다 다시 열린 경우 → 로그아웃
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }

        // 새 탭 대응: 세션 마커 갱신
        sessionStorage.setItem("sw_session_active", "1");
      }
      setUser(fetchedUser);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
