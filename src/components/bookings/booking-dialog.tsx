"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  room: { id: string; name: string };
  start: Date;
  end: Date;
  onClose: (refresh?: boolean) => void;
};

export function BookingDialog({ room, start, end, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        notes: notes || undefined,
        roomId: room.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "No se pudo reservar");
      return;
    }
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Nueva reserva</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {room.name} · {start.toLocaleString("es-AR")} → {end.toLocaleString("es-AR")}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              required
              minLength={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily de equipo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Reservando..." : "Reservar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
