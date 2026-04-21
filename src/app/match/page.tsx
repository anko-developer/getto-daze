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
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
            나에게 맞는 동물 찾기
          </h1>
          <p className="text-[#6a6a6a] mt-2 text-sm">AI가 생활 패턴에 맞는 친구를 추천해드려요</p>
        </div>
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        <MatchSurvey onComplete={handleComplete} />
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-6xl animate-bounce mb-6">🐾</span>
        <p className="text-lg font-semibold text-[#222222]">AI가 나에게 맞는 동물을 찾고 있어요</p>
        <p className="text-sm text-[#6a6a6a] mt-2">잠시만 기다려주세요</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
            추천 결과
          </h1>
          <p className="text-[#6a6a6a] text-sm mt-1">{animals.length}마리의 친구가 기다리고 있어요</p>
        </div>
        <button
          onClick={() => setPhase('survey')}
          className="px-4 py-2 rounded-lg border border-[#dddddd] text-sm font-medium text-[#222222] hover:border-[#222222] transition-colors"
        >
          다시 하기
        </button>
      </div>
      <AnimalGrid animals={animals} />
      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-[#6a6a6a] underline underline-offset-2 hover:text-[#222222] transition-colors">
          전체 목록 보기
        </Link>
      </div>
    </div>
  )
}
