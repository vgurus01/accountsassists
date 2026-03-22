"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBase } from "../lib/api";
import { SERVICES, type ServiceId } from "../lib/services";
import {
  formatISODate,
  getDefaultSlots,
  isBookableDay,
  startOfDay,
} from "../lib/time";

type AvailabilityResponse = { date: string; slots: string[] };

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getNextBookableDay(from: Date) {
  let d = startOfDay(from);
  for (let i = 0; i < 14; i += 1) {
    if (isBookableDay(d)) return d;
    d = addDays(d, 1);
  }
  return startOfDay(from);
}

function monthMatrix(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const firstDow = (first.getDay() + 6) % 7; // Monday=0 ... Sunday=6
  const start = addDays(first, -firstDow);
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) days.push(addDays(start, i));
  return { year, month, days };
}

export default function BookingSection() {
  const apiBase = getApiBase();

  const today = useMemo(() => startOfDay(new Date()), []);
  const [monthAnchor, setMonthAnchor] = useState(() => getNextBookableDay(today));
  const [selectedDate, setSelectedDate] = useState(() => getNextBookableDay(today));

  const [serviceId, setServiceId] = useState<ServiceId>("accounting-bookkeeping");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const selectedISO = useMemo(() => formatISODate(selectedDate), [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      setMessage("");
      setSlot("");
      try {
        const res = await fetch(
          `${apiBase}/api/bookings/available-slots/${selectedISO}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load availability");
        const data = (await res.json()) as AvailabilityResponse;
        if (!cancelled) {
          setSlots(Array.isArray(data.slots) ? data.slots : getDefaultSlots());
          setStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setSlots(getDefaultSlots());
          setStatus("idle");
        }
      }
    }

    if (!isBookableDay(selectedDate) || selectedDate < today) {
      setSlots([]);
      return;
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, selectedISO, selectedDate, today]);

  const { month, year, days } = useMemo(
    () => monthMatrix(monthAnchor),
    [monthAnchor],
  );

  const monthLabel = useMemo(() => {
    const d = new Date(year, month, 1);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [month, year]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${apiBase}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          service_id: serviceId,
          date: selectedISO,
          time: slot,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Booking failed");
      }
      setStatus("success");
      setMessage("Booked. We’ll confirm by email shortly.");
      setNotes("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Booking failed");
    }
  }

  return (
    <section id="booking" className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Booking
          </div>
          <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
            Book an appointment (Daily, 9am–9pm).
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted md:text-base">
            Choose a date, pick a time slot, and tell us what you need. If you
            don’t see a suitable time, send a message and we’ll arrange one.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {monthLabel}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                  onClick={() =>
                    setMonthAnchor(new Date(year, month - 1, 1))
                  }
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="border border-foreground px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-foreground hover:text-background"
                  onClick={() =>
                    setMonthAnchor(new Date(year, month + 1, 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px border-b border-border bg-border text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="bg-surface px-3 py-3">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-border">
              {days.map((d) => {
                const isCurrentMonth = d.getMonth() === month;
                const disabled =
                  !isCurrentMonth || d < today || !isBookableDay(d);
                const isSelected = formatISODate(d) === selectedISO;
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(startOfDay(d))}
                    className={[
                      "h-12 bg-surface px-3 text-left text-sm transition-colors",
                      disabled ? "text-muted/40" : "hover:bg-background",
                      isSelected ? "bg-background" : "",
                    ].join(" ")}
                    aria-label={d.toDateString()}
                  >
                    <div className="flex items-center justify-between">
                      <span>{d.getDate()}</span>
                      {isSelected ? (
                        <span className="h-2 w-2 bg-foreground" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Available slots
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {slots.length ? (
                  slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={[
                        "border px-3 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                        slot === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-surface text-foreground hover:border-foreground",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-muted">
                    Select a date from today onwards to see availability.
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="border border-border bg-surface">
            <div className="border-b border-border px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Your details
              </div>
              <div className="mt-2 text-sm text-muted">
                {selectedISO} {slot ? `• ${slot}` : ""}
              </div>
            </div>

            <div className="grid gap-5 px-6 py-6">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Service
                </span>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value as ServiceId)}
                  className="border border-border bg-background px-4 py-3 text-sm"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-border bg-background px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="border border-border bg-background px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Phone (optional)
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-border bg-background px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Notes (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border border-border bg-background px-4 py-3 text-sm"
                />
              </label>

              <button
                type="submit"
                disabled={status === "loading" || !slot}
                className="bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Submitting…" : "Confirm booking"}
              </button>

              {message ? (
                <div
                  className={[
                    "border px-4 py-3 text-sm",
                    status === "success"
                      ? "border-foreground text-foreground"
                      : "border-border text-muted",
                  ].join(" ")}
                >
                  {message}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
