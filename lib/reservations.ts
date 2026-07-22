// Server-only data layer for Phase 2 in-app booking (time slots + capacity).
// Same JSON-file-on-disk pattern as placesStore.ts — swap for a real
// database later without touching the API routes or UI, just this file.
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SLOTS_PATH = path.join(DATA_DIR, "reservation-slots.json");
const BOOKINGS_PATH = path.join(DATA_DIR, "bookings.json");

export type ReservationSlot = {
  id: string;
  placeId: string;
  title?: string;
  imageSrc?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  capacity: number;
  note?: string;
  createdAt: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  placeId: string;
  slotId: string;
  name: string;
  phone: string;
  partySize: number;
  note?: string;
  status: BookingStatus;
  createdAt: string;
};

export type SlotWithAvailability = ReservationSlot & { remaining: number };

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readSlots(): Promise<ReservationSlot[]> {
  return readJson(SLOTS_PATH, []);
}

export async function readBookings(): Promise<Booking[]> {
  return readJson(BOOKINGS_PATH, []);
}

function booked(slotId: string, bookings: Booking[]): number {
  return bookings
    .filter((b) => b.slotId === slotId && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.partySize, 0);
}

export async function listSlotsForPlace(placeId: string, opts: { upcomingOnly?: boolean } = {}): Promise<SlotWithAvailability[]> {
  const [slots, bookings] = await Promise.all([readSlots(), readBookings()]);
  const todayKey = new Date().toISOString().slice(0, 10);
  return slots
    .filter((s) => s.placeId === placeId)
    .filter((s) => (opts.upcomingOnly ? s.date >= todayKey : true))
    .map((s) => ({ ...s, remaining: Math.max(0, s.capacity - booked(s.id, bookings)) }))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export async function createSlot(input: {
  placeId: string;
  title?: string;
  imageSrc?: string;
  date: string;
  time: string;
  capacity: number;
  note?: string;
}): Promise<ReservationSlot> {
  const slots = await readSlots();
  const slot: ReservationSlot = {
    id: `slot-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    placeId: input.placeId,
    title: input.title,
    imageSrc: input.imageSrc,
    date: input.date,
    time: input.time,
    capacity: input.capacity,
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  slots.push(slot);
  await writeJson(SLOTS_PATH, slots);
  return slot;
}

export async function deleteSlot(slotId: string): Promise<"ok" | "not_found" | "has_bookings"> {
  const [slots, bookings] = await Promise.all([readSlots(), readBookings()]);
  const idx = slots.findIndex((s) => s.id === slotId);
  if (idx === -1) return "not_found";
  const hasActiveBookings = bookings.some((b) => b.slotId === slotId && b.status !== "cancelled");
  if (hasActiveBookings) return "has_bookings";
  slots.splice(idx, 1);
  await writeJson(SLOTS_PATH, slots);
  return "ok";
}

export async function listBookingsForPlace(placeId: string): Promise<(Booking & { slot: ReservationSlot | null })[]> {
  const [slots, bookings] = await Promise.all([readSlots(), readBookings()]);
  const slotById = new Map(slots.map((s) => [s.id, s]));
  return bookings
    .filter((b) => b.placeId === placeId)
    .map((b) => ({ ...b, slot: slotById.get(b.slotId) ?? null }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createBooking(input: {
  placeId: string;
  slotId: string;
  name: string;
  phone: string;
  partySize: number;
  note?: string;
}): Promise<{ ok: true; booking: Booking } | { ok: false; error: string }> {
  const [slots, bookings] = await Promise.all([readSlots(), readBookings()]);
  const slot = slots.find((s) => s.id === input.slotId && s.placeId === input.placeId);
  if (!slot) return { ok: false, error: "找不到這個時段" };
  const remaining = slot.capacity - booked(slot.id, bookings);
  if (input.partySize > remaining) return { ok: false, error: "此時段名額不足" };

  const booking: Booking = {
    id: `booking-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    placeId: input.placeId,
    slotId: input.slotId,
    name: input.name,
    phone: input.phone,
    partySize: input.partySize,
    note: input.note,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  await writeJson(BOOKINGS_PATH, bookings);
  return { ok: true, booking };
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
  const bookings = await readBookings();
  const idx = bookings.findIndex((b) => b.id === bookingId);
  if (idx === -1) return null;
  bookings[idx] = { ...bookings[idx], status };
  await writeJson(BOOKINGS_PATH, bookings);
  return bookings[idx];
}
