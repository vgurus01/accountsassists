from __future__ import annotations

import os
import uuid
from datetime import date, datetime
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


def default_slots() -> list[str]:
    return [f"{h:02d}:00" for h in range(9, 18)]


def is_weekday(d: date) -> bool:
    return d.weekday() < 5  # Mon=0..Sun=6


SERVICES: list[dict[str, Any]] = [
    {
        "id": "accounting-bookkeeping",
        "name": "Accounting & Book-Keeping",
        "summary": "Clarity-first bookkeeping and monthly reporting.",
        "bullets": [
            "Monthly reconciliations",
            "Management reports",
            "Year-end readiness",
        ],
    },
    {
        "id": "company-tax-vat",
        "name": "Company Tax & VAT",
        "summary": "Practical compliance with proactive planning.",
        "bullets": [
            "Corporation Tax returns",
            "VAT registration & filings",
            "Deadlines managed",
        ],
    },
    {
        "id": "self-assessment",
        "name": "Self Assessment",
        "summary": "Accurate filings, maximized allowances, zero stress.",
        "bullets": [
            "SA100 preparation",
            "Income & expenses review",
            "HMRC queries support",
        ],
    },
    {
        "id": "payroll",
        "name": "Payroll",
        "summary": "Reliable payroll runs and statutory reporting.",
        "bullets": [
            "RTI submissions",
            "Payslips & summaries",
            "Auto-enrolment support",
        ],
    },
]
SERVICE_IDS = {s["id"] for s in SERVICES}


class Callback(BaseModel):
    date: date
    time: str


class ContactIn(BaseModel):
    service_id: str
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    message: str = Field(min_length=1, max_length=5000)
    callback: Callback | None = None


class BookingIn(BaseModel):
    service_id: str
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    date: date
    time: str
    notes: str | None = Field(default=None, max_length=5000)


class AvailabilityOut(BaseModel):
    date: date
    slots: list[str]


class Storage:
    mode: Literal["memory", "mongo"]

    def __init__(self) -> None:
        self.mode = "memory"
        self._bookings: dict[str, set[str]] = {}
        self._mongo = None
        self._db = None

    async def init(self) -> None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            return
        try:
            from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore

            self._mongo = AsyncIOMotorClient(uri)
            self._db = self._mongo[os.getenv("MONGODB_DB", "accountassists")]
            self.mode = "mongo"
        except Exception:
            self.mode = "memory"

    async def list_booked_times(self, d: date) -> set[str]:
        key = d.isoformat()
        if self.mode == "mongo":
            assert self._db is not None
            cursor = self._db.bookings.find({"date": key}, {"time": 1})
            booked: set[str] = set()
            async for doc in cursor:
                if isinstance(doc.get("time"), str):
                    booked.add(doc["time"])
            return booked
        return set(self._bookings.get(key, set()))

    async def create_booking(self, booking: BookingIn) -> str:
        key = booking.date.isoformat()
        if self.mode == "mongo":
            assert self._db is not None
            existing = await self._db.bookings.find_one(
                {"date": key, "time": booking.time},
                {"_id": 1},
            )
            if existing:
                raise HTTPException(status_code=409, detail="That slot is already booked.")
            booking_id = str(uuid.uuid4())
            await self._db.bookings.insert_one(
                {
                    "booking_id": booking_id,
                    "service_id": booking.service_id,
                    "name": booking.name,
                    "email": str(booking.email),
                    "phone": booking.phone,
                    "date": key,
                    "time": booking.time,
                    "notes": booking.notes,
                    "created_at": datetime.utcnow(),
                }
            )
            return booking_id

        times = self._bookings.setdefault(key, set())
        if booking.time in times:
            raise HTTPException(status_code=409, detail="That slot is already booked.")
        times.add(booking.time)
        return str(uuid.uuid4())

    async def create_contact(self, contact: ContactIn) -> str:
        contact_id = str(uuid.uuid4())
        if self.mode == "mongo":
            assert self._db is not None
            await self._db.contacts.insert_one(
                {
                    "contact_id": contact_id,
                    "service_id": contact.service_id,
                    "name": contact.name,
                    "email": str(contact.email),
                    "phone": contact.phone,
                    "message": contact.message,
                    "callback": (
                        {"date": contact.callback.date.isoformat(), "time": contact.callback.time}
                        if contact.callback
                        else None
                    ),
                    "created_at": datetime.utcnow(),
                }
            )
        return contact_id


storage = Storage()
app = FastAPI(title="Account Assists API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    await storage.init()


@app.get("/api/services")
async def list_services() -> dict[str, Any]:
    return {"services": SERVICES}


@app.get("/api/bookings/available-slots/{day}", response_model=AvailabilityOut)
async def available_slots(day: date) -> AvailabilityOut:
    if not is_weekday(day):
        return AvailabilityOut(date=day, slots=[])
    booked = await storage.list_booked_times(day)
    slots = [s for s in default_slots() if s not in booked]
    return AvailabilityOut(date=day, slots=slots)


@app.post("/api/bookings")
async def create_booking(payload: BookingIn) -> dict[str, Any]:
    if payload.service_id not in SERVICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid service_id.")
    if not is_weekday(payload.date):
        raise HTTPException(status_code=400, detail="Bookings are available Monday–Friday only.")
    if payload.time not in default_slots():
        raise HTTPException(status_code=400, detail="Invalid time slot.")
    booking_id = await storage.create_booking(payload)
    return {"ok": True, "booking_id": booking_id}


@app.post("/api/contact")
async def create_contact(payload: ContactIn) -> dict[str, Any]:
    if payload.service_id not in SERVICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid service_id.")
    if payload.callback:
        if not is_weekday(payload.callback.date):
            raise HTTPException(status_code=400, detail="Callbacks are weekdays only.")
        if payload.callback.time not in default_slots():
            raise HTTPException(status_code=400, detail="Invalid callback time.")
    contact_id = await storage.create_contact(payload)
    return {"ok": True, "contact_id": contact_id}


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "storage_mode": storage.mode}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )

