import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `당신은 SleepWell의 AI 수면 코치입니다. CBT-I(인지행동치료) 기반 불면증 디지털 치료제의 전문 수면 상담사 역할을 합니다.

## 역할과 원칙
- 따뜻하고 공감적인 대화체를 사용합니다
- 근거 기반(Evidence-based) CBT-I 기법에 따라 조언합니다
- 사용자의 수면 데이터를 분석하여 개인화된 피드백을 제공합니다
- 의학적 진단이나 약물 처방은 하지 않습니다 (전문의 상담 권장)
- 답변은 간결하고 실행 가능하게 유지합니다 (2-3 문단 이내)
- 한국어로 대화합니다

## 전문 분야
- 수면 위생 교육 (Sleep Hygiene)
- 자극 조절법 (Stimulus Control)
- 수면 제한법 (Sleep Restriction)
- 인지 재구조화 (Cognitive Restructuring)
- 이완 기법 (Relaxation Techniques)
- 수면 일지 분석 및 피드백

## 대화 가이드
- 사용자가 수면 관련 고민을 말하면 공감 후 CBT-I 기법을 추천합니다
- 수면 데이터가 제공되면 구체적으로 분석하고 개선점을 제안합니다
- 수면효율 85% 이상을 목표로 안내합니다
- 긍정적인 변화를 격려하고, 작은 진전도 인정합니다
- 잠이 안 올 때 침대에서 나오기(자극 조절법)를 적극 권장합니다`;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI 기능이 설정되지 않았습니다. GOOGLE_GENERATIVE_AI_API_KEY를 확인해주세요." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { messages, sleepContext } = await req.json();

    let contextPrompt = SYSTEM_PROMPT;
    if (sleepContext) {
      contextPrompt += `\n\n## 사용자의 최근 수면 데이터\n${sleepContext}`;
    }

    const convertedMessages = messages.map(
      (msg: { role: string; parts?: { type: string; text: string }[]; content?: string }) => ({
        role: msg.role,
        content: msg.parts
          ? msg.parts
              .filter((p: { type: string }) => p.type === "text")
              .map((p: { text: string }) => p.text)
              .join("")
          : msg.content || "",
      }),
    );

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: contextPrompt,
      messages: convertedMessages,
    });

    // 수동 스트리밍 — 에러를 클라이언트에 전달
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "AI 응답 생성 실패";
          console.error("[AI Chat] Stream error:", errorMsg);
          controller.enqueue(encoder.encode(`\n[오류: ${errorMsg}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "AI 응답 생성 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
