import * as z from "zod"

export const premierSeasonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum(["GLOBAL_SPORTS", "CULTURAL_EVENTS", "BUSINESS_EVENTS"]),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  endDate: z.date(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceTier: z.enum(["PREMIUM", "EXCLUSIVE", "ULTRA"]),
  location: z.string().min(3, "Location must be at least 3 characters"),
  expectedAttendance: z.number().min(1, "Expected attendance must be greater than 0"),
  serviceTierMultiplier: z.number().min(1).default(1.5),
  exclusiveService: z.boolean().default(true),
  minimumEngagement: z.number().optional(),
  fleetReserveRatio: z.number().min(0).max(1).default(0.2),
  servicePriority: z.number().min(1).max(10).default(1)
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
})