"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onCancel() {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button variant="destructive" size="sm" onClick={onCancel} disabled={loading}>
      {loading ? "Cancelando..." : "Cancelar"}
    </Button>
  );
}
