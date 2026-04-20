import { notFound } from 'next/navigation'
import { FavoriteButton } from '@/components/FavoriteButton'
import { InquiryForm } from '@/components/InquiryForm'
import { AnimalImage } from '@/components/AnimalImage'
import { createClient } from '@/lib/supabase/server'
import { Animal } from '@/types'

async function getAnimal(id: string): Promise<Animal | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Animal
}

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const animal = await getAnimal(id)
  if (!animal) notFound()

  const SEX_LABEL: Record<string, string> = { M: '수컷', F: '암컷', Q: '미상' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
        {animal.image_url ? (
          <AnimalImage src={animal.image_url} alt={animal.kind ?? '동물'} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{animal.kind}</h1>
          <p className="text-muted-foreground">
            {animal.age} · {SEX_LABEL[animal.sex] ?? '미상'} · {animal.weight}
          </p>
        </div>
        <FavoriteButton animalId={animal.id} redirectTo={`/animals/${animal.id}`} />
      </div>

      {animal.feature && (
        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm font-medium mb-1">특징</p>
          <p className="text-sm text-muted-foreground">{animal.feature}</p>
        </div>
      )}

      <div className="border border-border rounded-xl p-4 mb-6">
        <p className="text-sm font-medium mb-1">보호 센터</p>
        <p className="text-sm">{animal.care_nm}</p>
        <p className="text-sm text-muted-foreground">{animal.care_tel}</p>
      </div>

      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">입양 문의</p>
        <InquiryForm animal={animal} />
      </div>
    </div>
  )
}
