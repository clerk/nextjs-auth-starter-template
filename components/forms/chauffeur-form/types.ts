import { z } from "zod";
import { ChauffeurStatus } from "@prisma/client";

// Define chauffeur categories
export enum ChauffeurCategory {
  HIGH_END = "HIGH_END",
  BUSINESS = "BUSINESS",
  ECONOMY = "ECONOMY",
  AVERAGE = "AVERAGE",
}

// Schema for chauffeur form validation
export const chauffeurFormSchema = z.object({
  userId: z.string().min(1, "User is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.date({
    required_error: "License expiry date is required",
  }),
  vtcCardNumber: z.string().min(1, "VTC card number is required"),
  vtcValidationDate: z.date({
    required_error: "VTC validation date is required",
  }),
  vehicleId: z.string().optional().nullable(),
  status: z.nativeEnum(ChauffeurStatus).default(ChauffeurStatus.AVAILABLE),
  category: z.nativeEnum(ChauffeurCategory).default(ChauffeurCategory.AVERAGE),
  notes: z.string().optional().nullable(),
});

// Type for chauffeur form values
export type ChauffeurFormValues = z.infer<typeof chauffeurFormSchema>;

// Type for chauffeur data
export type Chauffeur = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  licenseNumber: string;
  licenseExpiry: Date;
  vtcCardNumber: string;
  vtcValidationDate: Date;
  status: ChauffeurStatus;
  category: ChauffeurCategory;
  notes?: string | null;
  vehicle?: {
    id: string;
    name: string;
    licensePlate: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

// Type for user data (for selecting a user to assign as chauffeur)
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

// Type for vehicle data (for selecting a vehicle to assign to chauffeur)
export type Vehicle = {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
};
