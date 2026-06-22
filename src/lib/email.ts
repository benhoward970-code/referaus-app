const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://referaus.com";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  /** If set, appends a one-click unsubscribe footer. Required for marketing/newsletter emails. */
  unsubscribeToken?: string;
  /** If true, this is a transactional email (no unsubscribe required by law, but we add a soft footer). */
  transactional?: boolean;
}

/** HTML footer appended to all emails for Australian Spam Act compliance. */
function buildFooter(opts: { unsubscribeToken?: string; transactional?: boolean }): string {
  const baseFooter = `
    <div style="padding:16px 32px 24px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
        ReferAus &middot; Newcastle, NSW &middot;
        <a href="${APP_URL}" style="color:#9ca3af;">referaus.com</a>
      </p>`;

  if (opts.unsubscribeToken) {
    const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${opts.unsubscribeToken}`;
    return baseFooter + `
      <p style="margin:0;color:#9ca3af;font-size:11px;">
        You received this because you subscribed to the ReferAus newsletter. &middot;
        <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>`;
  }

  if (opts.transactional) {
    return baseFooter + `
      <p style="margin:0;color:#9ca3af;font-size:11px;">
        This is a transactional notification related to your ReferAus account. &middot;
        <a href="${APP_URL}/dashboard" style="color:#9ca3af;text-decoration:underline;">Manage notifications</a>
      </p>
    </div>`;
  }

  return baseFooter + `</div>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "ReferAus <hello@referaus.com>",
  unsubscribeToken,
  transactional = false,
}: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.log("[Email] Resend not configured - would send:", { to, subject });
    return { success: false, demo: true };
  }

  // Inject footer before closing </div> of the outermost wrapper
  const footer = buildFooter({ unsubscribeToken, transactional });
  // Replace the last </div> with footer + </div>
  const fullHtml = html.replace(/<\/div>\s*$/, footer + "\n</div>");

  try {
    const headers: Record<string, string> = {
      Authorization: "Bearer " + RESEND_API_KEY,
      "Content-Type": "application/json",
    };
    // RFC 8058 one-click unsubscribe header for email clients
    if (unsubscribeToken) {
      const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
      headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({ from, to, subject, html: fullHtml }),
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return { success: false, error };
  }
}

/** Fetch the newsletter unsubscribe token for an email address (server-side only). */
export async function getNewsletterUnsubscribeToken(
  email: string,
  adminClient: ReturnType<typeof import("@supabase/supabase-js").createClient>
): Promise<string | null> {
  const { data } = await adminClient
    .from("newsletter")
    .select("unsubscribe_token, unsubscribed")
    .eq("email", email)
    .maybeSingle();
  if (!data || data.unsubscribed) return null;
  return data.unsubscribe_token as string;
}
