'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Animal } from '@/types'

type Props = { animal: Animal }

const SEX_LABEL: Record<string, string> = { M: '수컷', F: '암컷', Q: '미상' }

export function AnimalCard({ animal }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link href={`/animals/${animal.id}`} className="group block">
      <div
        className="rounded-[20px] overflow-hidden bg-white transition-all duration-200 hover:-translate-y-0.5"
        style={{
          boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        }}
      >
        <div className="relative aspect-[4/3] bg-[#f7f7f7] overflow-hidden">
          {animal.image_url && !imgError ? (
            <Image
              src={animal.image_url}
              alt={`${animal.kind} ${animal.age}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-[#6a6a6a]">
              🐾
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="font-semibold text-[#222222] text-sm truncate" style={{ letterSpacing: '-0.18px' }}>
            {animal.kind}
          </p>
          <p className="text-[#6a6a6a] text-sm mt-0.5">
            {animal.age} · {SEX_LABEL[animal.sex] ?? '미상'}
          </p>
          <p className="text-[#6a6a6a] text-sm mt-0.5 truncate">{animal.care_nm}</p>
        </div>
      </div>
    </Link>
  )
}
