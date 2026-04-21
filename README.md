# getto daze

유기동물 입양 서비스. 지역 기반 검색, AI 매칭, 입양 상담 챗봇을 제공합니다.

**[getto-daze.vercel.app](https://getto-daze.vercel.app)**

---

## 주요 기능

- **지역 검색** — 시/도별 유기동물 목록 조회 (농림축산식품부 공공 API 연동)
- **AI 매칭** — 주거 환경, 산책 시간, 가족 구성 등 설문 후 OpenAI 임베딩 기반 추천
- **입양 상담 챗봇** — GPT-4o-mini 기반 스트리밍 챗봇
- **찜하기** — Google 로그인 후 관심 동물 저장
- **입양 문의** — 문의 내용을 이메일로 전송 (Resend)
- **자동 동기화** — 매일 새벽 3시(KST) 공공 API 데이터 갱신 (Vercel Cron)

---

## 기술 스택

### Frontend
| 기술 | 용도 |
|------|------|
| Next.js 16 (App Router) | 풀스택 프레임워크 |
| React 19 | UI |
| TypeScript | 타입 안전성 |
| Tailwind CSS v4 | 스타일링 |
| shadcn/ui | UI 컴포넌트 (Dialog, Select 등) |
| Vercel AI SDK v6 | 챗봇 스트리밍 (`useChat`) |

### Backend & 인프라
| 기술 | 용도 |
|------|------|
| Supabase | PostgreSQL DB + Auth (Google OAuth) + Edge Functions |
| pgvector (HNSW) | 동물 임베딩 벡터 유사도 검색 |
| OpenAI | text-embedding-3-small (매칭), GPT-4o-mini (챗봇) |
| Resend | 입양 문의 이메일 전송 |
| Vercel | 배포 + Cron Jobs |

### 외부 API
| API | 용도 |
|------|------|
| 농림축산식품부 동물보호 API v2 | 유기동물 데이터 수집 |

---

## 디렉토리 구조

```
getto-daze/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # 홈 (동물 목록)
│   │   ├── layout.tsx                # 루트 레이아웃 + 네비게이션
│   │   ├── globals.css               # 글로벌 스타일 (Airbnb 디자인 토큰)
│   │   ├── animals/[id]/
│   │   │   └── page.tsx              # 동물 상세 페이지
│   │   ├── match/
│   │   │   └── page.tsx              # AI 매칭 페이지
│   │   ├── chat/
│   │   │   └── page.tsx              # 입양 상담 챗봇 페이지
│   │   └── api/
│   │       ├── animals/route.ts      # 동물 목록 조회 (GET)
│   │       ├── animals/[id]/route.ts # 동물 단건 조회 (GET)
│   │       ├── favorites/route.ts    # 찜하기 (GET/POST/DELETE)
│   │       ├── match/route.ts        # AI 매칭 (POST)
│   │       ├── chat/route.ts         # 챗봇 스트리밍 (POST)
│   │       ├── inquiry/route.ts      # 입양 문의 이메일 (POST)
│   │       ├── cron/sync/route.ts    # 데이터 동기화 트리거
│   │       └── auth/callback/route.ts # Google OAuth 콜백
│   ├── components/
│   │   ├── AnimalCard.tsx            # 동물 카드
│   │   ├── AnimalGrid.tsx            # 동물 그리드 (스켈레톤 포함)
│   │   ├── AnimalImage.tsx           # 이미지 (에러 폴백)
│   │   ├── ChatWidget.tsx            # 챗봇 UI
│   │   ├── FavoriteButton.tsx        # 찜하기 버튼
│   │   ├── InquiryForm.tsx           # 입양 문의 폼
│   │   ├── LoginModal.tsx            # Google 로그인 모달
│   │   ├── MatchSurvey.tsx           # AI 매칭 설문 스테퍼
│   │   ├── RegionSelector.tsx        # 시/도 선택
│   │   ├── StaleBanner.tsx           # 데이터 갱신 알림
│   │   └── ui/                       # shadcn/ui 기본 컴포넌트
│   ├── lib/
│   │   ├── openai.ts                 # OpenAI 클라이언트 (lazy singleton)
│   │   ├── regions.ts                # 시/도 코드 목록
│   │   └── supabase/
│   │       ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │       └── server.ts             # 서버용 Supabase 클라이언트
│   └── types/
│       └── index.ts                  # Animal, Favorite, SurveyAnswer 타입
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql           # animals, favorites 테이블 + RLS + match_animals RPC
│   └── functions/
│       └── sync-animals/
│           └── index.ts              # Deno Edge Function: 공공 API → DB 동기화
├── tests/
│   ├── unit/                         # Vitest 유닛 테스트
│   └── e2e/                          # Playwright E2E 테스트
├── vercel.json                       # Cron 설정 (매일 UTC 18:00 = KST 03:00)
└── next.config.ts                    # 이미지 도메인 허용 설정
```

---

## 로컬 개발

### 1. 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

### 2. Supabase 마이그레이션

Supabase 대시보드 → SQL Editor에서 `supabase/migrations/001_initial.sql` 실행.

### 3. 실행

```bash
npm install
npm run dev
```

### 4. 테스트

```bash
npm test             # Vitest 유닛 테스트
npx playwright test  # E2E 테스트
```

---

## 데이터 동기화

유기동물 데이터는 Supabase Edge Function(`sync-animals`)이 담당합니다.

- **자동**: Vercel Cron이 매일 새벽 3시(KST) `/api/cron/sync` 호출
- **수동**: 아래 curl로 즉시 실행 가능

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/sync-animals" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Edge Function 필수 Secrets:

| Secret | 설명 |
|--------|------|
| `ANIMAL_API_BASE` | 공공데이터 API 베이스 URL |
| `ANIMAL_API_KEY` | 농림축산식품부 API 인증키 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role 키 |

---

## 아키텍처

```
사용자 → Next.js (Vercel)
           ├── /api/animals     → Supabase DB (animals 테이블)
           ├── /api/match       → OpenAI Embeddings → Supabase match_animals RPC
           ├── /api/chat        → OpenAI GPT-4o-mini (스트리밍)
           ├── /api/favorites   → Supabase DB (favorites 테이블, RLS)
           └── /api/inquiry     → Resend (이메일)

Vercel Cron → /api/cron/sync → Supabase Edge Function
                                  └── 공공API → OpenAI Embeddings → Supabase DB
```
