import { roomsService } from "@/services/rooms.service";
import { CalendarView } from "@/components/bookings/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string }>;
}) {
  const { roomId } = await searchParams;
  const rooms = await roomsService.list({ activeOnly: true });
  const initialRoomId = roomId ?? rooms[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-muted-foreground">
          Vista semanal/diaria de las reservas. Hacé click y arrastrá para reservar.
        </p>
      </header>

      <CalendarView rooms={rooms} initialRoomId={initialRoomId} />
    </div>
  );
}
