import Link from "next/link";
import { roomsService } from "@/services/rooms.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await roomsService.list({ activeOnly: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Salas disponibles</h1>
        <p className="text-muted-foreground">Elegí una sala para reservarla.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.name}</CardTitle>
              <CardDescription>
                {r.location} · capacidad {r.capacity}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {r.resources.map((res) => (
                  <span
                    key={res}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                  >
                    {res}
                  </span>
                ))}
              </div>
              <Button asChild className="w-full">
                <Link href={`/calendar?roomId=${r.id}`}>Ver disponibilidad</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
