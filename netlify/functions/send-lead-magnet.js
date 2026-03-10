// Netlify Function to send lead magnet email via Resend
// Path: netlify/functions/send-lead-magnet.js

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Magari & Co. <hello@casamagari.com>'

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'Missing RESEND_API_KEY in Netlify environment' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: JSON.stringify(data) || res.statusText }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' }
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const email = (body.email || '').trim()
    const name = (body.name || '').trim()

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) }
    }

    const subject = 'Your free guide: 5 Design Secrets That Help Homes Sell Faster'
    const guideUrl = 'https://casamagari.com/guides/5-design-secrets-that-help-homes-sell-faster.pdf'

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p>Hi${name ? ` ${name}` : ''},</p>
        <p>Here is your free guide: <strong>“5 Design Secrets That Help Homes Sell Faster”</strong>.</p>
        <p>You can download it here:</p>
        <p>
          <a
            href="${guideUrl}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#2D3A2E;color:#fff;text-decoration:none;font-weight:600;"
          >
            Download the guide
          </a>
        </p>
        <p style="margin-top:24px;">
          Whether you&apos;re preparing to list your home or helping clients get ready,
          these five shifts will help your spaces photograph better and feel more inviting at showings.
        </p>
        <p style="margin-top:24px;">
          With care,<br/>
          Elena<br/>
          Magari &amp; Co.
        </p>
      </div>
    `

    const result = await sendEmail(email, subject, html)
    if (!result.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: result.error }) }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Unexpected error' }),
    }
  }
}

