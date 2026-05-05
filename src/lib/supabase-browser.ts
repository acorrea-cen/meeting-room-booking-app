"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase para el browser, usado SOLO para Realtime
 * (suscripción a cambios en la tabla Booking).
 *
 * El acceso a datos sigue pasando por nuestra API + Prisma.
 * Acá usamos la anon key porque es un proyecto interno y todos
 * los usuarios autenticados ya pueden ver todas las reservas.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env"
    );
  }

  client = createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return client;
}
