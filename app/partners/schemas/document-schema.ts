import * as z from "zod";

export const documentFormSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.enum([
    // Chauffeur documents
    "DRIVER_LICENSE",
    "IDENTITY_CARD",
    "VTC_CARD",
    
    // Vehicle documents
    "REGISTRATION_CARD",
    "INSURANCE_CERTIFICATE",
    "TECHNICAL_INSPECTION",
    "VTC_REGISTRY",
    "EXPLOITATION_CERTIFICATE",
  ]),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  isVerified: z.boolean().default(false),
  
  // These will be handled by the API
  url: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  
  // Relations
  chauffeurId: z.string().optional(),
  vehicleId: z.string().optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
