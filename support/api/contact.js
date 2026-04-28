// PartyKeys Help Center — contact form endpoint
// POST /api/contact { email, subject?, message, orderId?, lang? } → sends email via Resend
// Required env: RESEND_API_KEY
// Optional env:
//   RESEND_FROM (default "PartyKeys Help Center <onboarding@resend.dev>")
//   RESEND_TO   (default "support@partykeys.com")

export const config = { runtime: 'edge' };

// Very simple in-memory rate limit (per Edge isolate). Not perfect but enough to deter spam.
// For production-grade rate limiting, use Vercel KV / Upstash.
const RATE_LIMIT_PER_MIN = 5;
const recent = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const arr = (recent.get(ip) || []).filter((t) => t > windowStart);
  if (arr.length >= RATE_LIMIT_PER_MIN) return true;
  arr.push(now);
  recent.set(ip, arr);
  // Keep map small
  if (recent.size > 1000) {
    for (const [k, v] of recent) {
      if (v[v.length - 1] < windowStart) recent.delete(k);
    }
  }
  return false;
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
  if (req.method !== 'POST') return jsonError('Method not allowed', 405);

  // Parse body
  let body;
  try { body = await req.json(); } catch (e) { return jsonError('Invalid JSON', 400); }

  const email = (body.email || '').toString().trim();
  const subject = ((body.subject || '').toString().trim() || 'Support inquiry').slice(0, 120);
  const message = (body.message || '').toString().trim();
  const orderId = (body.orderId || '').toString().trim().slice(0, 80);
  const lang = (body.lang || 'en').toString().slice(0, 12);
  const honeypot = (body.website || '').toString().trim();

  // Honeypot field (bots fill all fields)
  if (honeypot) return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });

  // Validation
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError('Please enter a valid email address.', 400);
  if (!message || message.length < 10) return jsonError('Please add a few details about your question (at least 10 characters).', 400);
  if (message.length > 5000) return jsonError('Message too long (max 5000 characters).', 400);

  // Rate limit per IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return jsonError('Too many requests. Please wait a minute and try again.', 429);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return jsonError('Email service not configured (missing RESEND_API_KEY).', 500);

  const FROM = process.env.RESEND_FROM || 'PartyKeys Help Center <onboarding@resend.dev>';
  const TO = process.env.RESEND_TO || 'support@partykeys.com';

  const pageUrl = req.headers.get('referer') || '';
  const userAgent = req.headers.get('user-agent') || '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1D1D1F; max-width: 640px;">
      <h2 style="font-size: 20px; margin: 0 0 16px;">${esc(subject)}</h2>
      <table style="border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #6E6E73;">From</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6E6E73;">Order ID</td><td>${esc(orderId || '—')}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6E6E73;">Language</td><td>${esc(lang)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6E6E73;">Page</td><td>${esc(pageUrl)}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
      <pre style="white-space: pre-wrap; font-family: inherit; font-size: 15px; line-height: 1.55; margin: 0;">${esc(message)}</pre>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0 12px;" />
      <p style="color: #8A8A8E; font-size: 12px; margin: 0;">Sent via PartyKeys Help Center · UA: ${esc(userAgent.slice(0, 200))}</p>
    </div>
  `;

  const text = [
    `${subject}`,
    ``,
    `From: ${email}`,
    `Order ID: ${orderId || '—'}`,
    `Language: ${lang}`,
    `Page: ${pageUrl}`,
    ``,
    `---`,
    ``,
    message,
  ].join('\n');

  let resp;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `[Help Center] ${subject}`,
        html,
        text,
      }),
    });
  } catch (e) {
    return jsonError('Could not reach mail service: ' + (e && e.message), 502);
  }

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    return jsonError('Mail service error: ' + (errText.slice(0, 300) || resp.status), resp.status || 502);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
