<h1 align="center">
  🌙 SleepWell DTx
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
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/Web_Audio_API-Sound-FF6F00" alt="Web Audio">
</p>

<p align="center">
  <a href="https://sleepwell-dtx.vercel.app"><strong>Live Demo</strong></a>
</p>

---

## 소개

**SleepWell DTx**는 인지행동치료(CBT-I)를 기반으로 한 불면증 자가관리 디지털 치료 웹앱입니다.

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

### 📝 수면 일지
- 아침: 취침/기상 시각, 잠들기까지 시간, 깬 횟수, 수면 품질
- 저녁: 스트레스, 카페인, 운동, 걱정 기록
- 자동 계산: 총 수면시간(TST), 수면효율(SE%)
- Supabase DB 실시간 동기화

### 🎯 오늘의 미션
- 6주간 점진적 난이도의 일일 미션
- 쉬운 습관부터 시작 → 성공 경험 쌓기
- 완료 상태 클라우드 저장

### 🎵 수면 사운드 라이브러리
> Web Audio API로 오디오 파일 없이 8종 프로시저럴 사운드를 실시간 생성합니다.

| 카테고리 | 사운드 | 구현 |
|----------|--------|------|
| 노이즈 | 백색소음 / 핑크소음 / 갈색소음 | 5초 버퍼 루프 + equal-power crossfade |
| 자연 | 빗소리 | 3레이어 (빗줄기 + 후드득 + 물방울) |
| 자연 | 파도소리 | 듀얼 LFO (16초/40초 주기) + 포말 레이어 |
| 자연 | 바람소리 | 3레이어 + 주파수 스윕 + 돌풍 변조 |
| 자연 | 귀뚜라미 | 3마리 개체 (각기 다른 음높이/타이밍) |
| 특수 | 바이노럴 비트 | 스테레오 150Hz/152Hz (2Hz 델타파) |

- **믹싱**: 여러 사운드 동시 재생 + 개별 볼륨 조절
- **슬립 타이머**: 15/30/45/60분 + 마지막 60초 페이드아웃
- **전역 재생**: 페이지 이동해도 소리 유지 (싱글턴 AudioContext)
- **미니 플레이어**: 다른 페이지에서 플로팅 바로 재생 상태 표시
- **취침 리마인더 연동**: 리마인더 시간에 수면 사운드 추천 팝업

### 🧘 이완 도구
- **4-7-8 호흡법** — 4초 들숨 · 7초 참기 · 8초 날숨, 원형 가이드 애니메이션
- **점진적 근이완법** — 발부터 머리까지 16개 부위 긴장-이완 반복
- **바디스캔 명상** — 몸 전체를 천천히 관찰하는 마인드풀니스 명상

### 🤖 AI 수면 코치
- Google Gemini 기반 대화형 수면 코칭 (실시간 스트리밍)
- 수면 관련 고민 상담 + 개인화된 개선 조언

### 📊 나의 리포트
- Claude AI 기반 수면 데이터 자동 분석
- 수면효율 트렌드 차트 (Recharts)
- 수면 건강 점수/등급 + 실행 가능한 개선 팁

### 📖 CBT-I 주간 세션
- 6주 구조화된 교육 + 실습
- 섹션별 진행률 추적 + 실습 체크 + 성찰 기록

### 🔔 알림 & 리마인더
- 취침 리마인더 / 아침 수면일지 / 저녁 기록
- Web Notification API + Service Worker (백그라운드 알림)
- 취침 시간 도달 시 **수면 사운드 추천 인앱 모달** 자동 표시

### 📱 PWA 지원
- 홈 화면에 앱 설치 가능 (Android/iOS)
- Service Worker 기반 오프라인 캐싱
- 앱스토어 배포 준비 완료 (Digital Asset Links)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | React 19 + Tailwind CSS 4 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| AI | Google Gemini (채팅) + Anthropic Claude (분석) via AI SDK |
| Audio | Web Audio API (프로시저럴 사운드 생성) |
| Chart | Recharts |
| PWA | Service Worker + Web App Manifest |
| Notification | Web Notification API |
| Deploy | Vercel (자동 배포) |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/              # 로그인, 회원가입, 온보딩, ISI 진단
│   ├── (main)/              # 메인 앱 페이지
│   │   ├── MainLayoutClient # 클라이언트 레이아웃 (Sound + Notification 통합)
│   │   ├── home/            # 홈 대시보드
│   │   ├── diary/           # 수면 일지
│   │   ├── mission/         # 오늘의 미션
│   │   ├── relax/           # 이완 도구 + 수면 사운드
│   │   ├── coach/           # AI 수면 코치
│   │   ├── report/          # 나의 리포트
│   │   ├── session/         # CBT-I 주간 세션
│   │   └── settings/        # 설정 + 알림 + 계정 관리
│   ├── api/                 # API 라우트 (AI 채팅/분석, 회원탈퇴)
│   └── auth/                # OAuth 콜백
├── components/
│   ├── relax/               # 이완 도구 (호흡법, 근이완법, 바디스캔, 사운드 믹서)
│   └── ui/                  # 공통 UI (BottomNav, MiniPlayer, Prompt, 일러스트)
├── contexts/
│   └── SoundContext.tsx      # 전역 오디오 상태 관리
├── hooks/                    # useAuth, useNotification, useToast, useServiceWorker
├── lib/
│   ├── audio/
│   │   └── SleepSoundEngine  # Web Audio API 싱글턴 엔진
│   ├── supabase/             # DB 클라이언트, 쿼리 함수
│   ├── constants.ts          # 프로그램 상수, 리마인더 설정
│   └── utils.ts              # 수면 계산 유틸리티
└── types/                    # TypeScript 타입 정의
```

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm
- Supabase 프로젝트 (무료 플랜 가능)
- Google AI API Key (AI 코치용)
- Anthropic API Key (AI 분석용)

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

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### 데이터베이스 설정

Supabase Dashboard → SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.

### 개발 서버

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

### 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 6주 CBT-I 프로그램

| 주차 | 주제 | 핵심 내용 |
|------|------|-----------|
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
