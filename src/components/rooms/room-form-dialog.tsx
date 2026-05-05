"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  resources: string[];
};

type Props =
  | { mode: "create"; room?: undefined }
  | { mode: "edit"; room: Room };

export function RoomFormDialog(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: props.mode === "edit" ? props.room.name : "",
    capacity: props.mode === "edit" ? props.room.capacity : 4,
    location: props.mode === "edit" ? props.room.location : "",
    resources: props.mode === "edit" ? props.room.resources.join(", ") : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name: form.name,
      capacity: Number(form.capacity),
      location: form.location,
      resources: form.resources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const url = props.mode === "edit" ? `/api/rooms/${props.room.id}` : "/api/rooms";
    const method = props.mode === "edit" ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo guardar la sala");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        variant={props.mode === "edit" ? "outline" : "default"}
        size={props.mode === "edit" ? "sm" : "default"}
        onClick={() => setOpen(true)}
      >
        {props.mode === "edit" ? "Editar" : "Nueva sala"}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {props.mode === "edit" ? "Editar sala" : "Nueva sala"}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resources">Recursos (separados por coma)</Label>
                <Input
                  id="resources"
                  value={form.resources}
                  onChange={(e) => setForm({ ...form, resources: e.target.value })}
                  placeholder="proyector, tv, videoconferencia"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
