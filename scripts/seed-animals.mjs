#!/usr/bin/env node
// Local sync script: fetches animals from 농림축산식품부 API and upserts to Supabase with embeddings.
// Usage: node scripts/seed-animals.mjs
// Requires: .env.local with ANIMAL_API_KEY, ANIMAL_API_BASE, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Parse .env.local
function loadEnv() {
  const raw = readFileSync('.env.local', 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=\s]+)=(.*)$/)
    if (match) env[match[1]] = match[2].trim()
  }
  return env
}

const env = loadEnv()

const ANIMAL_API_BASE = env.ANIMAL_API_BASE
const ANIMAL_API_KEY = decodeURIComponent(env.ANIMAL_API_KEY) // .env.local stores URL-encoded key
const OPENAI_API_KEY = env.OPENAI_API_KEY
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

const PAGES_TO_SYNC = 2   // 2 pages × 100 items = ~200 animals
const PAGE_SIZE = 100

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchPage(pageNo) {
  const params = new URLSearchParams({
    serviceKey: ANIMAL_API_KEY,
    numOfRows: String(PAGE_SIZE),
    pageNo: String(pageNo),
    _type: 'json',
    state: 'protect',
  })
  const url = `${ANIMAL_API_BASE}?${params}`
  const res = await fetch(url)
  const json = await res.json()
  return json.response?.body?.items?.item ?? []
}

async function getEmbeddingsBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
  })
  const json = await res.json()
  if (!json.data) throw new Error(`OpenAI error: ${JSON.stringify(json)}`)
  return json.data.map(d => d.embedding)
}

function buildEmbeddingText(item) {
  return [item.kindCd, item.age, item.sexCd, item.specialMark, item.weight]
    .filter(Boolean)
    .join(' ')
}

function toRow(item, embedding) {
  const noticEdt = item.noticeEdt ?? ''
  const notice_edt = noticEdt.length === 8
    ? `${noticEdt.slice(0, 4)}-${noticEdt.slice(4, 6)}-${noticEdt.slice(6, 8)}`
    : null

  return {
    id: item.desertionNo,
    care_nm: item.careNm,
    care_tel: item.careTel ?? null,
    region_cd: item.orgCd?.slice(0, 7) ?? '',
    city_cd: item.orgCd ?? null,
    kind: item.kindCd ?? null,
    age: item.age ?? null,
    sex: item.sexCd ?? 'Q',
    weight: item.weight ?? null,
    feature: item.specialMark ?? null,
    image_url: item.popfile1 ?? item.popfile ?? null,
    status: '보호중',
    notice_edt,
    embedding,
    synced_at: new Date().toISOString(),
    stale: false,
  }
}

async function main() {
  console.log(`Syncing ${PAGES_TO_SYNC} pages (${PAGES_TO_SYNC * PAGE_SIZE} animals max)...`)
  let totalSynced = 0

  for (let pageNo = 1; pageNo <= PAGES_TO_SYNC; pageNo++) {
    console.log(`Fetching page ${pageNo}...`)
    const items = await fetchPage(pageNo)
    if (!items.length) { console.log('No more items.'); break }

    const BATCH = 20 // embed 20 at a time
    for (let i = 0; i < items.length; i += BATCH) {
      const slice = items.slice(i, i + BATCH)
      const texts = slice.map(buildEmbeddingText)
      process.stdout.write(`  Embedding ${i + 1}–${Math.min(i + BATCH, items.length)} of ${items.length}...`)
      const embeddings = await getEmbeddingsBatch(texts)
      const rows = slice.map((item, j) => toRow(item, embeddings[j]))
      const { error } = await supabase.from('animals').upsert(rows, { onConflict: 'id' })
      if (error) console.error('\n  Upsert error:', error.message)
      else { process.stdout.write(' ok\n'); totalSynced += rows.length }
    }
  }

  console.log(`\nDone. Synced ${totalSynced} animals.`)
}

main().catch(err => { console.error(err); process.exit(1) })
