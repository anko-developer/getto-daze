'use client';
import { useEffect, useState, useCallback } from 'react';
import { RegionSelector } from '@/components/RegionSelector';
import { AnimalGrid } from '@/components/AnimalGrid';
import { StaleBanner } from '@/components/StaleBanner';
import { Animal } from '@/types';
import Link from 'next/link';

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
    <div>
      {/* Hero */}
      <div className="bg-white border-b border-[#dddddd] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#222222] mb-1" style={{ letterSpacing: '-0.44px' }}>
            새 가족을 기다리는 친구들
          </h1>
          <p className="text-[#6a6a6a] text-sm mb-6">
            지역 유기동물을 찾고, AI로 나에게 맞는 친구를 만나보세요
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <RegionSelector value={region} onChange={setRegion} />
            <Link
              href="/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#222222] text-white text-sm font-medium hover:bg-[#ff385c] transition-colors"
            >
              AI 매칭 시작
            </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {stale && (
          <div className="mb-6">
            <StaleBanner />
          </div>
        )}
        <AnimalGrid animals={animals} loading={loading} />
      </div>
    </div>
  );
}
