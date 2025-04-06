import { z } from "zod";

// Enum for booking status
export const BookingStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// Enum for ride status
export const RideStatusEnum = z.enum([
  "SCHEDULED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// Enum for ride categories
export const RideCategoryEnum = z.enum([
  "CITY_TRANSFER",
  "AIRPORT_TRANSFER",
  "TRAIN_STATION_TRANSFER",
  "CHAUFFEUR_SERVICE", // "Mise à disposition" in French
]);

// Base schema for all ride types
const baseRideSchema = z.object({
  passengerId: z.string().min(1, "Passenger is required"),
  status: RideStatusEnum,
  fare: z.number().optional(),
  distance: z.number().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  category: RideCategoryEnum,
});

// City transfer specific fields
const cityTransferSchema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  pickupTime: z.date({
    required_error: "Pickup time is required",
  }),
  dropoffTime: z.date({
    required_error: "Dropoff time is required",
  }).optional(),
});

// Airport transfer specific fields
const airportTransferSchema = z.object({
  airportName: z.string().min(1, "Airport name is required"),
  flightNumber: z.string().min(1, "Flight number is required"),
  isArrival: z.boolean(),
  cityAddress: z.string().min(1, "City address is required"),
  flightTime: z.date({
    required_error: "Flight time is required",
  }),
  pickupTime: z.date({
    required_error: "Pickup time is required",
  }),
});

// Train station transfer specific fields
const trainStationTransferSchema = z.object({
  stationName: z.string().min(1, "Station name is required"),
  trainNumber: z.string().min(1, "Train number is required"),
  isArrival: z.boolean(),
  cityAddress: z.string().min(1, "City address is required"),
  trainTime: z.date({
    required_error: "Train time is required",
  }),
  pickupTime: z.date({
    required_error: "Pickup time is required",
  }),
});

// Chauffeur service ("Mise à disposition") specific fields
const chauffeurServiceSchema = z.object({
  startAddress: z.string().min(1, "Start address is required"),
  startTime: z.date({
    required_error: "Start time is required",
  }),
  endTime: z.date({
    required_error: "End time is required",
  }),
  hoursBooked: z.number().min(1, "Hours booked is required"),
});

// Combined ride schema with discriminated union based on category
export const rideSchema = z.discriminatedUnion("category", [
  baseRideSchema.extend({
    category: z.literal("CITY_TRANSFER"),
  }).merge(cityTransferSchema),

  baseRideSchema.extend({
    category: z.literal("AIRPORT_TRANSFER"),
  }).merge(airportTransferSchema),

  baseRideSchema.extend({
    category: z.literal("TRAIN_STATION_TRANSFER"),
  }).merge(trainStationTransferSchema),

  baseRideSchema.extend({
    category: z.literal("CHAUFFEUR_SERVICE"),
  }).merge(chauffeurServiceSchema),
]);

// Schema for creating a new booking
export const bookingSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  organizationId: z.string().optional(),
  status: BookingStatusEnum,
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
  rides: z.array(rideSchema).optional(),
});

// Types derived from schemas
export type BookingFormValues = z.infer<typeof bookingSchema>;
export type RideFormValues = z.infer<typeof rideSchema>;
