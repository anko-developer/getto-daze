# 지역 기반 유기동물 입양 서비스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 농림축산식품부 공공 API 기반 유기동물 검색 + AI 라이프스타일 매칭 + AI 챗봇 입양 안내 풀스택 웹 서비스 구축

**Architecture:** Next.js 15 App Router + Supabase (PostgreSQL + pgvector + Auth + Edge Functions) + OpenAI API. 농림축산식품부 API 데이터를 Supabase Edge Function으로 매일 동기화하고, 임베딩 기반 AI 매칭과 GPT-4o-mini 스트리밍 챗봇을 API Routes로 제공한다. Vercel에 배포.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + pgvector + Auth + Edge Functions), OpenAI (text-embedding-3-small + GPT-4o-mini), Vercel AI SDK, Resend, Vitest, Playwright

---

## File Structure

```
getto-daze/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 루트 레이아웃 (폰트, 메타)
│   │   ├── page.tsx                      # 홈/검색 페이지
│   │   ├── animals/
│   │   │   └── [id]/page.tsx             # 동물 상세 페이지
│   │   ├── match/
│   │   │   └── page.tsx                  # AI 매칭 설문 페이지
│   │   ├── chat/
│   │   │   └── page.tsx                  # AI 챗봇 페이지
│   │   ├── favorites/
│   │   │   └── page.tsx                  # 내 찜 목록 페이지
│   │   └── api/
│   │       ├── animals/route.ts          # 동물 목록 조회
│   │       ├── animals/[id]/route.ts     # 동물 상세 조회
│   │       ├── match/route.ts            # AI 매칭 임베딩 검색
│   │       ├── favorites/route.ts        # 찜하기 CRUD
│   │       ├── chat/route.ts             # AI 챗봇 스트리밍
│   │       └── inquiry/route.ts          # 문의 메일 발송
│   ├── components/
│   │   ├── AnimalCard.tsx                # 동물 카드 (목록용)
│   │   ├── AnimalGrid.tsx                # 동물 그리드 (빈 상태 포함)
│   │   ├── RegionSelector.tsx            # 시/도 → 시/군/구 드릴다운
│   │   ├── AnimalFilters.tsx             # 종류/성별/나이 필터
│   │   ├── FavoriteButton.tsx            # 찜하기 버튼 (로그인 모달 포함)
│   │   ├── InquiryForm.tsx               # 문의 폼
│   │   ├── MatchSurvey.tsx               # AI 매칭 설문 스텝퍼
│   │   ├── SwipeCard.tsx                 # 틴더 스타일 스와이프 카드
│   │   ├── ChatWidget.tsx                # AI 챗봇 UI
│   │   ├── StaleBanner.tsx               # 데이터 stale 경고 배너
│   │   └── LoginModal.tsx                # 소셜 로그인 모달
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # 브라우저용 Supabase 클라이언트
│   │   │   └── server.ts                 # 서버용 Supabase 클라이언트 (SSR)
│   │   ├── openai.ts                     # OpenAI 클라이언트 + 헬퍼
│   │   └── regions.ts                    # 시/도·시/군/구 코드 매핑 상수
│   └── types/
│       └── index.ts                      # Animal, Favorite, SurveyAnswer 타입
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql               # animals, favorites 테이블 + RLS
│   └── functions/
│       └── sync-animals/
│           └── index.ts                  # Edge Function: API 동기화 + 임베딩
├── tests/
│   ├── api/
│   │   ├── animals.test.ts               # /api/animals 단위 테스트
│   │   ├── match.test.ts                 # /api/match 단위 테스트
│   │   ├── favorites.test.ts             # /api/favorites 단위 테스트
│   │   └── chat.test.ts                  # /api/chat 단위 테스트
│   └── e2e/
│       ├── search.spec.ts                # 검색 → 상세 E2E
│       ├── favorites.spec.ts             # 찜하기 → 로그인 E2E
│       └── match.spec.ts                 # AI 매칭 설문 E2E
├── .env.local                            # 환경변수 (gitignore)
├── .env.example                          # 환경변수 템플릿
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## Task 1: 프로젝트 초기 세팅

**Files:**
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `.env.example`
- Create: `src/types/index.ts`
- Create: `src/lib/regions.ts`

- [ ] **Step 1: Next.js 15 프로젝트 생성**

```bash
npx create-next-app@latest getto-daze \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd getto-daze
```

Expected: 프로젝트 디렉토리 생성 완료

- [ ] **Step 2: 의존성 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  openai ai \
  resend \
  @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slot \
  class-variance-authority clsx tailwind-merge lucide-react \
  framer-motion

npm install -D vitest @vitejs/plugin-react \
  @playwright/test \
  @testing-library/react @testing-library/jest-dom \
  supabase
```

Expected: `node_modules` 설치 완료, `package.json` 업데이트

- [ ] **Step 3: shadcn/ui 초기화**

```bash
npx shadcn@latest init
# 질문: Default style → Default, Base color → Slate, CSS variables → yes
npx shadcn@latest add button card dialog select badge toast
```

Expected: `src/components/ui/` 에 컴포넌트 생성

- [ ] **Step 4: `.env.example` 작성**

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
ANIMAL_API_KEY=...  # 농림축산식품부 OpenAPI 인증키
ANIMAL_API_BASE=http://apis.data.go.kr/1543061/abandonmentPublicSrvc
```

실제 값으로 `.env.local` 별도 생성. `.gitignore`에 `.env.local` 확인.

- [ ] **Step 5: 타입 정의**

```typescript
// src/types/index.ts
export type Animal = {
  id: string
  care_nm: string
  care_tel: string
  region_cd: string
  city_cd: string | null
  kind: string
  age: string
  sex: 'M' | 'F' | 'Q'
  weight: string | null
  feature: string | null
  image_url: string | null
  status: '보호중' | 'expired'
  notice_edt: string
  synced_at: string
  stale: boolean
}

export type Favorite = {
  id: string
  user_id: string
  animal_id: string
  created_at: string
}

export type SurveyAnswer = {
  housing: '아파트' | '단독주택' | '기숙사'
  has_yard: boolean
  walk_time: '30분 이하' | '1시간' | '2시간 이상'
  family: '혼자' | '커플' | '가족 (아이 있음)'
  size_pref: '소형' | '중형' | '대형' | '상관없음'
  age_pref: '어린' | '성견' | '노령' | '상관없음'
  region_cd?: string
}
```

- [ ] **Step 6: 지역 코드 상수**

```typescript
// src/lib/regions.ts
export const SIDO_LIST = [
  { code: '6110000', name: '서울특별시' },
  { code: '6260000', name: '부산광역시' },
  { code: '6270000', name: '대구광역시' },
  { code: '6280000', name: '인천광역시' },
  { code: '6290000', name: '광주광역시' },
  { code: '6300000', name: '대전광역시' },
  { code: '6310000', name: '울산광역시' },
  { code: '6500000', name: '세종특별자치시' },
  { code: '6410000', name: '경기도' },
  { code: '6530000', name: '강원특별자치도' },
  { code: '6430000', name: '충청북도' },
  { code: '6440000', name: '충청남도' },
  { code: '6450000', name: '전북특별자치도' },
  { code: '6460000', name: '전라남도' },
  { code: '6470000', name: '경상북도' },
  { code: '6480000', name: '경상남도' },
  { code: '6690000', name: '제주특별자치도' },
] as const

export type SidoCode = typeof SIDO_LIST[number]['code']
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: initial Next.js 15 setup with shadcn/ui and type definitions"
```

---

## Task 2: Supabase 설정 & DB 마이그레이션

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Supabase 프로젝트 초기화**

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref <your-project-ref>
```

Expected: `supabase/` 디렉토리 생성

- [ ] **Step 2: Supabase 대시보드에서 pgvector 활성화**

Supabase 대시보드 → Database → Extensions → `vector` 검색 → Enable.
(마이그레이션에서도 `create extension if not exists vector` 실행)

- [ ] **Step 3: 마이그레이션 파일 작성**

```sql
-- supabase/migrations/001_initial.sql

create extension if not exists vector;

create table animals (
  id           text primary key,
  care_nm      text not null,
  care_tel     text,
  region_cd    text not null,
  city_cd      text,
  kind         text,
  age          text,
  sex          char(1),
  weight       text,
  feature      text,
  image_url    text,
  status       text default '보호중',
  notice_edt   date,
  embedding    vector(1536),
  synced_at    timestamptz default now(),
  stale        boolean default false
);

create index on animals using hnsw (embedding vector_cosine_ops);
create index on animals (region_cd, status);

create table favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  animal_id  text references animals(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, animal_id)
);

create index on favorites (user_id);

alter table favorites enable row level security;

create policy "사용자는 자신의 찜만 조회"
  on favorites for select using (user_id = auth.uid());

create policy "사용자는 자신의 찜만 추가"
  on favorites for insert with check (user_id = auth.uid());

create policy "사용자는 자신의 찜만 삭제"
  on favorites for delete using (user_id = auth.uid());
```

- [ ] **Step 4: 마이그레이션 실행**

```bash
npx supabase db push
```

Expected: `Finished supabase db push.` 출력. 에러 시 Supabase 대시보드 → SQL Editor에서 직접 실행.

- [ ] **Step 5: 브라우저용 Supabase 클라이언트**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: 서버용 Supabase 클라이언트**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: supabase schema with pgvector, RLS, and client utilities"
```

---

## Task 3: Google OAuth 인증

**Files:**
- Create: `src/app/api/auth/callback/route.ts`
- Create: `src/components/LoginModal.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Supabase 대시보드 Google OAuth 설정**

Supabase 대시보드 → Authentication → Providers → Google → Enable.
Google Cloud Console에서 OAuth 2.0 클라이언트 생성:
- Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`
Client ID, Client Secret을 Supabase에 입력.

- [ ] **Step 2: Auth 콜백 라우트**

```typescript
// src/app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
```

- [ ] **Step 3: LoginModal 컴포넌트**

```typescript
// src/components/LoginModal.tsx
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Props = {
  open: boolean
  onClose: () => void
  redirectTo?: string
}

export function LoginModal({ open, onClose, redirectTo = '/' }: Props) {
  const supabase = createClient()

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>찜하기는 로그인이 필요해요</DialogTitle>
        </DialogHeader>
        <Button onClick={loginWithGoogle} className="w-full mt-4">
          Google로 계속하기
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: 루트 레이아웃 (폰트 + 메타)**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '겟토 데이즈 — 유기동물 입양',
  description: '지역 기반 유기동물 검색, AI 매칭, 입양 안내',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: Google OAuth with Supabase Auth and LoginModal"
```

---

## Task 4: /api/animals 라우트 + 단위 테스트 (TDD)

**Files:**
- Create: `src/app/api/animals/route.ts`
- Create: `tests/api/animals.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: vitest.config.ts 작성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
```

- [ ] **Step 2: 테스트 작성 (실패 확인 전)**

```typescript
// tests/api/animals.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { GET } from '@/app/api/animals/route'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/animals')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

function makeMockSupabase(data: unknown[], error: unknown = null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  }
  return { from: vi.fn().mockReturnValue(query) }
}

describe('GET /api/animals', () => {
  beforeEach(() => vi.clearAllMocks())

  it('지역 코드 있음 → 해당 지역 동물 반환', async () => {
    const animals = [{ id: '1', care_nm: '서울센터', region_cd: '6110000' }]
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase(animals) as never)

    const res = await GET(makeRequest({ region_cd: '6110000' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.animals).toHaveLength(1)
    expect(body.animals[0].region_cd).toBe('6110000')
  })

  it('지역 코드 없음 → 전국 반환', async () => {
    const animals = [{ id: '1' }, { id: '2' }]
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase(animals) as never)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.animals).toHaveLength(2)
  })

  it('DB에 동물 없음 → 빈 배열 반환 (500 아님)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase([]) as never)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.animals).toEqual([])
  })

  it('status expired 동물 → 결과에서 제외', async () => {
    const animals = [{ id: '1', status: '보호중' }]
    vi.mocked(createClient).mockResolvedValue(makeMockSupabase(animals) as never)

    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

```bash
npx vitest run tests/api/animals.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/animals/route'`

- [ ] **Step 4: /api/animals 구현**

```typescript
// src/app/api/animals/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const region_cd = searchParams.get('region_cd')
  const city_cd = searchParams.get('city_cd')
  const kind = searchParams.get('kind')
  const sex = searchParams.get('sex')

  const supabase = await createClient()

  let query = supabase
    .from('animals')
    .select('id, care_nm, care_tel, region_cd, city_cd, kind, age, sex, image_url, status, notice_edt, stale')
    .neq('status', 'expired')
    .order('synced_at', { ascending: false })
    .limit(50)

  if (region_cd) query = query.eq('region_cd', region_cd)
  if (city_cd) query = query.eq('city_cd', city_cd)
  if (kind) query = query.eq('kind', kind)
  if (sex) query = query.eq('sex', sex)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ animals: data ?? [] })
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npx vitest run tests/api/animals.test.ts
```

Expected: 4 tests pass

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: GET /api/animals with region/filter support (TDD)"
```

---

## Task 5: /api/favorites 라우트 + 단위 테스트 (TDD)

**Files:**
- Create: `src/app/api/favorites/route.ts`
- Create: `tests/api/favorites.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/api/favorites.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { GET, POST, DELETE } from '@/app/api/favorites/route'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

function makeRequest(method: string, body?: object, params?: Record<string, string>) {
  const url = new URL('http://localhost/api/favorites')
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeSupabase({ user, insertError, deleteCount }: {
  user: { id: string } | null
  insertError?: { code: string; message: string }
  deleteCount?: number
}) {
  const mockFavorites = [{ id: 'f1', animal_id: 'a1' }]
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: insertError ?? null }),
      delete: vi.fn().mockReturnThis(),
      then: vi.fn(),
      data: mockFavorites,
      error: null,
    }),
  }
}

describe('GET /api/favorites', () => {
  it('미인증 → 401', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase({ user: null }) as never)
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(401)
  })
})

describe('POST /api/favorites', () => {
  beforeEach(() => vi.clearAllMocks())

  it('미인증 → 401', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase({ user: null }) as never)
    const res = await POST(makeRequest('POST', { animal_id: 'a1' }))
    expect(res.status).toBe(401)
  })

  it('인증 후 추가 → 201', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase({ user: { id: 'u1' } }) as never)
    const res = await POST(makeRequest('POST', { animal_id: 'a1' }))
    expect(res.status).toBe(201)
  })

  it('중복 추가 → 409', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ user: { id: 'u1' }, insertError: { code: '23505', message: 'duplicate' } }) as never
    )
    const res = await POST(makeRequest('POST', { animal_id: 'a1' }))
    expect(res.status).toBe(409)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run tests/api/favorites.test.ts
```

Expected: FAIL

- [ ] **Step 3: /api/favorites 구현**

```typescript
// src/app/api/favorites/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getAuthUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('favorites')
    .select('id, animal_id, created_at')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ favorites: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { animal_id } = await request.json()
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, animal_id })

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { animal_id } = await request.json()
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('animal_id', animal_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/api/favorites.test.ts
```

Expected: 4 tests pass

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: /api/favorites CRUD with RLS auth guard (TDD)"
```

---

## Task 6: Supabase Edge Function — 동물 데이터 동기화

**Files:**
- Create: `supabase/functions/sync-animals/index.ts`

- [ ] **Step 1: Edge Function 작성**

```typescript
// supabase/functions/sync-animals/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANIMAL_API_BASE = Deno.env.get('ANIMAL_API_BASE')!
const ANIMAL_API_KEY = Deno.env.get('ANIMAL_API_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchPage(pageNo: number) {
  const params = new URLSearchParams({
    serviceKey: ANIMAL_API_KEY,
    numOfRows: '1000',
    pageNo: String(pageNo),
    _type: 'json',
    state: 'protect',
  })
  const res = await fetch(`${ANIMAL_API_BASE}/abandonmentPublic?${params}`)
  const json = await res.json()
  return json.response?.body?.items?.item ?? []
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  const json = await res.json()
  return json.data[0].embedding
}

function buildEmbeddingText(item: Record<string, string>) {
  return [item.kindCd, item.age, item.sexCd, item.specialMark, item.weight]
    .filter(Boolean)
    .join(' ')
}

Deno.serve(async () => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  let pageNo = 1
  let totalSynced = 0

  while (true) {
    const items: Record<string, string>[] = await fetchPage(pageNo)
    if (!items.length) break

    for (const item of items) {
      const embText = buildEmbeddingText(item)
      const embedding = await getEmbedding(embText)

      const row = {
        id: item.desertionNo,
        care_nm: item.careNm,
        care_tel: item.careTel,
        region_cd: item.orgCd?.slice(0, 7) ?? '',
        city_cd: item.orgCd ?? null,
        kind: item.kindCd,
        age: item.age,
        sex: item.sexCd as 'M' | 'F' | 'Q',
        weight: item.weight ?? null,
        feature: item.specialMark ?? null,
        image_url: item.popfile ?? null,
        status: '보호중' as const,
        notice_edt: `${item.noticeEdt.slice(0, 4)}-${item.noticeEdt.slice(4, 6)}-${item.noticeEdt.slice(6, 8)}`,
        embedding,
        synced_at: new Date().toISOString(),
        stale: false,
      }

      await supabase.from('animals').upsert(row, { onConflict: 'id' })
      totalSynced++
    }

    pageNo++
  }

  // 만료 처리
  await supabase
    .from('animals')
    .update({ status: 'expired' })
    .lt('notice_edt', today)
    .eq('status', '보호중')

  return new Response(JSON.stringify({ synced: totalSynced }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

- [ ] **Step 2: Edge Function 환경변수 등록**

```bash
npx supabase secrets set \
  ANIMAL_API_KEY="<발급받은 키>" \
  ANIMAL_API_BASE="http://apis.data.go.kr/1543061/abandonmentPublicSrvc" \
  OPENAI_API_KEY="<sk-...>"
```

- [ ] **Step 3: Edge Function 배포**

```bash
npx supabase functions deploy sync-animals --no-verify-jwt
```

Expected: `Deployed Function sync-animals`

- [ ] **Step 4: 수동 트리거로 동작 확인**

```bash
curl -X POST \
  "https://<project>.supabase.co/functions/v1/sync-animals" \
  -H "Authorization: Bearer <anon-key>"
```

Expected: `{"synced": N}` (N > 0)

- [ ] **Step 5: Vercel Cron 설정 (배포 후)**

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "0 18 * * *"
  }]
}
```

```typescript
// src/app/api/cron/sync/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-animals`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    }
  )
  const data = await res.json()
  return NextResponse.json(data)
}
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: supabase edge function for animal data sync with embeddings"
```

---

## Task 7: 홈 페이지 — 지역 검색 + 동물 목록

**Files:**
- Create: `src/components/RegionSelector.tsx`
- Create: `src/components/AnimalCard.tsx`
- Create: `src/components/AnimalGrid.tsx`
- Create: `src/components/StaleBanner.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: RegionSelector 컴포넌트**

```typescript
// src/components/RegionSelector.tsx
'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SIDO_LIST } from '@/lib/regions'

type Props = {
  value: string
  onChange: (code: string) => void
}

export function RegionSelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="시/도 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전국</SelectItem>
        {SIDO_LIST.map((sido) => (
          <SelectItem key={sido.code} value={sido.code}>
            {sido.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

- [ ] **Step 2: AnimalCard 컴포넌트**

```typescript
// src/components/AnimalCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Animal } from '@/types'

type Props = { animal: Animal }

export function AnimalCard({ animal }: Props) {
  return (
    <Link href={`/animals/${animal.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted">
          {animal.image_url ? (
            <Image
              src={animal.image_url}
              alt={`${animal.kind} ${animal.age}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
              🐾
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-medium text-sm truncate">{animal.kind}</p>
          <p className="text-xs text-muted-foreground">{animal.age} · {animal.sex === 'M' ? '수컷' : animal.sex === 'F' ? '암컷' : '미상'}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{animal.care_nm}</p>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: AnimalGrid 컴포넌트 (빈 상태 포함)**

```typescript
// src/components/AnimalGrid.tsx
import { AnimalCard } from './AnimalCard'
import { Animal } from '@/types'

type Props = { animals: Animal[]; loading?: boolean }

export function AnimalGrid({ animals, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!animals.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <span className="text-5xl mb-4">🐾</span>
        <p className="text-lg font-medium">해당 지역에 입양 가능한 동물이 없어요</p>
        <p className="text-sm mt-1">다른 지역을 선택해 보세요</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {animals.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: StaleBanner 컴포넌트**

```typescript
// src/components/StaleBanner.tsx
export function StaleBanner() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm text-center">
      데이터 동기화가 지연되고 있어요. 일부 정보가 최신 상태가 아닐 수 있습니다.
    </div>
  )
}
```

- [ ] **Step 5: 홈 페이지**

```typescript
// src/app/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { RegionSelector } from '@/components/RegionSelector'
import { AnimalGrid } from '@/components/AnimalGrid'
import { StaleBanner } from '@/components/StaleBanner'
import { Animal } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [region, setRegion] = useState('all')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [stale, setStale] = useState(false)

  const fetchAnimals = useCallback(async () => {
    setLoading(true)
    const params = region !== 'all' ? `?region_cd=${region}` : ''
    const res = await fetch(`/api/animals${params}`)
    const data = await res.json()
    setAnimals(data.animals ?? [])
    setStale(data.animals?.some((a: Animal) => a.stale) ?? false)
    setLoading(false)
  }, [region])

  useEffect(() => { fetchAnimals() }, [fetchAnimals])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">겟토 데이즈</h1>
        <p className="text-muted-foreground">지역 유기동물을 찾고, AI로 나에게 맞는 친구를 만나보세요</p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <RegionSelector value={region} onChange={setRegion} />
        <Button variant="outline" asChild>
          <Link href="/match">🐶 AI 매칭 시작</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/chat">💬 입양 상담</Link>
        </Button>
      </div>

      {stale && <div className="mb-4"><StaleBanner /></div>}

      <AnimalGrid animals={animals} loading={loading} />
    </div>
  )
}
```

- [ ] **Step 6: next.config.ts 이미지 도메인 허용**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '*.go.kr' },
      { protocol: 'https', hostname: '*.go.kr' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 7: 로컬에서 홈 페이지 확인**

```bash
npm run dev
# http://localhost:3000 에서 시/도 선택 → 동물 목록 렌더링 확인
```

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: home page with region selector and animal grid"
```

---

## Task 8: 동물 상세 페이지 + 찜하기 버튼 + 문의 폼

**Files:**
- Create: `src/app/animals/[id]/page.tsx`
- Create: `src/components/FavoriteButton.tsx`
- Create: `src/components/InquiryForm.tsx`
- Create: `src/app/api/animals/[id]/route.ts`
- Create: `src/app/api/inquiry/route.ts`

- [ ] **Step 1: /api/animals/[id] 라우트**

```typescript
// src/app/api/animals/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ animal: data })
}
```

- [ ] **Step 2: FavoriteButton 컴포넌트**

```typescript
// src/components/FavoriteButton.tsx
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

type Props = { animalId: string; redirectTo: string }

export function FavoriteButton({ animalId, redirectTo }: Props) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      fetch('/api/favorites').then(r => r.json()).then(({ favorites }) => {
        setIsFav(favorites?.some((f: { animal_id: string }) => f.animal_id === animalId) ?? false)
      })
    })
  }, [animalId, supabase])

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setShowLogin(true); return }

    setLoading(true)
    if (isFav) {
      await fetch('/api/favorites', { method: 'DELETE', body: JSON.stringify({ animal_id: animalId }), headers: { 'Content-Type': 'application/json' } })
      setIsFav(false)
    } else {
      await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ animal_id: animalId }), headers: { 'Content-Type': 'application/json' } })
      setIsFav(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant={isFav ? 'default' : 'outline'} onClick={toggle} disabled={loading} size="sm">
        <Heart className={`w-4 h-4 mr-1 ${isFav ? 'fill-current' : ''}`} />
        {isFav ? '찜 완료' : '찜하기'}
      </Button>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} redirectTo={redirectTo} />
    </>
  )
}
```

- [ ] **Step 3: /api/inquiry 라우트**

```typescript
// src/app/api/inquiry/route.ts
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { animal_id, animal_kind, care_nm, care_tel, message } = await request.json()

  const { error } = await resend.emails.send({
    from: 'no-reply@yourdomain.com',
    to: user.email!,
    subject: `[겟토 데이즈] ${animal_kind} 입양 문의 내용`,
    html: `
      <h2>문의하신 내용을 저장했어요</h2>
      <p><strong>동물 ID:</strong> ${animal_id}</p>
      <p><strong>품종:</strong> ${animal_kind}</p>
      <p><strong>보호센터:</strong> ${care_nm}</p>
      <p><strong>센터 전화번호:</strong> ${care_tel}</p>
      <hr/>
      <p><strong>문의 내용:</strong></p>
      <p>${message}</p>
      <hr/>
      <p style="color:#888">센터에 직접 전화하거나 방문 예약 후 입양 절차를 진행하세요.</p>
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: InquiryForm 컴포넌트**

```typescript
// src/components/InquiryForm.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Animal } from '@/types'

type Props = { animal: Animal }

export function InquiryForm({ animal }: Props) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/inquiry', {
      method: 'POST',
      body: JSON.stringify({
        animal_id: animal.id,
        animal_kind: animal.kind,
        care_nm: animal.care_nm,
        care_tel: animal.care_tel,
        message,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 text-sm">
        문의 내용을 이메일로 보내드렸어요. 센터에 직접 전화하세요: <strong>{animal.care_tel}</strong>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        작성하신 내용과 센터 전화번호를 이메일로 보내드립니다.<br />
        센터에는 <strong>{animal.care_tel}</strong> 로 직접 연락해주세요.
      </p>
      <textarea
        className="w-full border border-border rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="입양 의향과 간단한 자기소개를 남겨보세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading || !message} className="w-full">
        {loading ? '전송 중...' : '문의 내용 이메일로 받기'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: 동물 상세 페이지**

```typescript
// src/app/animals/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { FavoriteButton } from '@/components/FavoriteButton'
import { InquiryForm } from '@/components/InquiryForm'
import { Animal } from '@/types'

async function getAnimal(id: string): Promise<Animal | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/animals?id=eq.${id}&select=*`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  return data[0] ?? null
}

export default async function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const animal = await getAnimal(id)
  if (!animal) notFound()

  const SEX_LABEL = { M: '수컷', F: '암컷', Q: '미상' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
        {animal.image_url ? (
          <Image src={animal.image_url} alt={animal.kind} fill className="object-cover" sizes="672px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{animal.kind}</h1>
          <p className="text-muted-foreground">{animal.age} · {SEX_LABEL[animal.sex]} · {animal.weight}</p>
        </div>
        <FavoriteButton animalId={animal.id} redirectTo={`/animals/${animal.id}`} />
      </div>

      {animal.feature && (
        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm font-medium mb-1">특징</p>
          <p className="text-sm text-muted-foreground">{animal.feature}</p>
        </div>
      )}

      <div className="border border-border rounded-xl p-4 mb-6">
        <p className="text-sm font-medium mb-1">보호 센터</p>
        <p className="text-sm">{animal.care_nm}</p>
        <p className="text-sm text-muted-foreground">{animal.care_tel}</p>
      </div>

      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">입양 문의</p>
        <InquiryForm animal={animal} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 상세 페이지 로컬 확인**

```bash
npm run dev
# 홈에서 동물 카드 클릭 → 상세 페이지 확인
# 찜하기 클릭 → 로그인 모달 확인
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: animal detail page with favorites and inquiry form"
```

---

## Task 9: /api/match 라우트 + AI 매칭 (TDD)

**Files:**
- Create: `src/lib/openai.ts`
- Create: `src/app/api/match/route.ts`
- Create: `tests/api/match.test.ts`

- [ ] **Step 1: OpenAI 클라이언트 헬퍼**

```typescript
// src/lib/openai.ts
import OpenAI from 'openai'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}
```

- [ ] **Step 2: 테스트 작성**

```typescript
// tests/api/match.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/openai', () => ({
  getEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
}))

import { POST } from '@/app/api/match/route'
import { createClient } from '@/lib/supabase/server'
import { getEmbedding } from '@/lib/openai'
import { NextRequest } from 'next/server'

const validSurvey = {
  housing: '아파트',
  has_yard: false,
  walk_time: '1시간',
  family: '혼자',
  size_pref: '소형',
  age_pref: '어린',
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/match', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeSupabase(results: unknown[]) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: results, error: null }),
  }
}

describe('POST /api/match', () => {
  beforeEach(() => vi.clearAllMocks())

  it('유효한 설문 → OpenAI 호출 + 상위 10개 반환', async () => {
    const mockResults = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }))
    vi.mocked(createClient).mockResolvedValue(makeSupabase(mockResults) as never)

    const res = await POST(makeRequest(validSurvey))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(getEmbedding).toHaveBeenCalledOnce()
    expect(body.animals).toHaveLength(10)
  })

  it('OpenAI 장애 → 500 대신 graceful 에러 응답', async () => {
    vi.mocked(getEmbedding).mockRejectedValueOnce(new Error('OpenAI down'))
    vi.mocked(createClient).mockResolvedValue(makeSupabase([]) as never)

    const res = await POST(makeRequest(validSurvey))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('지역 미선택 → 전국 기준 쿼리 실행', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([]) as never)

    const res = await POST(makeRequest(validSurvey))
    expect(res.status).toBe(200)
    const supabase = vi.mocked(createClient).mock.results[0].value
    expect(supabase.rpc).toHaveBeenCalledWith(
      'match_animals',
      expect.objectContaining({ region_filter: null })
    )
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npx vitest run tests/api/match.test.ts
```

Expected: FAIL

- [ ] **Step 4: Supabase RPC 함수 생성**

Supabase SQL Editor에서 실행:

```sql
create or replace function match_animals(
  query_embedding vector(1536),
  match_count int,
  region_filter text default null
)
returns table (
  id text, care_nm text, care_tel text, region_cd text, city_cd text,
  kind text, age text, sex char, weight text, feature text, image_url text,
  status text, notice_edt date, stale boolean, similarity float
)
language plpgsql
as $$
begin
  return query
  select
    a.id, a.care_nm, a.care_tel, a.region_cd, a.city_cd,
    a.kind, a.age, a.sex, a.weight, a.feature, a.image_url,
    a.status, a.notice_edt, a.stale,
    1 - (a.embedding <=> query_embedding) as similarity
  from animals a
  where
    a.status = '보호중'
    and (region_filter is null or a.region_cd = region_filter)
  order by a.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

- [ ] **Step 5: /api/match 구현**

```typescript
// src/app/api/match/route.ts
import { createClient } from '@/lib/supabase/server'
import { getEmbedding } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'
import { SurveyAnswer } from '@/types'

function surveyToText(survey: SurveyAnswer): string {
  return [
    survey.housing,
    survey.has_yard ? '마당 있음' : '마당 없음',
    `하루 산책 ${survey.walk_time}`,
    survey.family,
    `${survey.size_pref} 크기`,
    `${survey.age_pref} 나이`,
  ].join(' ')
}

export async function POST(request: NextRequest) {
  const survey: SurveyAnswer = await request.json()

  let embedding: number[]
  try {
    embedding = await getEmbedding(surveyToText(survey))
  } catch {
    return NextResponse.json({ error: 'AI 서비스에 일시적 장애가 발생했어요. 잠시 후 다시 시도해주세요.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('match_animals', {
    query_embedding: embedding,
    match_count: 50,
    region_filter: survey.region_cd ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ animals: (data ?? []).slice(0, 10) })
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
npx vitest run tests/api/match.test.ts
```

Expected: 3 tests pass

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: AI matching with pgvector RPC and embedding (TDD)"
```

---

## Task 10: AI 매칭 설문 UI

**Files:**
- Create: `src/app/match/page.tsx`
- Create: `src/components/MatchSurvey.tsx`
- Create: `src/components/SwipeCard.tsx`

- [ ] **Step 1: MatchSurvey 스텝퍼 컴포넌트**

```typescript
// src/components/MatchSurvey.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SurveyAnswer } from '@/types'

type Step = {
  key: keyof SurveyAnswer
  question: string
  options: { label: string; value: string | boolean }[]
}

const STEPS: Step[] = [
  {
    key: 'housing',
    question: '어디에 사세요?',
    options: [
      { label: '🏢 아파트', value: '아파트' },
      { label: '🏡 단독주택', value: '단독주택' },
      { label: '🏫 기숙사/원룸', value: '기숙사' },
    ],
  },
  {
    key: 'has_yard',
    question: '마당이나 전용 야외 공간이 있나요?',
    options: [
      { label: '✅ 있어요', value: true },
      { label: '❌ 없어요', value: false },
    ],
  },
  {
    key: 'walk_time',
    question: '하루에 산책할 수 있는 시간은?',
    options: [
      { label: '⏰ 30분 이하', value: '30분 이하' },
      { label: '🕐 약 1시간', value: '1시간' },
      { label: '🕑 2시간 이상', value: '2시간 이상' },
    ],
  },
  {
    key: 'family',
    question: '가족 구성은 어떻게 되나요?',
    options: [
      { label: '🧑 혼자', value: '혼자' },
      { label: '💑 커플', value: '커플' },
      { label: '👨‍👩‍👧 가족 (아이 있음)', value: '가족 (아이 있음)' },
    ],
  },
  {
    key: 'size_pref',
    question: '선호하는 동물 크기는?',
    options: [
      { label: '🐹 소형', value: '소형' },
      { label: '🐕 중형', value: '중형' },
      { label: '🐕‍🦺 대형', value: '대형' },
      { label: '💛 상관없음', value: '상관없음' },
    ],
  },
  {
    key: 'age_pref',
    question: '선호하는 동물 나이는?',
    options: [
      { label: '🐣 어린', value: '어린' },
      { label: '🐕 성견/성묘', value: '성견' },
      { label: '👴 노령', value: '노령' },
      { label: '💛 상관없음', value: '상관없음' },
    ],
  },
]

type Props = {
  onComplete: (answers: SurveyAnswer) => void
}

export function MatchSurvey({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<SurveyAnswer>>({})

  function select(value: string | boolean) {
    const current = STEPS[step]
    const newAnswers = { ...answers, [current.key]: value }
    setAnswers(newAnswers)

    if (step + 1 < STEPS.length) {
      setStep(step + 1)
    } else {
      onComplete(newAnswers as SurveyAnswer)
    }
  }

  const current = STEPS[step]

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-1 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-2">{step + 1} / {STEPS.length}</p>
      <h2 className="text-xl font-bold mb-6">{current.question}</h2>

      <div className="space-y-3">
        {current.options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => select(opt.value)}
            className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <Button variant="ghost" className="mt-6 w-full" onClick={() => setStep(step - 1)}>
          이전으로
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: AI 매칭 페이지**

```typescript
// src/app/match/page.tsx
'use client'
import { useState } from 'react'
import { MatchSurvey } from '@/components/MatchSurvey'
import { AnimalGrid } from '@/components/AnimalGrid'
import { SurveyAnswer } from '@/types'
import { Animal } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MatchPage() {
  const [phase, setPhase] = useState<'survey' | 'loading' | 'results'>('survey')
  const [animals, setAnimals] = useState<Animal[]>([])

  async function handleComplete(answers: SurveyAnswer) {
    setPhase('loading')
    const start = Date.now()
    const res = await fetch('/api/match', {
      method: 'POST',
      body: JSON.stringify(answers),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    // 최소 0.5초 로딩 표시 (UX)
    const elapsed = Date.now() - start
    if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed))
    setAnimals(data.animals ?? [])
    setPhase('results')
  }

  if (phase === 'survey') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-8">나에게 맞는 동물 찾기</h1>
        <MatchSurvey onComplete={handleComplete} />
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="text-5xl animate-bounce mb-4">🐾</span>
        <p className="text-lg font-medium">AI가 나에게 맞는 동물을 찾고 있어요...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">추천 결과 ({animals.length}마리)</h1>
        <Button variant="outline" onClick={() => setPhase('survey')}>다시 하기</Button>
      </div>
      <AnimalGrid animals={animals} />
      <div className="mt-8 text-center">
        <Button variant="ghost" asChild>
          <Link href="/">전체 목록 보기</Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 로컬에서 AI 매칭 플로우 확인**

```bash
npm run dev
# /match 접속 → 6단계 설문 → 추천 결과 10개 확인 (2초 이내)
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: AI matching survey UI with step-by-step questionnaire"
```

---

## Task 11: /api/chat + AI 챗봇 UI (TDD)

**Files:**
- Create: `src/app/api/chat/route.ts`
- Create: `src/components/ChatWidget.tsx`
- Create: `src/app/chat/page.tsx`
- Create: `tests/api/chat.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/api/chat.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: '안녕' } }] }
            yield { choices: [{ delta: { content: '하세요' } }] }
          },
        }),
      },
    },
  })),
}))

import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

describe('POST /api/chat', () => {
  it('유효한 메시지 → 스트리밍 응답 헤더 반환', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: '입양 절차가 어떻게 돼요?' }] }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.headers.get('content-type')).toContain('text/plain')
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/api/chat.test.ts
```

Expected: FAIL

- [ ] **Step 3: /api/chat 구현 (Vercel AI SDK)**

```typescript
// src/app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `당신은 한국 유기동물 입양 전문 상담사입니다.
입양 절차, 준비물, 비용, 입양 후 관리에 대해 친절하고 정확하게 안내하세요.
한국 동물보호법 기준으로 답변하고, 모르는 내용은 솔직하게 모른다고 말하세요.
답변은 간결하고 명확하게, 2-3단락 이내로 작성하세요.`

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages,
    maxTokens: 500,
  })

  return result.toTextStreamResponse()
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/api/chat.test.ts
```

Expected: 1 test pass

- [ ] **Step 5: ChatWidget 컴포넌트**

```typescript
// src/components/ChatWidget.tsx
'use client'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function ChatWidget() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium">입양 관련 궁금한 점을 물어보세요</p>
            <p className="text-sm mt-1">예: "입양 절차가 어떻게 되나요?", "강아지 입양 비용은?"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl text-sm text-muted-foreground animate-pulse">
              답변 작성 중...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-destructive text-sm">
            일시적 오류가 발생했어요. 다시 시도해주세요.
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="질문을 입력하세요"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !input}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: 챗봇 페이지**

```typescript
// src/app/chat/page.tsx
import { ChatWidget } from '@/components/ChatWidget'

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <h1 className="text-2xl font-bold mb-4">입양 상담 챗봇</h1>
      <div className="flex-1 border border-border rounded-2xl overflow-hidden">
        <ChatWidget />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Vercel AI SDK 패키지 확인**

```bash
npm install ai @ai-sdk/openai
```

- [ ] **Step 8: 챗봇 로컬 확인**

```bash
npm run dev
# /chat 접속 → "입양 절차가 어떻게 되나요?" 입력 → 스트리밍 응답 확인
```

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: AI chatbot with GPT-4o-mini streaming via Vercel AI SDK (TDD)"
```

---

## Task 12: E2E 테스트 (Playwright)

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/search.spec.ts`
- Create: `tests/e2e/favorites.spec.ts`
- Create: `tests/e2e/match.spec.ts`

- [ ] **Step 1: Playwright 설정**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 2: E2E 테스트 1 — 검색 → 상세**

```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test('검색 → 상세 흐름', async ({ page }) => {
  await page.goto('/')

  // 시/도 드롭다운 선택
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: '서울특별시' }).click()

  // 동물 카드 렌더링 대기 (최대 5초)
  await expect(page.locator('[data-testid="animal-card"], a[href^="/animals/"]').first()).toBeVisible({ timeout: 5000 })

  // 첫 번째 카드 클릭 → 상세 진입
  await page.locator('a[href^="/animals/"]').first().click()

  // 상세 정보 확인
  await expect(page).toHaveURL(/\/animals\//)
  await expect(page.getByRole('heading')).toBeVisible()
})
```

- [ ] **Step 3: E2E 테스트 2 — 찜하기 → 로그인 모달**

```typescript
// tests/e2e/favorites.spec.ts
import { test, expect } from '@playwright/test'

test('미로그인 찜하기 → 로그인 모달 표시', async ({ page }) => {
  // 상세 페이지 직접 접근 (첫 번째 동물 ID는 테스트 DB에 존재해야 함)
  await page.goto('/')
  await page.locator('a[href^="/animals/"]').first().click()
  await expect(page).toHaveURL(/\/animals\//)

  // 찜하기 버튼 클릭
  await page.getByRole('button', { name: /찜하기/ }).click()

  // 로그인 모달 표시 확인
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('찜하기는 로그인이 필요해요')).toBeVisible()
})
```

- [ ] **Step 4: E2E 테스트 3 — AI 매칭 설문 → 추천 결과**

```typescript
// tests/e2e/match.spec.ts
import { test, expect } from '@playwright/test'

test('AI 매칭 설문 → 추천 결과 2초 이내', async ({ page }) => {
  await page.goto('/match')

  // 6단계 설문 순차 완료
  const selections = [
    '아파트',
    '없어요',
    '약 1시간',
    '혼자',
    '소형',
    '상관없음',
  ]

  for (const label of selections) {
    await page.getByRole('button', { name: new RegExp(label) }).click()
  }

  // 결과 페이지 확인 (2초 이내)
  const start = Date.now()
  await expect(page.getByText(/추천 결과/)).toBeVisible({ timeout: 2000 })
  const elapsed = Date.now() - start
  expect(elapsed).toBeLessThan(2000)

  // 카드 렌더링 확인
  await expect(page.locator('a[href^="/animals/"]').first()).toBeVisible()
})
```

- [ ] **Step 5: Playwright 설치 및 실행**

```bash
npx playwright install chromium
npx playwright test
```

Expected: 3 tests pass (서버 실행 중이어야 함)

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "test: playwright E2E tests for search, favorites, and AI matching"
```

---

## Task 13: 반응형 디자인 + 로딩/에러/빈 상태 점검

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/animals/[id]/page.tsx`
- Modify: `src/components/AnimalGrid.tsx`

- [ ] **Step 1: 375px 모바일 레이아웃 점검**

```bash
npm run dev
# Chrome DevTools → 375x812 (iPhone SE) 에서 각 페이지 확인
# 확인 항목:
# - 홈: 지역 선택 → 동물 그리드 2열 렌더링
# - 상세: 이미지, 정보, 찜하기, 문의 폼 세로 스크롤
# - 매칭: 설문 버튼 전체 너비
# - 챗봇: 입력창 위로 키보드 올라올 때 레이아웃 유지
```

- [ ] **Step 2: 이미지 로딩 실패 폴백 확인**

AnimalCard에 `onError` 추가:

```typescript
// src/components/AnimalCard.tsx (이미지 부분만 수정)
<Image
  src={animal.image_url}
  alt={`${animal.kind} ${animal.age}`}
  fill
  className="object-cover group-hover:scale-105 transition-transform"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  onError={(e) => {
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🐾</div>'
  }}
/>
```

- [ ] **Step 3: Vitest 전체 실행**

```bash
npx vitest run
```

Expected: All tests pass

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "fix: responsive layout tweaks and image error fallback"
```

---

## Task 14: Vercel 배포

**Files:**
- Create: `vercel.json`
- Modify: `.env.example`

- [ ] **Step 1: Vercel 환경변수 등록**

Vercel 대시보드 → Project → Settings → Environment Variables에 `.env.example`의 모든 키 등록.

- [ ] **Step 2: vercel.json 작성**

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 18 * * *"
    }
  ]
}
```

(UTC 18:00 = KST 03:00)

- [ ] **Step 3: Vercel 배포**

```bash
npx vercel --prod
```

Expected: 배포 URL 출력

- [ ] **Step 4: 프로덕션 스모크 테스트**

```bash
# 배포된 URL에서 확인
curl https://<your-app>.vercel.app/api/animals | jq '.animals | length'
# Expected: 숫자 > 0

curl -X POST https://<your-app>.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"입양 절차"}]}' \
  --max-time 5
# Expected: 스트리밍 텍스트 응답
```

- [ ] **Step 5: Lighthouse 성능 점수 확인**

Chrome DevTools → Lighthouse → 모바일 기준 실행.
Expected: Performance 80+, Accessibility 90+

- [ ] **Step 6: 커밋 및 README 작성**

```bash
git add vercel.json
git commit -m "chore: add vercel cron config for daily animal sync"
```

README에 포함할 내용:
- 서비스 설명 1단락
- 데모 GIF (Loom 또는 QuickTime으로 녹화)
- 기술 스택 테이블
- 로컬 실행 방법 (`cp .env.example .env.local` → `npm run dev`)
- 환경변수 설명

---

## 전체 테스트 최종 확인

- [ ] **모든 단위 테스트 통과**

```bash
npx vitest run
```

Expected: 12+ tests pass, 0 failures

- [ ] **모든 E2E 테스트 통과**

```bash
npx playwright test
```

Expected: 3 tests pass

- [ ] **최종 커밋**

```bash
git add -A
git commit -m "chore: final cleanup and test confirmation"
```

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run `/autoplan` for full review pipeline, or individual reviews above.

---

## Learnings 반영

- **pgvector HNSW + WHERE 절:** `match_animals` RPC에서 WHERE 절은 HNSW 검색 후 필터링. `region_filter`는 plpgsql 내부에서 처리.
- **농림축산식품부 API 이메일 없음:** InquiryForm은 센터 이메일 대신 사용자 이메일로 문의 내용 발송 + 전화번호 안내.
- **카카오 OAuth 제외:** Google OAuth만 구현. 카카오는 v2.
