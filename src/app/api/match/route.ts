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
    return NextResponse.json(
      { error: 'AI 서비스에 일시적 장애가 발생했어요. 잠시 후 다시 시도해주세요.' },
      { status: 503 }
    )
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
