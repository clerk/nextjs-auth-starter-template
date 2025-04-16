// src/lib/rideFormTypes.ts

import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
    RIDE_STATUSES,
    MISSION_RIDE_CATEGORIES,
    MILESTONE_TYPES,
    RIDE_CATEGORIES,
    DEFAULT_DURATION,
    DEFAULT_PASSENGER_COUNT
} from "../constants";

// --- Zod Schemas ---
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

export const passengerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().optional(),
    passengerCount: z.number().min(1, "At least 1 passenger is required").default(DEFAULT_PASSENGER_COUNT),
    description: z.string().optional(),
});

export const rideFormSchema = z.object({
    passengerId: z.string().optional(),
    passengerInfo: passengerSchema.optional(),
    useExistingPassenger: z.boolean().default(true),
    pickupAddress: z.string().min(1, "Pickup address is required"),
    dropoffAddress: z.string().min(1, "Dropoff address is required"),
    pickupTime: z.date({ required_error: "Pickup time is required" }),
    category: z.enum(RIDE_CATEGORIES),
    status: z.enum(RIDE_STATUSES),
    notes: z.string().optional(),
    fare: z.number().optional(),
    milestones: z.array(milestoneSchema).optional().default([]),
    isMission: z.boolean().optional().default(false),
    mission: missionSchema.optional(),
})
.refine(data => data.useExistingPassenger ? !!data.passengerId : !!data.passengerInfo, {
    message: "Please select an existing passenger or provide new passenger details.",
    path: ["passengerId"],
})
.refine(data => !data.useExistingPassenger ? !!data.passengerInfo?.firstName && !!data.passengerInfo?.lastName : true, {
    message: "First and last name are required for new passengers.",
    path: ["passengerInfo.firstName"],
});

// --- TypeScript Types ---
export type MilestoneFormValues = z.infer<typeof milestoneSchema>;
export type SimpleRideFormValues = z.infer<typeof simpleRideSchema>;
export type MissionFormValues = z.infer<typeof missionSchema>;
export type PassengerFormValues = z.infer<typeof passengerSchema>;
export type RideFormValues = z.infer<typeof rideFormSchema>;

// --- Prop Types ---
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
}
