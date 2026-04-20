import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANIMAL_API_BASE = Deno.env.get('ANIMAL_API_BASE')!
const ANIMAL_API_KEY = Deno.env.get('ANIMAL_API_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchPage(pageNo: number) {
  const params = new URLSearchParams({
    serviceKey: ANIMAL_API_KEY,
    numOfRows: '1000',
    pageNo: String(pageNo),
    _type: 'json',
    state: 'protect',
  })
  const res = await fetch(`${ANIMAL_API_BASE}/abandonmentPublic?${params}`)
  const json = await res.json()
  return json.response?.body?.items?.item ?? []
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  const json = await res.json()
  return json.data[0].embedding
}

function buildEmbeddingText(item: Record<string, string>) {
  return [item.kindCd, item.age, item.sexCd, item.specialMark, item.weight]
    .filter(Boolean)
    .join(' ')
}

Deno.serve(async () => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  let pageNo = 1
  let totalSynced = 0

  while (true) {
    const items: Record<string, string>[] = await fetchPage(pageNo)
    if (!items.length) break

    for (const item of items) {
      const embText = buildEmbeddingText(item)
      const embedding = await getEmbedding(embText)

      const noticEdt = item.noticeEdt ?? ''
      const notice_edt = noticEdt.length === 8
        ? `${noticEdt.slice(0, 4)}-${noticEdt.slice(4, 6)}-${noticEdt.slice(6, 8)}`
        : null

      const row = {
        id: item.desertionNo,
        care_nm: item.careNm,
        care_tel: item.careTel ?? null,
        region_cd: item.orgCd?.slice(0, 7) ?? '',
        city_cd: item.orgCd ?? null,
        kind: item.kindCd ?? null,
        age: item.age ?? null,
        sex: (item.sexCd as 'M' | 'F' | 'Q') ?? 'Q',
        weight: item.weight ?? null,
        feature: item.specialMark ?? null,
        image_url: item.popfile ?? null,
        status: '보호중',
        notice_edt,
        embedding,
        synced_at: new Date().toISOString(),
        stale: false,
      }

      await supabase.from('animals').upsert(row, { onConflict: 'id' })
      totalSynced++
    }

    pageNo++
  }

  // 만료 처리
  await supabase
    .from('animals')
    .update({ status: 'expired' })
    .lt('notice_edt', today)
    .eq('status', '보호중')

  return new Response(JSON.stringify({ synced: totalSynced }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
