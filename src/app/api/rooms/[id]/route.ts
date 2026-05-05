import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { roomsService } from "@/services/rooms.service";
import { roomSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const room = await roomsService.getById(id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const parsed = roomSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const room = await roomsService.update(id, parsed.data);
  return NextResponse.json(room);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await roomsService.remove(id);
  return NextResponse.json({ ok: true });
}
