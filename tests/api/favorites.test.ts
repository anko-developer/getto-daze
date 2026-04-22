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

function makeSupabase({ user, insertError, data }: {
  user: { id: string } | null
  insertError?: { code: string; message: string }
  data?: unknown[]
}) {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: insertError ?? null }),
    delete: vi.fn().mockReturnThis(),
  }
  // resolve for select chain
  Object.defineProperty(mockQuery, 'then', {
    value: (resolve: (v: { data: unknown[]; error: null }) => void) =>
      resolve({ data: data ?? [], error: null }),
  })
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from: vi.fn().mockReturnValue(mockQuery),
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
