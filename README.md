# Meeting Room Booking App — Censys

Aplicación web en **Next.js (App Router)** para reservar salas de reuniones, estilo Google Calendar / Google Meet, con roles **ADMIN** y **USER**, restringida a emails `@censys.com.ar`.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **PostgreSQL** (Supabase) + **Prisma**
- **NextAuth.js** (Credentials) + bcrypt
- **TailwindCSS** + componentes estilo **shadcn/ui**
- **FullCalendar** para la vista de reservas
- **Zod** para validaciones

## Estructura del proyecto

```
meeting-room-booking-app/
├── prisma/
│   ├── schema.prisma           # User, Room, Booking + tablas NextAuth
│   └── seed.ts                 # Admin/User demo + 3 salas
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + SessionProvider
│   │   ├── page.tsx            # Landing
│   │   ├── globals.css
│   │   ├── (auth)/             # Grupo público
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/        # Grupo protegido por middleware
│   │   │   ├── layout.tsx      # Navbar + auth guard
│   │   │   ├── rooms/page.tsx          # Listado de salas (USER)
│   │   │   ├── bookings/page.tsx       # Mis reservas
│   │   │   ├── calendar/page.tsx       # Calendario FullCalendar
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Guard rol ADMIN
│   │   │       ├── rooms/page.tsx      # CRUD salas
│   │   │       └── bookings/page.tsx   # Todas las reservas
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/register/route.ts
│   │       ├── rooms/route.ts          # GET (list), POST (admin)
│   │       ├── rooms/[id]/route.ts     # GET, PATCH, DELETE
│   │       ├── bookings/route.ts       # GET (filtros), POST
│   │       └── bookings/[id]/route.ts  # GET, PATCH, DELETE
│   ├── components/
│   │   ├── providers.tsx               # SessionProvider
│   │   ├── layout/navbar.tsx
│   │   ├── ui/                         # button, input, label, card
│   │   ├── rooms/                      # admin-rooms-table, room-form-dialog
│   │   └── bookings/                   # calendar-view, booking-dialog, cancel-booking-button
│   ├── services/
│   │   ├── rooms.service.ts            # CRUD salas
│   │   └── bookings.service.ts         # CRUD + lógica de no-superposición
│   ├── lib/
│   │   ├── prisma.ts                   # Cliente Prisma singleton
│   │   ├── auth.ts                     # authOptions + helpers
│   │   ├── validators.ts               # Schemas Zod
│   │   └── utils.ts                    # cn()
│   ├── types/next-auth.d.ts            # Tipos extendidos (role en session)
│   └── middleware.ts                   # Protege /rooms, /bookings, /calendar, /admin
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── components.json                     # config shadcn
├── .env.example
└── .gitignore
```

## Separación de capas

- **UI** → `src/app/**` y `src/components/**`
- **Lógica de negocio** → `src/services/**` (CRUD + reglas como no-superposición)
- **Acceso a datos** → Prisma a través de `src/lib/prisma.ts`
- **Validación** → Zod en `src/lib/validators.ts`
- **Auth/roles** → `src/lib/auth.ts` + `src/middleware.ts`

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# editar DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Migraciones + seed
npx prisma migrate dev --name init
npm run db:seed

# 4. Levantar dev
npm run dev
```

Usuarios demo del seed:

- `admin@censys.com.ar` / `admin1234` (ADMIN)
- `user@censys.com.ar` / `user1234` (USER)

## Reglas clave

- **Restricción de dominio**: validada en Zod, en `authorize()` de NextAuth y en el callback `signIn` (defensa en profundidad).
- **Roles**: el JWT y la sesión incluyen `role`. El `middleware.ts` redirige `/admin/*` si no es ADMIN. Las API routes vuelven a chequear con `isAdmin()`.
- **No superposición**: `bookingsService.assertNoOverlap` valida `existing.start < new.end AND existing.end > new.start` para la misma sala antes de crear/editar. Devuelve **409** si choca.
- **Soft delete** de salas (campo `active`) para no romper reservas históricas.

## Próximos pasos sugeridos

- Tests con Playwright/Vitest sobre la lógica de solapamiento
- Notificaciones por email (Resend/SendGrid) al crear/cancelar
- Filtros por capacidad y recursos en `/rooms`
- Export iCal/Google Calendar
