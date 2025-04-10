import * as z from "zod";

export const partnerFormSchema = z.object({
  isExistingPartner: z.boolean().default(false),
  partnerId: z.string().optional(),
  name: z.string().min(1, "Partner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  type: z.enum(["INTERNAL", "EXTERNAL", "AFFILIATE"]).default("EXTERNAL"),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).default("ACTIVE"),
  notes: z.string().optional(),

  // Financial information
  balance: z.string().optional(),
  ratePerKm: z.string().optional(),
  ratePerHour: z.string().optional(),
  minimumFare: z.string().optional(),
  commissionRate: z.string().optional(),
  paymentTerms: z.string().optional(),

  // Banking information
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  taxId: z.string().optional(),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;
