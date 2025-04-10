import * as z from "zod";

export const chauffeurFormSchema = z.object({
  // Basic information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  
  // License information
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry date is required"),
  
  // NextIS information
  isExternalChauffeur: z.boolean().default(false),
  nextIsChauffeurId: z.string().optional(),
  
  // Additional information
  notes: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.enum(["AVAILABLE", "BUSY", "ON_LEAVE", "INACTIVE"]).default("AVAILABLE"),
});

export type ChauffeurFormValues = z.infer<typeof chauffeurFormSchema>;
