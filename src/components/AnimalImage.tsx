'use client'
import { useState } from 'react'
import Image from 'next/image'

type Props = { src: string; alt: string }

export function AnimalImage({ src, alt }: Props) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="672px"
      onError={() => setError(true)}
    />
  )
}
