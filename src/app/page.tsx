import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/calendar");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Reserva de salas — Censys
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Gestioná las reuniones de tu equipo: reservá una sala, evitá choques de
        horario y consultá disponibilidad en una vista tipo calendario.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Ingresar
        </Link>
        <Link
          href="/register"
          className="rounded-md border px-4 py-2 hover:bg-accent"
        >
          Registrarse
        </Link>
      </div>
    </main>
  );
}
