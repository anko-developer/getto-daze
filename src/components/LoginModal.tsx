'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

type Props = {
  open: boolean
  onClose: () => void
  redirectTo?: string
}

export function LoginModal({ open, onClose, redirectTo = '/' }: Props) {
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  async function loginWithGoogle() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error) setError('로그인 중 오류가 발생했어요. 다시 시도해주세요.')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-[20px] border-[#dddddd]">
        <DialogHeader>
          <DialogTitle className="text-[#222222] font-bold" style={{ letterSpacing: '-0.18px' }}>
            로그인이 필요해요
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#6a6a6a] mt-1">찜하기는 로그인 후 이용할 수 있어요.</p>
        {error && <p className="text-sm text-[#c13515] mt-2">{error}</p>}
        <button
          onClick={loginWithGoogle}
          className="w-full mt-4 py-3 rounded-lg bg-[#222222] text-white text-sm font-medium hover:bg-[#ff385c] transition-colors"
        >
          Google로 계속하기
        </button>
      </DialogContent>
    </Dialog>
  )
}
