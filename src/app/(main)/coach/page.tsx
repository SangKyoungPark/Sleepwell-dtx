"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  saveChatMessage,
  getChatMessages,
  getLatestSessionId,
  getDiaryEntries,
} from "@/lib/supabase/db";
import { dbToDiary } from "@/lib/supabase/db";
import MarkdownText from "@/components/ui/MarkdownText";
import type { ChatMessage } from "@/types";
import { CoachCharacter } from "@/components/ui/SleepIllustrations";

// ── 수면 데이터 컨텍스트 빌드 ──

function formatDiaryEntries(diary: Record<string, unknown>[]): string {
  if (!diary.length) return "수면 기록이 없습니다.";

  const recent = diary.slice(-7);
  const lines: string[] = [];

  lines.push(`총 기록 일수: ${diary.length}일`);
  lines.push(`최근 ${recent.length}일 데이터:`);

  for (const entry of recent) {
    const parts: string[] = [`- ${entry.date}:`];
    const tst = entry.totalSleepTime as number | undefined;
    if (tst) parts.push(`수면시간 ${Math.floor(tst / 60)}시간 ${tst % 60}분`);
    if (entry.sleepEfficiency) parts.push(`수면효율 ${entry.sleepEfficiency}%`);
    if (entry.sleepQuality) parts.push(`수면품질 ${entry.sleepQuality}/5`);
    if (entry.sleepOnsetLatency) parts.push(`입면잠복기 ${entry.sleepOnsetLatency}분`);
    if (entry.awakenings) parts.push(`깬횟수 ${entry.awakenings}회`);
    if (entry.morningMood) parts.push(`아침기분: ${entry.morningMood}`);
    if (entry.stressLevel) parts.push(`스트레스 ${entry.stressLevel}/10`);
    if (entry.caffeine) parts.push(`카페인 섭취`);
    if (entry.exercise) parts.push(`운동함`);
    lines.push(parts.join(", "));
  }

  const avgSleep =
    recent.reduce((s, e) => s + ((e.totalSleepTime as number) || 0), 0) / recent.length;
  const avgEfficiency =
    recent.reduce((s, e) => s + ((e.sleepEfficiency as number) || 0), 0) / recent.length;
  lines.push(`\n평균 수면시간: ${Math.floor(avgSleep / 60)}시간 ${Math.round(avgSleep % 60)}분`);
  lines.push(`평균 수면효율: ${Math.round(avgEfficiency)}%`);

  return lines.join("\n");
}

/** Supabase → localStorage 폴백으로 수면 데이터 컨텍스트 생성 */
async function buildSleepContext(userId: string | null): Promise<string> {
  try {
    // 로그인 사용자 → Supabase
    if (userId) {
      const { data, error } = await getDiaryEntries(userId);
      if (!error && data && data.length > 0) {
        const diary = data.map((row: Record<string, unknown>) => dbToDiary(row));
        return formatDiaryEntries(diary);
      }
    }

    // 비로그인 또는 Supabase 실패 → localStorage 폴백
    const diaryRaw = localStorage.getItem("sleepDiary");
    if (!diaryRaw) return "수면 기록이 없습니다.";
    const diary = JSON.parse(diaryRaw);
    if (!diary.length) return "수면 기록이 없습니다.";
    return formatDiaryEntries(diary);
  } catch {
    return "수면 데이터를 불러올 수 없습니다.";
  }
}

// ── 상수 ──

const QUICK_QUESTIONS = [
  "잠이 안 와요, 어떻게 하면 좋을까요?",
  "수면 효율을 높이려면?",
  "내 수면 데이터를 분석해주세요",
  "자기 전 루틴 추천해주세요",
];

const WELCOME_TEXT =
  "안녕하세요! 저는 SleepWell AI 수면 코치입니다.\n\n수면에 관한 고민이 있으시면 편하게 말씀해주세요. 수면 일지 데이터를 바탕으로 개인화된 조언을 드릴 수 있어요.\n\n아래 질문을 선택하거나, 직접 입력해보세요!";

// (6) 추천 질문 — 카테고리별
const FOLLOW_UP_QUESTIONS: { keywords: string[]; text: string }[] = [
  { keywords: ["수면효율", "효율", "%"], text: "수면효율을 더 높이려면 어떻게 해야 하나요?" },
  { keywords: ["스트레스", "불안", "걱정"], text: "잠자리에서 걱정을 멈추는 방법이 있나요?" },
  { keywords: ["카페인", "커피", "차"], text: "카페인이 수면에 미치는 영향이 궁금해요" },
  { keywords: ["루틴", "습관", "위생"], text: "수면 위생 체크리스트를 알려주세요" },
  { keywords: ["운동", "활동"], text: "수면에 도움 되는 운동 시간대가 있나요?" },
  { keywords: ["잠복기", "잠이 안", "입면"], text: "누워서 30분 넘게 잠이 안 오면 어떻게 하나요?" },
  { keywords: ["깬", "각성", "중간"], text: "밤에 자주 깨는 원인과 해결법을 알려주세요" },
  { keywords: ["침대", "자극", "제한"], text: "자극 조절법이 뭔지 자세히 설명해주세요" },
  { keywords: ["이완", "명상", "호흡"], text: "잠들기 전 이완 기법을 알려주세요" },
];

function getFollowUpQuestions(lastAssistantText: string): string[] {
  const lower = lastAssistantText.toLowerCase();
  const matched = FOLLOW_UP_QUESTIONS.filter((q) =>
    q.keywords.some((kw) => lower.includes(kw)),
  ).map((q) => q.text);

  // 매칭 없으면 일반 추천
  if (matched.length === 0) {
    return ["수면 효율을 높이려면?", "오늘 밤 꿀잠 자는 팁 알려주세요", "내 수면 데이터를 분석해주세요"];
  }
  return matched.slice(0, 3);
}

// ── 세션 ID 유틸 ──

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── 컴포넌트 ──

export default function CoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sleepContextRef = useRef("");
  const initDoneRef = useRef(false);

  // (1) 초기 로드: 세션 복원 + 수면 데이터 로드
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    async function init() {
      const userId = user?.id ?? null;

      // 수면 데이터 (2) Supabase 연동
      sleepContextRef.current = await buildSleepContext(userId);

      // 대화 기록 복원
      if (userId) {
        // Supabase에서 최근 세션 불러오기
        const { data: latestSid } = await getLatestSessionId(userId);
        if (latestSid) {
          setSessionId(latestSid);
          const { data: rows } = await getChatMessages(userId, latestSid);
          if (rows && rows.length > 0) {
            const restored: ChatMessage[] = rows.map(
              (r: { id: string; role: string; content: string }) => ({
                id: r.id,
                role: r.role as "user" | "assistant",
                text: r.content,
                status: "done" as const,
              }),
            );
            setMessages(restored);
            return;
          }
        }
      }

      // localStorage 폴백
      const savedSid = localStorage.getItem("coachSessionId");
      const savedMsgs = localStorage.getItem("coachMessages");
      if (savedSid && savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs) as ChatMessage[];
          if (parsed.length > 0) {
            setSessionId(savedSid);
            setMessages(parsed.map((m) => ({ ...m, status: "done" })));
            return;
          }
        } catch { /* ignore */ }
      }

      // 새 세션
      const newSid = generateSessionId();
      setSessionId(newSid);
      localStorage.setItem("coachSessionId", newSid);
    }

    init();
  }, [user]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // localStorage 동기화
  const syncLocalStorage = useCallback(
    (msgs: ChatMessage[], sid: string) => {
      const toSave = msgs.filter((m) => m.status !== "error");
      localStorage.setItem("coachMessages", JSON.stringify(toSave));
      localStorage.setItem("coachSessionId", sid);
    },
    [],
  );

  // (4) 에러 시 재전송
  function handleRetry(failedMessage: ChatMessage) {
    // 에러 메시지 제거 후 다시 전송
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));
    handleSend(failedMessage.text);
  }

  // (5) 새 대화 시작
  function handleNewChat() {
    const newSid = generateSessionId();
    setSessionId(newSid);
    setMessages([]);
    localStorage.setItem("coachSessionId", newSid);
    localStorage.setItem("coachMessages", "[]");
  }

  // 메시지 전송 (스트리밍)
  async function handleSend(text?: string) {
    const msg = text || inputText.trim();
    if (!msg || isLoading) return;

    setInputText("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: msg,
      status: "sending",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setIsStreaming(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.status !== "error")
            .map((m) => ({
              role: m.role,
              content: m.text,
            })),
          sleepContext: sleepContextRef.current,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `서버 오류 (${res.status})`);
      }

      // user 메시지를 done으로 업데이트
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "done" } : m)),
      );

      const assistantId = (Date.now() + 1).toString();
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("응답을 읽을 수 없습니다");

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", text: "", status: "sending" },
      ]);

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!isStreaming) setIsStreaming(true);

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        const currentText = fullText;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: currentText } : m,
          ),
        );
      }

      // 완료 — status를 done으로
      setMessages((prev) => {
        const final = prev.map((m) =>
          m.id === assistantId ? { ...m, status: "done" as const } : m,
        );

        // DB + localStorage 저장
        const userId = user?.id;
        if (userId && sessionId) {
          saveChatMessage(userId, sessionId, "user", msg);
          saveChatMessage(userId, sessionId, "assistant", fullText);
        }
        syncLocalStorage(final, sessionId);

        return final;
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "알 수 없는 오류";
      // user 메시지를 error 상태로 변경
      setMessages((prev) => {
        const updated = prev
          .filter((m) => m.role !== "assistant" || m.text !== "") // 빈 assistant 제거
          .map((m) =>
            m.id === userMessage.id ? { ...m, status: "error" as const } : m,
          );
        return updated;
      });
      // 에러 메시지를 별도 상태 대신 user 메시지에 표시
      console.error("[Coach] 전송 실패:", errorMsg);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  // 표시용 메시지 (웰컴 + 실제 대화)
  const allMessages: ChatMessage[] = [
    { id: "welcome", role: "assistant", text: WELCOME_TEXT, status: "done" },
    ...messages,
  ];

  // (6) 추천 질문 표시 조건
  const lastMsg = messages[messages.length - 1];
  const showFollowUp =
    !isLoading &&
    lastMsg?.role === "assistant" &&
    lastMsg?.status === "done" &&
    lastMsg?.text.length > 0;
  const followUpQuestions = showFollowUp ? getFollowUpQuestions(lastMsg.text) : [];

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[var(--color-background)] border-b border-[var(--color-surface-light)] px-6 py-4">
        <div className="flex items-center gap-3">
          <CoachCharacter size={40} />
          <div>
            <h1 className="text-lg font-bold">AI 수면 코치</h1>
            <p className="text-xs text-[var(--color-muted)]">
              CBT-I 기반 개인 맞춤 상담
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* (5) 새 대화 버튼 */}
            {messages.length > 0 && !isLoading && (
              <button
                onClick={handleNewChat}
                className="px-3 py-1.5 text-xs bg-[var(--color-surface)] rounded-lg border border-[var(--color-surface-light)] hover:bg-[var(--color-surface-light)] transition-colors cursor-pointer"
              >
                + 새 대화
              </button>
            )}
            {/* 헤더 로딩 dots */}
            {isLoading && (
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-[var(--color-primary-light)] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[var(--color-primary-light)] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-[var(--color-primary-light)] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {allMessages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--color-primary)] text-white rounded-br-md whitespace-pre-wrap"
                    : "bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-bl-md"
                } ${message.status === "error" ? "opacity-60" : ""}`}
              >
                {/* (3) 마크다운 렌더링: assistant만 */}
                {message.role === "assistant" ? (
                  <MarkdownText text={message.text} />
                ) : (
                  message.text
                )}
              </div>
            </div>

            {/* (4) 에러 시 재전송 버튼 */}
            {message.status === "error" && (
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => handleRetry(message)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>⚠️</span> 전송 실패 — 다시 보내기
                </button>
              </div>
            )}
          </div>
        ))}

        {/* 빠른 질문 (대화 시작 전) */}
        {messages.length === 0 && (
          <div className="space-y-2 pt-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-4 py-3 bg-[var(--color-surface)] rounded-xl text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-light)] transition-colors cursor-pointer border border-[var(--color-surface-light)]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* (8) 타이핑 인디케이터 — 스트리밍 시작 전 */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface)] rounded-2xl rounded-bl-md px-4 py-3 text-sm text-[var(--color-muted)]">
              <div className="flex items-center gap-2">
                <span>코치가 답변을 작성 중이에요</span>
                <span className="flex gap-0.5">
                  <span
                    className="w-1 h-1 bg-[var(--color-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-[var(--color-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-[var(--color-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* (6) 대화 중 추천 질문 */}
        {showFollowUp && followUpQuestions.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-[var(--color-muted)] px-1">추천 질문</p>
            {followUpQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="block w-full text-left px-3 py-2.5 bg-[var(--color-surface)] rounded-xl text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-light)] transition-colors cursor-pointer border border-[var(--color-surface-light)]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="sticky bottom-16 bg-[var(--color-background)] border-t border-[var(--color-surface-light)] px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="수면 고민을 말씀해주세요..."
            disabled={isLoading}
            className="flex-1 bg-[var(--color-surface)] rounded-xl px-4 py-3 text-sm outline-none border border-[var(--color-surface-light)] focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm disabled:opacity-40 cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
          >
            전송
          </button>
        </form>
      </div>
    </main>
  );
}
