import { z } from "zod";

export const ChildSchema = z.enum(["Mariana", "Miguel"]);
export type Child = z.infer<typeof ChildSchema>;

export const MoodSchema = z.enum(["Feliz", "Triste", "Calmo", "Agitado", "Irritado"]);
export type Mood = z.infer<typeof MoodSchema>;

export const WellBeingSchema = z.enum(["Bom", "Regular", "Ruim"]);
export type WellBeing = z.infer<typeof WellBeingSchema>;

export const ChildStatusSchema = z.object({
  mood: MoodSchema.optional().nullable(),
  wellBeing: WellBeingSchema.optional().nullable(),
});
export type ChildStatus = z.infer<typeof ChildStatusSchema>;

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().optional().nullable(),
});
export type Location = z.infer<typeof LocationSchema>;

export const ObservationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  children: z.array(z.string()),
  childStatuses: z.record(z.string(), ChildStatusSchema).optional().nullable(),
  activity: z.string().min(1, "A atividade é obrigatória"),
  notes: z.string().optional().nullable(),
  location: LocationSchema.optional().nullable(),
  photoBase64: z.string().optional().nullable(), 
  timestamp: z.number(),
  isReport: z.boolean().optional().nullable(),
});

export type Observation = z.infer<typeof ObservationSchema>;
