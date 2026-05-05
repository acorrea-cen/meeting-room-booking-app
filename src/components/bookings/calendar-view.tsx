"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DateSelectArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/bookings/booking-dialog";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Room = {
  id: string;
  name: string;
  location: string;
  capacity: number;
};

type Props = {
  rooms: Room[];
  initialRoomId: string;
};

export function CalendarView({ rooms, initialRoomId }: Props) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    start?: Date;
    end?: Date;
  }>({ open: false });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const room = useMemo(() => rooms.find((r) => r.id === roomId), [rooms, roomId]);

  async function loadEvents() {
    if (!roomId) return;
    const res = await fetch(`/api/bookings?roomId=${roomId}`);
    if (!res.ok) return;
    const data = await res.json();
    setEvents(
      data.map((b: { id: string; title: string; startTime: string; endTime: string; user: { name?: string; email: string } }) => ({
        id: b.id,
        title: `${b.title} — ${b.user.name ?? b.user.email}`,
        start: b.startTime,
        end: b.endTime,
      }))
    );
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Suscripción Realtime: cualquier insert/update/delete sobre Booking
  // dispara un refetch para que todos los usuarios vean el cambio en vivo.
  useEffect(() => {
    if (!roomId) return;
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(`bookings-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Booking",
          filter: `roomId=eq.${roomId}`,
        },
        () => loadEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function handleSelect(arg: DateSelectArg) {
    setDialog({ open: true, start: arg.start, end: arg.end });
  }

  function handleDateClick(arg: DateClickArg) {
    const start = arg.date;
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    setDialog({ open: true, start, end });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">Sala:</label>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · {r.location} (cap. {r.capacity})
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={loadEvents}>
          Refrescar
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={isMobile ? {
            left: "prev,next",
            center: "title",
            right: "today",
          } : {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="es"
          firstDay={1}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          selectable
          selectMirror
          longPressDelay={300}
          nowIndicator
          height="auto"
          events={events}
          select={handleSelect}
          dateClick={handleDateClick}
        />
      </div>

      {dialog.open && room && dialog.start && dialog.end && (
        <BookingDialog
          room={room}
          start={dialog.start}
          end={dialog.end}
          onClose={(refresh) => {
            setDialog({ open: false });
            if (refresh) loadEvents();
          }}
        />
      )}
    </div>
  );
}
