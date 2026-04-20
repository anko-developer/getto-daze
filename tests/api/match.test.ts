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

  it('OpenAI 장애 → 503 graceful 에러 응답', async () => {
    vi.mocked(getEmbedding).mockRejectedValueOnce(new Error('OpenAI down'))
    vi.mocked(createClient).mockResolvedValue(makeSupabase([]) as never)

    const res = await POST(makeRequest(validSurvey))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('지역 미선택 → region_filter: null 로 RPC 호출', async () => {
    const mockSupabase = makeSupabase([])
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    await POST(makeRequest(validSurvey))

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'match_animals',
      expect.objectContaining({ region_filter: null })
    )
  })
})
