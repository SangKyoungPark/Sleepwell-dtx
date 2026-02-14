import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `당신은 수면 데이터를 분석하는 전문 AI 분석가입니다. CBT-I(인지행동치료) 기반으로 수면 데이터를 분석하고 실행 가능한 인사이트를 제공합니다.

## 분석 원칙
- 데이터에 근거한 객관적 분석
- 구체적이고 실행 가능한 조언
- 긍정적인 변화 인정 + 개선점 제안
- 한국어로 작성

## 출력 형식
아래 형식으로 JSON을 반환하세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "score": 1~100 사이의 수면 건강 점수,
  "grade": "A+/A/B+/B/C+/C/D" 중 하나,
  "summary": "한 줄 요약 (20자 내외)",
  "highlights": ["좋은 점 1", "좋은 점 2"],
  "concerns": ["주의할 점 1", "주의할 점 2"],
  "tips": ["실행 가능한 팁 1", "실행 가능한 팁 2", "실행 가능한 팁 3"],
  "weeklyTrend": "improving/stable/declining"
}`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI 기능이 설정되지 않았습니다. ANTHROPIC_API_KEY를 확인해주세요." },
      { status: 503 },
    );
  }

  const { sleepData } = await req.json();

  if (!sleepData || sleepData === "수면 기록이 없습니다.") {
    return Response.json(
      { error: "분석할 수면 데이터가 없습니다." },
      { status: 400 },
    );
  }

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: SYSTEM_PROMPT,
    prompt: `다음 수면 데이터를 분석해주세요:\n\n${sleepData}`,
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json(analysis);
  } catch {
    return Response.json(
      { error: "분석 결과 파싱에 실패했습니다.", raw: text },
      { status: 500 },
    );
  }
}
