"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";

type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  resources: string[];
  active: boolean;
};

export function AdminRoomsTable({ rooms }: { rooms: Room[] }) {
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm("¿Desactivar la sala?")) return;
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Capacidad</th>
            <th className="p-3">Recursos</th>
            <th className="p-3">Estado</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3 font-medium">{r.name}</td>
              <td className="p-3">{r.location}</td>
              <td className="p-3">{r.capacity}</td>
              <td className="p-3">{r.resources.join(", ") || "—"}</td>
              <td className="p-3">
                {r.active ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Activa
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    Inactiva
                  </span>
                )}
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                  <RoomFormDialog mode="edit" room={r} />
                  <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">
                Aún no hay salas. Creá la primera con el botón de arriba.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
