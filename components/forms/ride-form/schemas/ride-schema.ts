import { z } from "zod";
import { RIDE_STATUSES, RIDE_CATEGORIES } from "../constants";
import { passengerSchema } from "./passenger-schema";
import { missionSchema } from "./mission-schema";
import { milestoneSchema } from "./simple-ride-schema";

export const rideFormSchema = z.object({
  passengerId: z.string().optional(),
  passengerInfo: passengerSchema.optional(),
  useExistingPassenger: z.boolean().default(true),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  category: z.enum(RIDE_CATEGORIES),
  status: z.enum(RIDE_STATUSES),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
  isMission: z.boolean().optional().default(false),
  mission: missionSchema.optional(),
})
.refine(data => data.useExistingPassenger ? !!data.passengerId : !!data.passengerInfo, {
  message: "Please select an existing passenger or provide new passenger details.",
  path: ["passengerId"],
})
.refine(data => !data.useExistingPassenger ? !!data.passengerInfo?.firstName && !!data.passengerInfo?.lastName : true, {
  message: "First and last name are required for new passengers.",
  path: ["passengerInfo.firstName"],
});

export type RideFormValues = z.infer<typeof rideFormSchema>;