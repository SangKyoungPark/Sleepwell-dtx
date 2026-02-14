# SleepWell DTX - 프로젝트 기록

## Google OAuth 설정 (2026-02-14)

### 구성 요소
- **로그인 버튼**: `src/app/(auth)/login/page.tsx` — Google 로그인 버튼 + 아이디저장/자동로그인 체크박스
- **회원가입 버튼**: `src/app/(auth)/signup/page.tsx` — Google 회원가입 버튼
- **콜백 라우트**: `src/app/auth/callback/route.ts` — OAuth code→session 교환
- **Supabase 클라이언트**: `src/lib/supabase/client.ts`

### 설정 완료 항목
- Supabase Dashboard → Authentication → Providers → Google 활성화
- Google Cloud Console → OAuth 2.0 클라이언트 ID 발급
- Client ID + Client Secret → Supabase에 입력

### 트러블슈팅 기록

| 오류 | 원인 | 해결 |
|------|------|------|
| `Unsupported provider: provider is not enabled` | Supabase에서 Google provider 미활성화 | Dashboard → Providers → Google Enable |
| `Unsupported provider: missing OAuth secret` | Client Secret 미입력 | Google Cloud Console에서 발급받은 클라이언트 보안 비밀번호를 Supabase에 입력 |
| `redirect_uri_mismatch` | 승인된 리디렉션 URI에 프로젝트 이름(`SleepWelldtx`) 입력 → 실제 Reference ID(`nwhqcrzwfafbdogbionk`)와 불일치 | 정확한 URI: `https://nwhqcrzwfafbdogbionk.supabase.co/auth/v1/callback` |

### 핵심 주의사항
- Supabase Reference ID는 **프로젝트 이름이 아닌 랜덤 소문자 문자열**
- Reference ID 확인: Supabase Dashboard → Project Settings → General → Reference ID
- Google Cloud Console의 승인된 리디렉션 URI는 글자 하나까지 정확히 일치해야 함
