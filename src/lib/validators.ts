import { z } from "zod";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "censys.com.ar";

export const emailSchema = z
  .string()
  .email("Email inválido")
  .refine((e) => e.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`), {
    message: `Solo se permiten emails @${ALLOWED_DOMAIN}`,
  });

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: emailSchema,
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const roomSchema = z.object({
  name: z.string().min(2),
  capacity: z.number().int().positive(),
  location: z.string().min(2),
  resources: z.array(z.string()).default([]),
  active: z.boolean().optional(),
});

const bookingBaseSchema = z.object({
  title: z.string().min(2),
  notes: z.string().optional().nullable(),
  roomId: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export const bookingSchema = bookingBaseSchema.refine(
  (d) => d.endTime > d.startTime,
  { message: "endTime debe ser posterior a startTime", path: ["endTime"] }
);

export const bookingUpdateSchema = bookingBaseSchema.partial().refine(
  (d) => !d.startTime || !d.endTime || d.endTime > d.startTime,
  { message: "endTime debe ser posterior a startTime", path: ["endTime"] }
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
