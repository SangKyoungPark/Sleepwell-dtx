<h1 align="center">
  <br>
  SleepWell DTx
  <br>
</h1>

<h3 align="center">CBT-I 기반 불면증 디지털 치료 웹앱</h3>

<p align="center">
  <em>"오늘 밤, 한 가지만 바꿔보세요"</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/License-ISC-green" alt="License">
</p>

<p align="center">
  <a href="https://sleepwell-dtx.vercel.app">Live Demo</a>
</p>

---

## 소개

**SleepWell DTx**는 인지행동치료(CBT-I)를 기반으로 한 불면증 자가관리 웹앱입니다.

불면증으로 고통받는 사람들에게 **"왜 잠을 못 자는가"가 아닌, "어떻게 하면 잘 잘 수 있는가"**에 초점을 맞춰 실질적인 수면 개선 솔루션을 제공합니다.

### 왜 SleepWell인가?

| | 수치 |
|---|---|
| 한국 성인 불면증 경험률 | **33%** |
| 수면장애 진료 인원 (2024) | **76만 8천 명** |
| 수면 개선 의지 (미국) | **80%** |
| 글로벌 불면증 유병률 | **8억 5천만 명** |

> 사람들은 이미 원인(스트레스, 불안)을 알고 있습니다.
> 필요한 건 **오늘 밤 바로 실천할 수 있는 방법**입니다.

---

## 핵심 기능

### ISI 자가진단
> 7문항의 국제 표준 불면증 척도(ISI)로 나의 수면 상태를 확인합니다.

- 문항별 점수 선택 (0~4점)
- 총점 기반 심각도 분류 (정상 / 경미 / 중등도 / 중증)
- 시각적 결과 리포트
- 진단 이력 클라우드 저장

### 수면 일지
- 아침: 취침/기상 시각, 잠들기까지 시간, 깬 횟수, 수면 품질
- 저녁: 스트레스, 카페인, 운동, 걱정 기록
- 자동 계산: 총 수면시간, 수면효율(%)
- Supabase DB 동기화

### 오늘의 미션
- 6주간 점진적 난이도의 일일 미션
- 쉬운 습관부터 시작 → 성공 경험 쌓기
- 완료 상태 클라우드 저장

### CBT-I 주간 세션
- 주차별 교육 + 실습 (수면교육, 수면위생, 이완훈련, 인지재구성, 수면제한)
- 섹션별 진행률 추적
- 실습 체크 + 성찰 기록

### AI 수면 코치
- Claude AI 기반 대화형 수면 코칭
- 수면 관련 고민 상담
- 개인화된 수면 개선 조언

### 이완 도구
- 4-7-8 호흡법, 점진적 근이완법, 바디스캔 명상

### 나의 리포트
- 수면효율 트렌드 차트 (Recharts)
- 스트레스-수면 상관관계 분석
- 주간 변화 리포트

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| UI | React 19 + Tailwind CSS 4 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| AI | Anthropic Claude (AI SDK) |
| Chart | Recharts |
| Deploy | Vercel |

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm
- Supabase 프로젝트 (무료 플랜 가능)
- Anthropic API Key (AI 코치 기능용)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/SangKyoungPark/Sleepwell-dtx.git
cd Sleepwell-dtx

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 편집하여 실제 값 입력
```

### 환경변수

`.env.local` 파일에 아래 값을 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 데이터베이스 설정

Supabase Dashboard → SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

### 빌드

```bash
npm run build
npm run start
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/           # 로그인, 회원가입, 온보딩, ISI 진단
│   ├── (main)/           # 홈, 일지, 미션, 세션, 이완, 코치, 리포트, 설정
│   ├── api/              # API 라우트 (AI 챗)
│   ├── auth/             # OAuth 콜백
│   ├── globals.css       # 다크 테마 스타일
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 랜딩 페이지
├── components/
│   └── ui/               # 공통 UI 컴포넌트
├── hooks/                # 커스텀 훅 (useAuth, useToast)
├── lib/
│   ├── constants.ts      # ISI 문항, 프로그램 상수
│   ├── supabase/         # Supabase 클라이언트, DB 함수, 미들웨어
│   └── utils.ts          # 수면 계산 유틸리티
└── types/
    └── index.ts          # TypeScript 타입 정의
```

---

## 6주 CBT-I 프로그램 구성

| 주차 | 주제 | 내용 |
|------|------|------|
| 1주 | 수면의 이해 | 수면 구조, 불면 악순환 이해 |
| 2주 | 수면 위생 | 환경, 카페인, 빛, 운동 관리 |
| 3주 | 이완 훈련 | 호흡법, 근이완법, 바디스캔 |
| 4주 | 인지 재구성 | 수면 관련 왜곡된 생각 교정 |
| 5주 | 수면 제한 | 수면효율 기반 침대시간 조절 |
| 6주 | 유지 & 재발 방지 | 장기 전략 수립, 재평가 |

---

## 참고 자료

- [식약처 디지털치료기기 허가심사 가이드라인](https://www.mfds.go.kr/brd/m_1060/view.do?seq=14596)
- [ISI - Insomnia Severity Index](https://www.sleepfoundation.org/insomnia/treatment/cognitive-behavioral-therapy-insomnia)
- [AASM - Digital CBT-I Platforms](https://aasm.org/digital-cognitive-behavioral-therapy-for-insomnia-platforms-and-characteristics/)

---

<p align="center">
  <sub>본 앱은 의료 행위를 대체하지 않으며, 참고용 자가관리 도구입니다.<br>정확한 진단과 치료는 반드시 전문가 상담을 받으시기 바랍니다.</sub>
</p>
