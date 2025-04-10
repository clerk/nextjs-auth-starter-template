import * as z from "zod";

export const clientFormSchema = z.object({
  // Organization information
  name: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  contractStart: z.string().optional().or(z.literal("")),
  contractEnd: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),

  // Primary contact information
  contactFirstName: z.string().min(1, "Contact first name is required"),
  contactLastName: z.string().min(1, "Contact last name is required"),
  contactEmail: z.string().email("Invalid contact email address"),
  contactPhone: z.string().optional().or(z.literal("")),
  sendInvitation: z.boolean().default(true),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
