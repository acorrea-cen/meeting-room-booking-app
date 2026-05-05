"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/calendar" className="font-semibold">
            Censys · Salas
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/calendar" className="text-muted-foreground hover:text-foreground">
              Calendario
            </Link>
            <Link href="/rooms" className="text-muted-foreground hover:text-foreground">
              Salas
            </Link>
            <Link href="/bookings" className="text-muted-foreground hover:text-foreground">
              Mis reservas
            </Link>
            {isAdmin && (
              <Link href="/admin/rooms" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
