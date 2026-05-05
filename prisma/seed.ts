import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin de prueba
  const adminPassword = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@censys.com.ar" },
    update: {},
    create: {
      email: "admin@censys.com.ar",
      name: "Admin Censys",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Usuario de prueba
  const userPassword = await bcrypt.hash("user1234", 10);
  await prisma.user.upsert({
    where: { email: "user@censys.com.ar" },
    update: {},
    create: {
      email: "user@censys.com.ar",
      name: "Usuario Demo",
      password: userPassword,
      role: Role.USER,
    },
  });

  // Salas de ejemplo
  const rooms = [
    {
      name: "Sala Marte",
      capacity: 8,
      location: "Piso 1 - Ala Norte",
      resources: ["proyector", "videoconferencia", "pizarra"],
    },
    {
      name: "Sala Júpiter",
      capacity: 14,
      location: "Piso 2 - Ala Sur",
      resources: ["tv", "videoconferencia"],
    },
    {
      name: "Sala Luna",
      capacity: 4,
      location: "Piso 1 - Ala Sur",
      resources: ["pizarra"],
    },
  ];

  for (const r of rooms) {
    await prisma.room.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  console.log("✅ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
