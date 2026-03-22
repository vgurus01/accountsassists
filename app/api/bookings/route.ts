import { SERVICES } from "@/app/lib/services";
import { getDefaultSlots, isBookableDay } from "@/app/lib/time";
import { sendResendEmail } from "@/app/lib/server/email";

export const runtime = "nodejs";

type BookingPayload = {
  service_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  notes?: string;
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
  let payload: BookingPayload;
  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  const serviceId = payload.service_id?.trim();
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();
  const date = payload.date?.trim();
  const time = payload.time?.trim();
  const notes = payload.notes?.trim();

  if (!serviceId || !name || !email || !date || !time) {
    return new Response("Missing required fields.", { status: 400 });
  }

  if (!SERVICES.some((service) => service.id === serviceId)) {
    return new Response("Invalid service selection.", { status: 400 });
  }

  if (!isValidEmail(email)) {
    return new Response("Invalid email address.", { status: 400 });
  }

  const parsedDate = parseISODate(date);
  if (!parsedDate || !isBookableDay(parsedDate)) {
    return new Response("Bookings are available every day.", { status: 400 });
  }

  if (!getDefaultSlots().includes(time)) {
    return new Response("Invalid time slot.", { status: 400 });
  }

  const subject = `New booking: ${name} - ${serviceNameFor(serviceId)}`;
  const lines = [
    `Service: ${serviceNameFor(serviceId)} (${serviceId})`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : "Phone: (not provided)",
    `Date: ${date}`,
    `Time: ${time}`,
    notes ? `Notes: ${notes}` : "Notes: (none)",
  ];

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
