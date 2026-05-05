import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { bookingsService, BookingOverlapError } from "@/services/bookings.service";
import { bookingUpdateSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await bookingsService.getById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isAdmin(session.user.role) && booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(booking);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const current = await bookingsService.getById(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin(session.user.role) && current.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bookingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const booking = await bookingsService.update(id, parsed.data);
    return NextResponse.json(booking);
  } catch (e) {
    if (e instanceof BookingOverlapError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("[bookings PATCH]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const current = await bookingsService.getById(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin(session.user.role) && current.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await bookingsService.remove(id);
  return NextResponse.json({ ok: true });
}
