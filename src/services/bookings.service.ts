import { prisma } from "@/lib/prisma";
import type { BookingInput } from "@/lib/validators";

export class BookingOverlapError extends Error {
  constructor(message = "El horario se superpone con otra reserva en la misma sala") {
    super(message);
    this.name = "BookingOverlapError";
  }
}

export const bookingsService = {
  /**
   * Listar reservas. Si se pasa rango, devuelve sólo las que se intersectan con [from, to].
   * - filters.roomId: filtrar por sala
   * - filters.userId: filtrar por usuario (USER ve sus reservas)
   */
  list(filters: {
    roomId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  } = {}) {
    const { roomId, userId, from, to } = filters;
    return prisma.booking.findMany({
      where: {
        ...(roomId && { roomId }),
        ...(userId && { userId }),
        ...(from && to && {
          // Intersección de rangos: start < to AND end > from
          AND: [{ startTime: { lt: to } }, { endTime: { gt: from } }],
        }),
      },
      include: {
        room: { select: { id: true, name: true, location: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    });
  },

  getById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { room: true, user: { select: { id: true, name: true, email: true } } },
    });
  },

  /**
   * Verifica que no haya superposición en la misma sala.
   * Reglas de solapamiento: existing.start < new.end AND existing.end > new.start
   * (start..end son medio-abiertos: [start, end))
   */
  async assertNoOverlap(
    roomId: string,
    startTime: Date,
    endTime: Date,
    ignoreBookingId?: string
  ) {
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        ...(ignoreBookingId && { NOT: { id: ignoreBookingId } }),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });
    if (overlap) throw new BookingOverlapError();
  },

  async create(userId: string, data: BookingInput) {
    await this.assertNoOverlap(data.roomId, data.startTime, data.endTime);
    return prisma.booking.create({
      data: { ...data, userId },
      include: { room: true },
    });
  },

  async update(id: string, data: Partial<BookingInput>) {
    const current = await prisma.booking.findUnique({ where: { id } });
    if (!current) throw new Error("Reserva no encontrada");

    const start = data.startTime ?? current.startTime;
    const end = data.endTime ?? current.endTime;
    const roomId = data.roomId ?? current.roomId;

    if (end <= start) throw new Error("endTime debe ser posterior a startTime");
    await this.assertNoOverlap(roomId, start, end, id);

    return prisma.booking.update({
      where: { id },
      data,
      include: { room: true },
    });
  },

  remove(id: string) {
    return prisma.booking.delete({ where: { id } });
  },
};
