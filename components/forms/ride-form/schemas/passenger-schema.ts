import { z } from "zod";
import { DEFAULT_PASSENGER_COUNT } from "../../ride-form/constants";

export const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  passengerCount: z.number().min(1, "At least 1 passenger is required").default(DEFAULT_PASSENGER_COUNT),
  description: z.string().optional(),
});

export type PassengerFormValues = z.infer<typeof passengerSchema>;
