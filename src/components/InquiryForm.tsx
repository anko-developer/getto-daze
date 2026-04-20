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
