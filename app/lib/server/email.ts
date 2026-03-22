import "server-only";

type ResendConfig = {
  apiKey: string;
  from: string;
  to: string[];
};

type SendEmailArgs = {
  subject: string;
  text: string;
  replyTo?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function parseRecipients(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const toRaw = process.env.RESEND_TO;
  if (!apiKey || !from || !toRaw) return null;
  const to = parseRecipients(toRaw);
  if (!to.length) return null;
  return { apiKey, from, to };
}

export async function sendResendEmail({ subject, text, replyTo }: SendEmailArgs) {
  const config = getResendConfig();
  if (!config) {
    throw new Error(
      "Email service is not configured. Set RESEND_API_KEY, RESEND_FROM, and RESEND_TO.",
    );
  }

  const payload: Record<string, unknown> = {
    from: config.from,
    to: config.to,
    subject,
    text,
  };

  if (replyTo) {
    payload.headers = { "Reply-To": replyTo };
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to send email.");
  }
}
