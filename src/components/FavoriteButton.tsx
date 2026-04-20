'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

type Props = { animalId: string; redirectTo: string }

export function FavoriteButton({ animalId, redirectTo }: Props) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      fetch('/api/favorites').then(r => r.json()).then(({ favorites }) => {
        setIsFav(favorites?.some((f: { animal_id: string }) => f.animal_id === animalId) ?? false)
      })
    })
  }, [animalId, supabase])

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setShowLogin(true); return }

    setLoading(true)
    if (isFav) {
      await fetch('/api/favorites', {
        method: 'DELETE',
        body: JSON.stringify({ animal_id: animalId }),
        headers: { 'Content-Type': 'application/json' },
      })
      setIsFav(false)
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ animal_id: animalId }),
        headers: { 'Content-Type': 'application/json' },
      })
      setIsFav(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant={isFav ? 'default' : 'outline'} onClick={toggle} disabled={loading} size="sm">
        <Heart className={`w-4 h-4 mr-1 ${isFav ? 'fill-current' : ''}`} />
        {isFav ? '찜 완료' : '찜하기'}
      </Button>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} redirectTo={redirectTo} />
    </>
  )
}
