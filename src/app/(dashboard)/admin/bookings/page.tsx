import { bookingsService } from "@/services/bookings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await bookingsService.list({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Todas las reservas</h1>
      {bookings.length === 0 && (
        <p className="text-muted-foreground">Aún no hay reservas.</p>
      )}
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle>{b.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {b.room.name} · {b.room.location} · por {b.user.name ?? b.user.email}
              </p>
            </CardHeader>
            <CardContent className="text-sm">
              {new Date(b.startTime).toLocaleString("es-AR")} —{" "}
              {new Date(b.endTime).toLocaleString("es-AR")}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
