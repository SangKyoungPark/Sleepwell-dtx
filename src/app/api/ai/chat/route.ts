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
- 잠이 안 올 때 침대에서 나오기(자극 조절법)를 적극 권장합니다

## 응답 형식 가이드 (비주얼 카드)
답변 시 아래 특수 태그를 적극 활용하여 시각적으로 풍부한 응답을 만드세요.
일반 텍스트와 태그를 자연스럽게 섞어 사용합니다.

사용 가능한 태그 4가지:
1. [TIP:제목]내용[/TIP] - 실천 팁이나 조언을 줄 때
2. [STAT:라벨]값[/STAT] - 수치/통계를 강조할 때 (예: [STAT:목표 수면효율]85% 이상[/STAT])
3. [STEPS:제목]1. 첫번째 단계\n2. 두번째 단계\n3. 세번째 단계[/STEPS] - 단계별 가이드를 줄 때
4. [KEY:제목]핵심 내용[/KEY] - 핵심 포인트를 강조할 때

규칙:
- 모든 답변에 최소 1~2개 태그를 사용하세요
- 태그 사이에 일반 텍스트 설명을 자연스럽게 넣으세요
- STAT 태그의 값은 짧고 임팩트 있게 (숫자+단위 권장)
- STEPS의 각 단계는 \\n으로 구분합니다
- 태그 없이 일반 텍스트만 쓰는 것도 괜찮지만, 가능하면 태그를 활용하세요`;

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent";

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI 기능이 설정되지 않았습니다. GOOGLE_GENERATIVE_AI_API_KEY를 확인해주세요." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { messages, sleepContext } = await req.json();

    let systemText = SYSTEM_PROMPT;
    if (sleepContext) {
      systemText += `\n\n## 사용자의 최근 수면 데이터\n${sleepContext}`;
    }

    // Gemini API 형식으로 변환
    const contents = messages.map(
      (msg: { role: string; content?: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }],
      }),
    );

    const geminiRes = await fetch(`${GEMINI_API_URL}?alt=sse&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("[AI Chat] Gemini API error:", geminiRes.status, errBody);
      return new Response(
        JSON.stringify({ error: `Gemini API 오류 (${geminiRes.status}): ${errBody}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    // SSE 스트림을 텍스트 스트림으로 변환
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = geminiRes.body?.getReader();

    if (!reader) {
      return new Response(
        JSON.stringify({ error: "Gemini 응답 스트림을 읽을 수 없습니다." }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // JSON 파싱 실패 무시
              }
            }
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "스트림 오류";
          console.error("[AI Chat] Stream error:", msg);
          controller.enqueue(encoder.encode(`\n[오류: ${msg}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "AI 응답 생성 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
