import { AnimalCard } from './AnimalCard'
import { Animal } from '@/types'

type Props = { animals: Animal[]; loading?: boolean }

export function AnimalGrid({ animals, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[20px] overflow-hidden animate-pulse"
            style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}
          >
            <div className="aspect-[4/3] bg-[#f2f2f2]" />
            <div className="p-4 space-y-2">
              <div className="h-3.5 bg-[#f2f2f2] rounded w-3/4" />
              <div className="h-3 bg-[#f2f2f2] rounded w-1/2" />
              <div className="h-3 bg-[#f2f2f2] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!animals.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#6a6a6a]">
        <span className="text-6xl mb-5">🐾</span>
        <p className="text-lg font-semibold text-[#222222]">해당 지역에 입양 가능한 동물이 없어요</p>
        <p className="text-sm mt-2">다른 지역을 선택해 보세요</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {animals.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </div>
  )
}
