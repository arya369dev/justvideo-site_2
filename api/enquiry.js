// Vercel serverless function: POST /api/enquiry
// Sends the enquiry form to your inbox through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   required. Your Resend API key.
//   ENQUIRY_TO       required. Inbox that receives enquiries, e.g. justvideobroadcasting@gmail.com
//   ENQUIRY_FROM     optional. Verified sender, e.g. "JustVideo Website <enquiries@yourdomain.com>".
//                    Defaults to Resend's test sender, which only delivers to the Resend account's own email.
//   ALLOWED_ORIGIN   optional. e.g. https://www.yourdomain.com. Requests from other sites are rejected.

const hits = new Map(); // simple per-instance rate limit: 5 per 10 minutes per IP
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function wantsJson(req) {
  return (req.headers['accept'] || '').includes('application/json') || (req.headers['content-type'] || '').includes('application/json');
}

function reply(req, res, status, body) {
  if (wantsJson(req)) return res.status(status).json(body);
  res.setHeader('Location', body.ok ? '/thank-you' : '/enquiry-error');
  return res.status(303).end();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.origin;
  if (allowed && origin && origin !== allowed) {
    return reply(req, res, 403, { ok: false, error: 'Request not allowed.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return reply(req, res, 429, { ok: false, error: 'Too many enquiries in a short time.' });
  }
  recent.push(now);
  hits.set(ip, recent);

  let b = req.body || {};
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = Object.fromEntries(new URLSearchParams(b)); }
  }
  const f = {
    name: String(b.name || '').trim().slice(0, 100),
    phone: String(b.phone || '').trim().slice(0, 20),
    email: String(b.email || '').trim().slice(0, 150),
    service: String(b.service || '').trim().slice(0, 60),
    dates: String(b.dates || '').trim().slice(0, 120),
    message: String(b.message || '').trim().slice(0, 3000),
  };

  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (String(b.company_site || '').trim()) return reply(req, res, 200, { ok: true });

  const errors = {};
  if (f.name.length < 2) errors.name = 'Please enter your name.';
  if (f.phone.replace(/\D/g, '').length < 8) errors.phone = 'Please enter a phone number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) errors.email = 'Please enter a valid email address.';
  if (f.message.length < 5) errors.message = 'Please tell us what you need.';
  if (Object.keys(errors).length) {
    return reply(req, res, 422, { ok: false, error: 'Please fix the highlighted fields.', fields: errors });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO;
  if (!key || !to) {
    return reply(req, res, 503, { ok: false, error: 'The enquiry form is not set up yet.' });
  }

  const rows = [
    ['Name', f.name], ['Phone / WhatsApp', f.phone], ['Email', f.email],
    ['Service', f.service], ['Dates & city', f.dates || '-'],
  ];
  const html =
    '<h2 style="font-family:Arial,sans-serif">New website enquiry</h2>' +
    '<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(([k, v]) => `<tr><td style="color:#555"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('') +
    '</table>' +
    `<p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap"><b>Requirement</b><br>${esc(f.message)}</p>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nRequirement:\n${f.message}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM || 'JustVideo Website <onboarding@resend.dev>',
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: f.email,
        subject: `Enquiry: ${f.service} from ${f.name}`,
        html,
        text,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.id) {
      console.error('Resend error', r.status, data);
      return reply(req, res, 502, { ok: false, error: 'Sorry, your enquiry could not be sent.' });
    }
    return reply(req, res, 200, { ok: true });
  } catch (err) {
    console.error('Resend request failed', err);
    return reply(req, res, 502, { ok: false, error: 'Sorry, your enquiry could not be sent.' });
  }
};
