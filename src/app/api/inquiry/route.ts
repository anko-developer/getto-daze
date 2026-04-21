import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

let _resend: Resend | null = null;
function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!user.email)
    return NextResponse.json({ error: '이메일 정보가 없어요' }, { status: 400 });

  const { animal_id, animal_kind, care_nm, care_tel, message } =
    await request.json();

  const { error } = await getResendClient().emails.send({
    from: 'getto daze <onboarding@resend.dev>',
    to: user.email,
    subject: `[getto daze] ${escapeHtml(String(animal_kind).replace(/\s+/g, ' ').trim())} 입양 문의 내용`,
    html: `
      <h2>문의하신 내용을 저장했어요</h2>
      <p><strong>동물 ID:</strong> ${escapeHtml(String(animal_id))}</p>
      <p><strong>품종:</strong> ${escapeHtml(String(animal_kind))}</p>
      <p><strong>보호센터:</strong> ${escapeHtml(String(care_nm))}</p>
      <p><strong>센터 전화번호:</strong> ${escapeHtml(String(care_tel))}</p>
      <hr/>
      <p><strong>문의 내용:</strong></p>
      <p>${escapeHtml(String(message))}</p>
      <hr/>
      <p style="color:#888">센터에 직접 전화하거나 방문 예약 후 입양 절차를 진행하세요.</p>
    `,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
