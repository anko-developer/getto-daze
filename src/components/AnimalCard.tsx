import Link from 'next/link'
import Image from 'next/image'
import { Animal } from '@/types'

type Props = { animal: Animal }

export function AnimalCard({ animal }: Props) {
  return (
    <Link href={`/animals/${animal.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted">
          {animal.image_url ? (
            <Image
              src={animal.image_url}
              alt={`${animal.kind} ${animal.age}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
              🐾
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-medium text-sm truncate">{animal.kind}</p>
          <p className="text-xs text-muted-foreground">{animal.age} · {animal.sex === 'M' ? '수컷' : animal.sex === 'F' ? '암컷' : '미상'}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{animal.care_nm}</p>
        </div>
      </div>
    </Link>
  )
}
