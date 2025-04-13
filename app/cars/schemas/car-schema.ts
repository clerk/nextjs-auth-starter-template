import * as z from "zod";

export const carSchema = z.object({
  make: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Year must be at least 1900").max(new Date().getFullYear() + 1, `Year must be at most ${new Date().getFullYear() + 1}`),
  licensePlate: z.string().min(1, "License plate is required"),
  color: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").default(4),
  vehicleType: z.enum(["SEDAN", "SUV", "VAN", "LUXURY", "LIMOUSINE"]).default("SEDAN"),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"),
  lastMaintenance: z.date().optional().nullable(),
  isFrenchPlate: z.boolean().default(true),
});

export type CarFormValues = z.infer<typeof carSchema>;
