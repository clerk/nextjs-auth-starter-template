import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { rideFormSchema } from "./schemas/ride-schema";

export type RideFormValues = z.infer<typeof rideFormSchema>;

export type User = { id: string; name: string };
export type Chauffeur = { id: string; name: string };
export type Client = { id: string; name: string };
export type Partner = { id: string; name: string };
export type Project = { id: string; name: string };
export type ExistingMission = { id: string; title: string; chauffeurId: string };

export interface RideFormProps {
  onAddRide: (data: RideFormValues) => void;
  users?: User[];
  chauffeurs?: Chauffeur[];
  clients?: Client[];
  partners?: Partner[];
  projects?: Project[];
  existingMissions?: ExistingMission[];
  defaultValues?: Partial<RideFormValues>;
  buttonText?: string;
  showMissionButton?: boolean;
}

export interface StepProps {
  form: UseFormReturn<RideFormValues>;
  users?: User[];
  clients?: Client[];
  chauffeurs?: Chauffeur[];
  partners?: Partner[];
  projects?: Project[];
  existingMissions?: ExistingMission[];
}
