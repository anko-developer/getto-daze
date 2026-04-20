'use client'
import { useState } from 'react'
import { MatchSurvey } from '@/components/MatchSurvey'
import { AnimalGrid } from '@/components/AnimalGrid'
import { SurveyAnswer, Animal } from '@/types'
import Link from 'next/link'

export default function MatchPage() {
  const [phase, setPhase] = useState<'survey' | 'loading' | 'results'>('survey')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleComplete(answers: SurveyAnswer) {
    setPhase('loading')
    setError(null)
    const start = Date.now()
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        body: JSON.stringify(answers),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'AI 매칭 중 오류가 발생했어요.')
        setPhase('survey')
        return
      }
      const elapsed = Date.now() - start
      if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed))
      setAnimals(data.animals ?? [])
      setPhase('results')
    } catch {
      setError('네트워크 오류가 발생했어요. 다시 시도해주세요.')
      setPhase('survey')
    }
  }

  if (phase === 'survey') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-8">나에게 맞는 동물 찾기</h1>
        {error && (
          <div className="mb-6 text-center text-sm text-destructive">{error}</div>
        )}
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
        <button
          onClick={() => setPhase('survey')}
          className="text-sm text-muted-foreground underline"
        >
          다시 하기
        </button>
      </div>
      <AnimalGrid animals={animals} />
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground underline">
          전체 목록 보기
        </Link>
      </div>
    </div>
  )
}
