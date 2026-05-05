import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { roomsService } from "@/services/rooms.service";
import { roomSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await roomsService.list({ activeOnly: !isAdmin(session.user.role) });
  return NextResponse.json(rooms);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const room = await roomsService.create(parsed.data);
  return NextResponse.json(room, { status: 201 });
}
