'use client'
import { useState } from 'react'
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
        <button
          className="mt-6 w-full text-muted-foreground text-sm"
          onClick={() => setStep(step - 1)}
        >
          이전으로
        </button>
      )}
    </div>
  )
}
