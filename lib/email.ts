import { Resend } from "resend";

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "connect@blakash.com";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendCollaborationEmail(submission: {
  category: string;
  name: string;
  email: string;
  data: Record<string, string>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Don't throw — a missing email config shouldn't block the submission
    // from being saved to the database. The caller decides how to report this.
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);

  const fieldsHtml = Object.entries(submission.data)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `<tr><td style="padding:6px 12px 6px 0;color:#8E9395;font-size:13px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#E5E5E0;font-size:14px;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  const html = `
    <div style="background:#080808;padding:32px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#111212;border:1px solid rgba(142,147,149,0.15);border-radius:12px;padding:32px;">
        <p style="color:#8E9395;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">New Collaboration Request</p>
        <h1 style="color:#E5E5E0;font-size:22px;margin:0 0 20px;">${escapeHtml(submission.name)} — ${escapeHtml(capitalize(submission.category))}</h1>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 12px 6px 0;color:#8E9395;font-size:13px;white-space:nowrap;">Email</td><td style="padding:6px 0;color:#E5E5E0;font-size:14px;">${escapeHtml(submission.email)}</td></tr>
          ${fieldsHtml}
        </table>
        <p style="color:#555a5c;font-size:12px;margin-top:24px;">Sent from the BLAKASH collaborate form.</p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: "BLAKASH Game Studio <notifications@blakash.com>",
      to: ADMIN_NOTIFICATION_EMAIL,
      replyTo: submission.email,
      subject: `New collaboration request — ${capitalize(submission.category)}: ${submission.name}`,
      html,
    });
    return { sent: true, id: result.data?.id };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
