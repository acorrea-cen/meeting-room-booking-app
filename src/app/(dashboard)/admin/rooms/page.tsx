import { roomsService } from "@/services/rooms.service";
import { AdminRoomsTable } from "@/components/rooms/admin-rooms-table";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  const rooms = await roomsService.list({ activeOnly: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salas</h1>
        <RoomFormDialog mode="create" />
      </div>
      <AdminRoomsTable rooms={rooms} />
    </div>
  );
}
