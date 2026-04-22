import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the ai/openai dependencies
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn().mockReturnValue('mock-model'),
}))

vi.mock('ai', () => ({
  streamText: vi.fn().mockReturnValue({
    toTextStreamResponse: vi.fn().mockReturnValue(
      new Response('hello', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    ),
  }),
}))

import { POST } from '@/app/api/chat/route'

describe('POST /api/chat', () => {
  it('유효한 메시지 → text/plain 스트리밍 응답', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: '입양 절차가 어떻게 돼요?' }],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.headers.get('content-type')).toContain('text/plain')
    expect(res.status).toBe(200)
  })
})
