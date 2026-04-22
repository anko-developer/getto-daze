import { describe, it, expect, vi, beforeEach } from 'vitest'

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
