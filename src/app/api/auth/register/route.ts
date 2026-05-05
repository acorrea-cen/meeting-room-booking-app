import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalized = email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email: normalized } });
    if (exists) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: normalized, password: hash },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
