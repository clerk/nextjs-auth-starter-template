import { z } from "zod";
import { RIDE_STATUSES, DEFAULT_DURATION } from "../constants";
import { simpleRideSchema } from "./simple-ride-schema";

export const missionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Mission title is required"),
  clientId: z.string().min(1, "Client is required"),
  chauffeurId: z.string().optional(),
  partnerId: z.string().optional(),
  isExternalPartner: z.boolean().optional().default(false),
  projectId: z.string().optional(),
  passengerIds: z.array(z.string()).optional().default([]),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  duration: z.number().optional().default(DEFAULT_DURATION),
  status: z.enum(RIDE_STATUSES).optional().default("SCHEDULED"),
  notes: z.string().optional(),
  totalBudget: z.number().optional(),
  partnerFee: z.number().optional(),
  rides: z.array(simpleRideSchema).optional().default([]),
});

export type MissionFormValues = z.infer<typeof missionSchema>;