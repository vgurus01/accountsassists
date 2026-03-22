"use client";

import { useMemo, useState } from "react";
import { getApiBase } from "../lib/api";
import { SERVICES, type ServiceId } from "../lib/services";
import {
  formatISODate,
  getDefaultSlots,
  isBookableDay,
  startOfDay,
} from "../lib/time";

export default function ContactSection() {
  const apiBase = getApiBase();

  const today = useMemo(() => startOfDay(new Date()), []);
  const whatsappNumber = "447845420967";
  const whatsappDisplay = "+44 7845 420967";
  const businessEmail = "info@accountsassists.com";

  const [serviceId, setServiceId] = useState<ServiceId>("self-assessment");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [messageBody, setMessageBody] = useState("");

  const [callback, setCallback] = useState(false);
  const [callbackDate, setCallbackDate] = useState(() => formatISODate(today));
  const [callbackTime, setCallbackTime] = useState(getDefaultSlots()[0] ?? "09:00");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setResult("");
    try {
      const res = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          name,
          email,
          phone: phone || undefined,
          message: messageBody,
          callback: callback
            ? { date: callbackDate, time: callbackTime }
            : undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Submission failed");
      }
      setStatus("success");
      setResult("Message sent. We’ll reply shortly.");
      setMessageBody("");
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "Submission failed");
    }
  }

  const callbackDateOk = useMemo(() => {
    const parts = callbackDate.split("-").map((p) => Number(p));
    if (parts.length !== 3) return false;
    const d = new Date(parts[0]!, (parts[1] ?? 1) - 1, parts[2]!);
    return isBookableDay(d) && startOfDay(d) >= today;
  }, [callbackDate, today]);

  return (
    <section id="contact" className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Get In Touch
            </div>
            <h2 className="text-3xl leading-tight md:text-4xl">
              Ready to simplify your finances? Contact us today.
            </h2>
            <p className="text-sm leading-7 text-muted md:text-base">
              Contact us today for a free, no-obligation consultation. We&apos;re
              here to answer your questions and discuss how we can help.
            </p>

            <div className="grid gap-4 border border-border bg-surface p-8">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-foreground px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
              >
                Message us on WhatsApp
              </a>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  WhatsApp
                </div>
                <div className="mt-1 text-sm text-foreground">
                  <a href={`tel:+${whatsappNumber}`} className="hover:underline">
                    {whatsappDisplay}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Email
                </div>
                <div className="mt-1 text-sm text-foreground">
                  <a href={`mailto:${businessEmail}`} className="hover:underline">
                    {businessEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="border border-border bg-surface">
            <div className="border-b border-border px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Drop us a line!
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

              <div className="grid gap-5 md:grid-cols-2">
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
                    Phone (optional)
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-border bg-background px-4 py-3 text-sm"
                  />
                </label>
              </div>

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
                  Message
                </span>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  required
                  rows={5}
                  className="border border-border bg-background px-4 py-3 text-sm"
                />
              </label>

              <div className="border border-border bg-background p-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Request a callback (optional)
                  </span>
                  <input
                    type="checkbox"
                    checked={callback}
                    onChange={(e) => setCallback(e.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                </label>

                {callback ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Preferred date
                      </span>
                      <input
                        type="date"
                        value={callbackDate}
                        onChange={(e) => setCallbackDate(e.target.value)}
                        className={[
                          "border bg-surface px-4 py-3 text-sm",
                          callbackDateOk ? "border-border" : "border-foreground",
                        ].join(" ")}
                      />
                      {!callbackDateOk ? (
                        <div className="text-xs text-muted">
                          Any day from today onwards.
                        </div>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Preferred time
                      </span>
                      <select
                        value={callbackTime}
                        onChange={(e) => setCallbackTime(e.target.value)}
                        className="border border-border bg-surface px-4 py-3 text-sm"
                      >
                        {getDefaultSlots().map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={status === "loading" || (callback && !callbackDateOk)}
                className="bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Send message"}
              </button>

              {result ? (
                <div
                  className={[
                    "border px-4 py-3 text-sm",
                    status === "success"
                      ? "border-foreground text-foreground"
                      : "border-border text-muted",
                  ].join(" ")}
                >
                  {result}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
