import * as z from "zod";
import { EVENT_TYPES, EVENT_STATUSES, EVENT_PRICING_TYPES } from "../constants/event-constants";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  location: z.string().min(1, "Location is required"),
  status: z.enum(EVENT_STATUSES),
  pricingType: z.enum(EVENT_PRICING_TYPES),
  fixedPrice: z.number()
    .refine(val => val > 0, {
      message: "Fixed price must be greater than zero",
      path: ["fixedPrice"],
    })
    .optional()
    .or(z.literal(0)),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // If pricing type is FIXED_PRICE, fixedPrice must be greater than 0
    if (data.pricingType === "FIXED_PRICE" && (!data.fixedPrice || data.fixedPrice <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Fixed price is required and must be greater than zero when pricing type is Fixed Price",
    path: ["fixedPrice"],
  }
);
