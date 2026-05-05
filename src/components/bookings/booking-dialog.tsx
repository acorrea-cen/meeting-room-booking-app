"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  room: { id: string; name: string };
  start?: Date;
  end?: Date;
  onClose: (refresh?: boolean) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeStr(d: Date) {
  const minutes = d.getMinutes() < 30 ? "00" : "30";
  return `${pad(d.getHours())}:${minutes}`;
}

function roundToHalfHour(d: Date) {
  const ms = 30 * 60 * 1000;
  return new Date(Math.round(d.getTime() / ms) * ms);
}

const TIME_SLOTS = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const min = i % 2 === 0 ? "00" : "30";
  return `${pad(hour)}:${min}`;
});

function DateTimeField({
  id, label, dateValue, timeValue,
  onDateChange, onTimeChange,
}: {
  id: string; label: string;
  dateValue: string; timeValue: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="date"
          required
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex-1"
        />
        <select
          required
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function BookingDialog({ room, start, end, onClose }: Props) {
  const now = new Date();
  const defaultStart = start ? roundToHalfHour(start) : roundToHalfHour(new Date(now.getTime() + 30 * 60 * 1000));
  const defaultEnd = end ? roundToHalfHour(end) : new Date(defaultStart.getTime() + 30 * 60 * 1000);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(toDateStr(defaultStart));
  const [startTime, setStartTime] = useState(toTimeStr(defaultStart));
  const [endDate, setEndDate] = useState(toDateStr(defaultEnd));
  const [endTime, setEndTime] = useState(toTimeStr(defaultEnd));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const startMs = new Date(`${startDate}T${startTime}`).getTime();
    const endMs = new Date(`${endDate}T${endTime}`).getTime();

    if (endMs - startMs < 30 * 60 * 1000) {
      setError("La duración mínima de una reserva es 30 minutos");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        notes: notes || undefined,
        roomId: room.id,
        startTime: new Date(`${startDate}T${startTime}`).toISOString(),
        endTime: new Date(`${endDate}T${endTime}`).toISOString(),
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
        <p className="mb-4 text-sm text-muted-foreground">{room.name}</p>
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
          <DateTimeField
            id="start"
            label="Inicio"
            dateValue={startDate}
            timeValue={startTime}
            onDateChange={setStartDate}
            onTimeChange={setStartTime}
          />
          <DateTimeField
            id="end"
            label="Fin"
            dateValue={endDate}
            timeValue={endTime}
            onDateChange={setEndDate}
            onTimeChange={setEndTime}
          />
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
