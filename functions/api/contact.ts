// ─────────────────────────────────────────────────────────────────────────
// Cloudflare Pages Function: POST /api/contact
//
// Environment variables (set in Cloudflare Pages Dashboard →
//   Settings → Environment variables):
//
//   RESEND_API_KEY        — your Resend API key (re_xxxxxx)
//   EMAIL_FROM            — sender address (e.g. "AZGYL Website <noreply@azgyl.com>")
//   EMAIL_TO              — a single address OR a JSON object mapping
//                           department names to addresses, e.g.:
//                           {"General Questions":"azgirlsyouthlax@gmail.com",
//                            "Officials":"azgirlsyouthlax@gmail.com"}
//                           Any department not found falls back to the
//                           first value in the object.
//                           If unset, everything goes to the league inbox
//                           (azgirlsyouthlax@gmail.com) — see below.
//   RECAPTCHA_SECRET      — Google reCAPTCHA v3 secret key
//   RECAPTCHA_MIN_SCORE   — minimum score to accept (default "0.5")
// ─────────────────────────────────────────────────────────────────────────

interface Env {
  RESEND_API_KEY:      string;
  EMAIL_FROM:          string;
  EMAIL_TO:            string;
  RECAPTCHA_SECRET?:   string;
  RECAPTCHA_MIN_SCORE?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body.' }), { status: 400, headers: corsHeaders });
  }

  const { name, email, department, team, message, recaptchaToken } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ ok: false, error: 'Name, email, and message are required.' }), { status: 422, headers: corsHeaders });
  }

  // ── reCAPTCHA v3 verification (if secret is configured) ─────────────────
  if (env.RECAPTCHA_SECRET && recaptchaToken) {
    const minScore = parseFloat(env.RECAPTCHA_MIN_SCORE ?? '0.5');
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`,
    });
    const result = await verify.json() as { success: boolean; score: number };
    if (!result.success || result.score < minScore) {
      return new Response(JSON.stringify({ ok: false, error: 'reCAPTCHA check failed. Please try again.' }), { status: 403, headers: corsHeaders });
    }
  }

  // ── Resolve "to" address ─────────────────────────────────────────────────
  // EMAIL_TO can be a plain address or a JSON object keyed by department name
  // League inbox — used whenever EMAIL_TO is not set in the Pages environment.
  // Was info@azgyl.com, which had no mailbox behind it, so unrouted enquiries
  // were being lost. Updated 2026-08-09.
  let toAddress = env.EMAIL_TO ?? 'azgirlsyouthlax@gmail.com';
  try {
    const mapping = JSON.parse(env.EMAIL_TO) as Record<string, string>;
    const values  = Object.values(mapping);
    toAddress     = mapping[department ?? ''] ?? values[0] ?? toAddress;
  } catch {
    // EMAIL_TO is a plain string — use as-is
  }

  // ── Send via Resend ──────────────────────────────────────────────────────
  const subject = `${department ?? 'Website Inquiry'}${team ? ` — ${team}` : ''}`;
  const html = `
    <p><strong>Name:</strong> ${escHtml(name)}</p>
    <p><strong>Email:</strong> ${escHtml(email)}</p>
    <p><strong>Department:</strong> ${escHtml(department ?? '—')}</p>
    ${team ? `<p><strong>Team/Area:</strong> ${escHtml(team)}</p>` : ''}
    <hr />
    <p>${escHtml(message).replace(/\n/g, '<br>')}</p>
  `.trim();

  const resendRes = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     env.EMAIL_FROM ?? 'AZGYL Website <noreply@azgyl.com>',
      to:       [toAddress],
      reply_to: email,
      subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Email delivery failed. Please try again.' }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
