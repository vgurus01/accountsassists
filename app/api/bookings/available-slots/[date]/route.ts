import { getDefaultSlots, isBookableDay } from "@/app/lib/time";

export const runtime = "nodejs";

function parseISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const requested = date;
  const parsed = parseISODate(requested);
  if (!parsed) {
    return new Response("Invalid date format.", { status: 400 });
  }

  const slots = isBookableDay(parsed) ? getDefaultSlots() : [];
  return Response.json({ date: requested, slots });
}
