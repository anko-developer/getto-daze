import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#6a6a6a] hover:text-[#222222] mb-6 transition-colors"
      >
        ← 목록으로
      </Link>

      {/* 이미지 */}
      <div
        className="relative aspect-video rounded-[20px] overflow-hidden bg-[#f7f7f7] mb-8"
        style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}
      >
        {animal.image_url ? (
          <AnimalImage src={animal.image_url} alt={animal.kind ?? '동물'} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
        )}
      </div>

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.44px' }}>
            {animal.kind}
          </h1>
          <p className="text-[#6a6a6a] mt-1">
            {animal.age} · {SEX_LABEL[animal.sex] ?? '미상'} · {animal.weight}
          </p>
        </div>
        <FavoriteButton animalId={animal.id} redirectTo={`/animals/${animal.id}`} />
      </div>

      <hr className="border-[#dddddd] mb-6" />

      {/* 특징 */}
      {animal.feature && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-[#222222] mb-2">특징</h2>
          <p className="text-[#6a6a6a] text-sm leading-relaxed">{animal.feature}</p>
        </div>
      )}

      {/* 보호센터 */}
      <div
        className="rounded-[14px] border border-[#dddddd] p-5 mb-6"
      >
        <h2 className="text-base font-semibold text-[#222222] mb-3">보호 센터</h2>
        <p className="text-sm text-[#222222] font-medium">{animal.care_nm}</p>
        <p className="text-sm text-[#6a6a6a] mt-1">{animal.care_tel}</p>
      </div>

      {/* 입양 문의 */}
      <div
        className="rounded-[14px] border border-[#dddddd] p-5"
        style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px' }}
      >
        <h2 className="text-base font-semibold text-[#222222] mb-4">입양 문의</h2>
        <InquiryForm animal={animal} />
      </div>
    </div>
  )
}
