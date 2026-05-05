import { prisma } from "@/lib/prisma";
import type { RoomInput } from "@/lib/validators";

export const roomsService = {
  list({ activeOnly = true } = {}) {
    return prisma.room.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { name: "asc" },
    });
  },

  getById(id: string) {
    return prisma.room.findUnique({ where: { id } });
  },

  create(data: RoomInput) {
    return prisma.room.create({ data });
  },

  update(id: string, data: Partial<RoomInput>) {
    return prisma.room.update({ where: { id }, data });
  },

  remove(id: string) {
    // Soft-delete: marcar como inactiva. Cambiar a delete() si se quiere borrado físico.
    return prisma.room.update({ where: { id }, data: { active: false } });
  },
};
