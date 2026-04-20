'use client'
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

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>찜하기는 로그인이 필요해요</DialogTitle>
        </DialogHeader>
        <Button onClick={loginWithGoogle} className="w-full mt-4">
          Google로 계속하기
        </Button>
      </DialogContent>
    </Dialog>
  )
}
