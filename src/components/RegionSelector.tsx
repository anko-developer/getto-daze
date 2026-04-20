'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SIDO_LIST } from '@/lib/regions'

type Props = {
  value: string
  onChange: (code: string) => void
}

export function RegionSelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? 'all')}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="시/도 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전국</SelectItem>
        {SIDO_LIST.map((sido) => (
          <SelectItem key={sido.code} value={sido.code}>
            {sido.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
