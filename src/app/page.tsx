'use client';
import { useEffect, useState, useCallback } from 'react';
import { RegionSelector } from '@/components/RegionSelector';
import { AnimalGrid } from '@/components/AnimalGrid';
import { StaleBanner } from '@/components/StaleBanner';
import { Animal } from '@/types';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  const [region, setRegion] = useState('all');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    const params = region !== 'all' ? `?region_cd=${region}` : '';
    const res = await fetch(`/api/animals${params}`);
    const data = await res.json();
    setAnimals(data.animals ?? []);
    setStale(data.animals?.some((a: Animal) => a.stale) ?? false);
    setLoading(false);
  }, [region]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">getto daze</h1>
        <p className="text-muted-foreground">
          지역 유기동물을 찾고, AI로 나에게 맞는 친구를 만나보세요
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <RegionSelector value={region} onChange={setRegion} />
        <Link href="/match" className={buttonVariants({ variant: 'outline' })}>
          🐶 AI 매칭 시작
        </Link>
        <Link href="/chat" className={buttonVariants({ variant: 'ghost' })}>
          💬 입양 상담
        </Link>
      </div>

      {stale && (
        <div className="mb-4">
          <StaleBanner />
        </div>
      )}

      <AnimalGrid animals={animals} loading={loading} />
    </div>
  );
}
