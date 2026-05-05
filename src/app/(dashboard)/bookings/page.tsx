import { auth } from "@/lib/auth";
import { bookingsService } from "@/services/bookings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  const bookings = await bookingsService.list({ userId: session!.user.id });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mis reservas</h1>
        <p className="text-muted-foreground">Tus próximas y pasadas reuniones.</p>
      </header>

      {bookings.length === 0 && (
        <p className="text-muted-foreground">Aún no tenés reservas.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{b.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {b.room.name} · {b.room.location}
                </p>
              </div>
              <CancelBookingButton id={b.id} />
            </CardHeader>
            <CardContent className="text-sm">
              {new Date(b.startTime).toLocaleString("es-AR")} —{" "}
              {new Date(b.endTime).toLocaleString("es-AR")}
              {b.notes && <p className="mt-2 text-muted-foreground">{b.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
