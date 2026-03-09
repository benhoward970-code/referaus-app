import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** Rendered HTML string (use renderToStaticMarkup on your template component) */
  html: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM ?? 'ReferAus <noreply@referaus.com.au>';

/**
 * Send an email via Resend.
 * Gracefully no-ops (logs to console) if RESEND_API_KEY is not configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, from = DEFAULT_FROM, replyTo } = options;

  const client = getResendClient();

  if (!client) {
    // Graceful fallback: log and return success so the app doesn't crash
    console.warn('[email] RESEND_API_KEY not configured — email not sent:', {
      to,
      subject,
      from,
    });
    return { success: true, id: 'no-op' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[email] Unexpected error:', message);
    return { success: false, error: message };
  }
}
