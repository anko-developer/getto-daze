import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const region_cd = searchParams.get('region_cd')
  const city_cd = searchParams.get('city_cd')
  const kind = searchParams.get('kind')
  const sex = searchParams.get('sex')

  const supabase = await createClient()

  let query = supabase
    .from('animals')
    .select('id, care_nm, care_tel, region_cd, city_cd, kind, age, sex, image_url, status, notice_edt, stale')
    .neq('status', 'expired')
    .order('synced_at', { ascending: false })

  if (region_cd) query = query.eq('region_cd', region_cd)
  if (city_cd) query = query.eq('city_cd', city_cd)
  if (kind) query = query.eq('kind', kind)
  if (sex) query = query.eq('sex', sex)

  const { data, error } = await query.limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ animals: data ?? [] })
}
