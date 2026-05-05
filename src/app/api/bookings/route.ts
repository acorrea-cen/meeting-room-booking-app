import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bookingsService, BookingOverlapError } from "@/services/bookings.service";
import { bookingSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const roomId = url.searchParams.get("roomId") ?? undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const mine = url.searchParams.get("mine") === "true";

  // Cualquier usuario autenticado ve TODAS las reservas (estilo Google Calendar).
  // Para limitar a las propias se puede pasar ?mine=true (lo usa /bookings).
  const userId = mine ? session.user.id : undefined;

  const bookings = await bookingsService.list({
    roomId,
    userId,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const booking = await bookingsService.create(session.user.id, parsed.data);
    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    if (e instanceof BookingOverlapError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("[bookings POST]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
