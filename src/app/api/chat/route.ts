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
    maxOutputTokens: 500,
  })

  return result.toTextStreamResponse()
}
