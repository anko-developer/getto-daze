'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>찜하기는 로그인이 필요해요</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <Button onClick={loginWithGoogle} className="w-full mt-4">
          Google로 계속하기
        </Button>
      </DialogContent>
    </Dialog>
  )
}
