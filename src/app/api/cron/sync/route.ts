import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-animals`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    }
  )
  const data = await res.json()
  return NextResponse.json(data)
}
