"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

// 수면 데이터 컨텍스트 생성
function buildSleepContext(): string {
  try {
    const diaryRaw = localStorage.getItem("sleepDiary");
    if (!diaryRaw) return "수면 기록이 없습니다.";

    const diary = JSON.parse(diaryRaw);
    if (!diary.length) return "수면 기록이 없습니다.";

    const recent = diary.slice(-7);
    const lines: string[] = [];

    lines.push(`총 기록 일수: ${diary.length}일`);
    lines.push(`최근 ${recent.length}일 데이터:`);

    for (const entry of recent) {
      const parts: string[] = [`- ${entry.date}:`];
      if (entry.totalSleepTime)
        parts.push(
          `수면시간 ${Math.floor(entry.totalSleepTime / 60)}시간 ${entry.totalSleepTime % 60}분`,
        );
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
      recent.reduce(
        (s: number, e: { totalSleepTime?: number }) =>
          s + (e.totalSleepTime || 0),
        0,
      ) / recent.length;
    const avgEfficiency =
      recent.reduce(
        (s: number, e: { sleepEfficiency?: number }) =>
          s + (e.sleepEfficiency || 0),
        0,
      ) / recent.length;
    lines.push(
      `\n평균 수면시간: ${Math.floor(avgSleep / 60)}시간 ${Math.round(avgSleep % 60)}분`,
    );
    lines.push(`평균 수면효율: ${Math.round(avgEfficiency)}%`);

    return lines.join("\n");
  } catch {
    return "수면 데이터를 불러올 수 없습니다.";
  }
}

const QUICK_QUESTIONS = [
  "잠이 안 와요, 어떻게 하면 좋을까요?",
  "수면 효율을 높이려면?",
  "내 수면 데이터를 분석해주세요",
  "자기 전 루틴 추천해주세요",
];

const WELCOME_TEXT =
  "안녕하세요! 저는 SleepWell AI 수면 코치입니다.\n\n수면에 관한 고민이 있으시면 편하게 말씀해주세요. 수면 일지 데이터를 바탕으로 개인화된 조언을 드릴 수 있어요.\n\n아래 질문을 선택하거나, 직접 입력해보세요!";

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sleepContextRef = useRef("");

  useEffect(() => {
    sleepContextRef.current = buildSleepContext();
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = text || inputText.trim();
    if (!msg || isLoading) return;

    setInputText("");
    setError("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: msg,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
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

      const assistantId = (Date.now() + 1).toString();

      // 스트리밍 응답 읽기
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("응답을 읽을 수 없습니다");
      }

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", text: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: m.text + chunk } : m,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      // 스트리밍 중 에러 시 빈 assistant 메시지 제거
      setMessages((prev) => prev.filter((m) => m.text !== ""));
    } finally {
      setIsLoading(false);
    }
  }

  const allMessages: ChatMessage[] = [
    { id: "welcome", role: "assistant", text: WELCOME_TEXT },
    ...messages,
  ];

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[var(--color-background)] border-b border-[var(--color-surface-light)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="text-lg font-bold">AI 수면 코치</h1>
            <p className="text-xs text-[var(--color-muted)]">
              CBT-I 기반 개인 맞춤 상담
            </p>
          </div>
          {isLoading && (
            <div className="ml-auto flex gap-1">
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

      {/* 메시지 영역 */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {allMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-[var(--color-primary)] text-white rounded-br-md"
                  : "bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-bl-md"
              }`}
            >
              {message.text}
            </div>
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

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-500/10 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
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
