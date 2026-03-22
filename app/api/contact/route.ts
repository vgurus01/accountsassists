import { SERVICES } from "@/app/lib/services";
import { getDefaultSlots, isBookableDay } from "@/app/lib/time";
import { sendResendEmail } from "@/app/lib/server/email";

export const runtime = "nodejs";

type CallbackPayload = {
  date: string;
  time: string;
};

type ContactPayload = {
  service_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  callback?: CallbackPayload;
};

function parseISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function serviceNameFor(id: string) {
  return SERVICES.find((service) => service.id === id)?.name ?? id;
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  const serviceId = payload.service_id?.trim();
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();
  const message = payload.message?.trim();

  if (!serviceId || !name || !email || !message) {
    return new Response("Missing required fields.", { status: 400 });
  }

  if (!SERVICES.some((service) => service.id === serviceId)) {
    return new Response("Invalid service selection.", { status: 400 });
  }

  if (!isValidEmail(email)) {
    return new Response("Invalid email address.", { status: 400 });
  }

  if (payload.callback) {
    const callbackDate = parseISODate(payload.callback.date);
    if (!callbackDate || !isBookableDay(callbackDate)) {
      return new Response("Callbacks are available every day.", { status: 400 });
    }
    if (!getDefaultSlots().includes(payload.callback.time)) {
      return new Response("Invalid callback time.", { status: 400 });
    }
  }

  const subject = `New contact: ${name} - ${serviceNameFor(serviceId)}`;
  const lines = [
    `Service: ${serviceNameFor(serviceId)} (${serviceId})`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : "Phone: (not provided)",
  ];

  if (payload.callback) {
    lines.push(
      `Callback requested: ${payload.callback.date} at ${payload.callback.time}`,
    );
  } else {
    lines.push("Callback requested: No");
  }

  lines.push("", "Message:", message);

  try {
    await sendResendEmail({
      subject,
      text: lines.join("\n"),
      replyTo: email,
    });
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Failed to send email.",
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
