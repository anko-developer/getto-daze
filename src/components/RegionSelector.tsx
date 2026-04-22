'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SIDO_LIST } from '@/lib/regions';

type Props = {
  value: string;
  onChange: (code: string) => void;
};

export function RegionSelector({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? 'all')}>
      <SelectTrigger className="w-40 border-[#dddddd] rounded-lg text-sm font-medium text-[#222222] bg-white hover:border-[#222222] transition-colors">
        <SelectValue placeholder="시/도 선택">
          {value === 'all' || !value
            ? '전국'
            : (SIDO_LIST.find((s) => s.code === value)?.name ?? '시/도 선택')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-[#dddddd]">
        <SelectItem value="all" className="text-sm">
          전국
        </SelectItem>
        {SIDO_LIST.map((sido) => (
          <SelectItem key={sido.code} value={sido.code} className="text-sm">
            {sido.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
