import * as z from "zod";

export const vehicleFormSchema = z.object({
  // Additional fields from the API
  fuelType: z.string().optional(),
  registrationDate: z.string().optional(),
  make: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required").refine(
    (val) => {
      const year = parseInt(val);
      return !isNaN(year) && year > 1900 && year <= new Date().getFullYear() + 1;
    },
    { message: "Please enter a valid year" }
  ),
  licensePlate: z.string().min(1, "License plate is required"),
  isForeignPlate: z.boolean().default(false),
  color: z.string().optional(),
  capacity: z.string().min(1, "Capacity is required").refine(
    (val) => {
      const capacity = parseInt(val);
      return !isNaN(capacity) && capacity > 0;
    },
    { message: "Please enter a valid capacity" }
  ),
  vehicleType: z.enum(["SEDAN", "SUV", "VAN", "LUXURY", "LIMOUSINE"]).default("SEDAN"),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"),

});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
