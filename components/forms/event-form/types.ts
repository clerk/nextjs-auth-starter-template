import { z } from "zod";
import { eventFormSchema } from "./schemas/event-schema";
import { EVENT_TYPES, EVENT_STATUSES, EVENT_PRICING_TYPES } from "./constants/event-constants";

export type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventType = (typeof EVENT_TYPES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type EventPricingType = (typeof EVENT_PRICING_TYPES)[number];

export interface Event {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  location: string;
  pricingType: EventPricingType;
  fixedPrice?: number;
  totalFare?: number;
  notes?: string;
  missions?: Mission[];
  participants?: EventParticipant[];
  eventVehicles?: EventVehicle[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  eventId: string;
  startDate: Date;
  endDate: Date;
  status: MissionStatus;
  location?: string;
  fare?: number;
  notes?: string;
  rides?: Ride[];
  createdAt: Date;
  updatedAt: Date;
}

export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  rideNumber: string;
  bookingId: string;
  passengerId: string;
  passenger?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  chauffeurId?: string;
  chauffeur?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date;
  dropoffTime?: Date;
  status: string;
  fare?: number;
  distance?: number;
  duration?: number;
  notes?: string;
  missionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  role: ParticipantRole;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ParticipantRole = 'TEAM_MEMBER' | 'CHAUFFEUR' | 'PARTNER' | 'CLIENT' | 'PASSENGER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface EventVehicle {
  id: string;
  eventId: string;
  vehicleId: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    capacity: number;
    vehicleType: string;
  };
  assignedAt: Date;
  status: VehicleAssignmentStatus;
  notes?: string;
}

export type VehicleAssignmentStatus = 'ASSIGNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';