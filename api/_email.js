// Sends a "we received your submission" confirmation email via Resend
// (https://resend.com). If RESEND_API_KEY isn't set, this silently does
// nothing — so the customer's submission still succeeds even before email
// is configured.

async function sendConfirmationEmail({ to, name, referenceId }) {
  if (!process.env.RESEND_API_KEY || !to) return;

  const fromAddress = process.env.EMAIL_FROM || 'Luxorya <onboarding@resend.dev>';
  const firstName = (name || '').split(' ')[0] || 'there';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to,
        subject: 'We received your submission — Luxorya',
        html: `
          <div style="font-family:Arial,sans-serif;color:#231F20;max-width:480px;margin:0 auto;">
            <h2 style="color:#554b42;">Thank you, ${firstName}!</h2>
            <p>We've received your piece and our authentication team will review it shortly. We'll follow up with you at this email address once it's done.</p>
            ${referenceId ? `<p style="color:#7a6f63;font-size:14px;">Reference: ${referenceId}</p>` : ''}
            <p>— Luxorya</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    // Never let an email failure break the customer's successful submission.
    console.error('Failed to send confirmation email:', err.message);
  }
}

module.exports = { sendConfirmationEmail };
