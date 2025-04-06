import { z } from "zod";
import { RIDE_STATUSES, MISSION_RIDE_CATEGORIES, MILESTONE_TYPES } from "../constants";

export const milestoneSchema = z.object({
  address: z.string().min(1, "Address is required"),
  time: z.date().optional(),
  type: z.enum(MILESTONE_TYPES),
  notes: z.string().optional(),
});

export const simpleRideSchema = z.object({
  id: z.string().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({ required_error: "Pickup time is required" }),
  category: z.enum(MISSION_RIDE_CATEGORIES),
  status: z.enum(RIDE_STATUSES).optional().default("SCHEDULED"),
  notes: z.string().optional(),
  fare: z.number().optional(),
  milestones: z.array(milestoneSchema).optional().default([]),
});

export type SimpleRideFormValues = z.infer<typeof simpleRideSchema>;
