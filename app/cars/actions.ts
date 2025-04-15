"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fetch all vehicles
export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: vehicles };
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return { success: false, error: "Failed to fetch vehicles" };
  }
}

// Fetch a single vehicle by ID
export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return { success: false, error: "Failed to fetch vehicle" };
  }
}

// Create a new vehicle
export async function createVehicle(data: any) {
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        color: data.color || "",
        capacity: data.capacity,
        vehicleType: data.vehicleType,
        status: data.status,
        isFrenchPlate: data.isFrenchPlate,
      },
    });

    revalidatePath("/cars");
    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: "Failed to create vehicle" };
  }
}

// Update an existing vehicle
export async function updateVehicle(id: string, data: any) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        color: data.color || "",
        capacity: data.capacity,
        vehicleType: data.vehicleType,
        status: data.status,
        isFrenchPlate: data.isFrenchPlate,
      },
    });

    revalidatePath("/cars");
    revalidatePath(`/cars/${id}`);
    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return { success: false, error: "Failed to update vehicle" };
  }
}

// Delete a vehicle
export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({
      where: {
        id,
      },
    });

    revalidatePath("/cars");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: "Failed to delete vehicle" };
  }
}

// Assign a vehicle to an entity following the hierarchical order:
// Premier Event > Event > Mission > Ride > Chauffeur
export async function assignVehicle(data: {
  vehicleId: string;
  // The assignment type follows the hierarchical order (from highest to lowest):
  // PREMIER_EVENT > EVENT > MISSION > RIDE > CHAUFFEUR
  assignmentType: string;
  entityId: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) {
  try {
    // Update the vehicle status to IN_USE
    const vehicle = await prisma.vehicle.update({
      where: {
        id: data.vehicleId,
      },
      data: {
        status: "IN_USE",
      },
    });

    // Create the appropriate assignment record based on the assignment type
    if (data.assignmentType === "PREMIER_EVENT") {
      // Highest level assignment - Premier Event
      // This is a placeholder for future implementation
      console.log("Premier Event assignment not implemented yet");

    } else if (data.assignmentType === "EVENT") {
      // Second level assignment - Event
      // Check if the assignment already exists
      const existingAssignment = await prisma.eventVehicle.findFirst({
        where: {
          eventId: data.entityId,
          vehicleId: data.vehicleId,
        },
      });

      if (existingAssignment) {
        return {
          success: false,
          error: "This vehicle is already assigned to this event"
        };
      }

      // Create the assignment
      await prisma.eventVehicle.create({
        data: {
          eventId: data.entityId,
          vehicleId: data.vehicleId,
          assignedAt: new Date(),
          status: "ASSIGNED",
          notes: data.notes,
        },
      });

    } else if (data.assignmentType === "MISSION") {
      // Third level assignment - Mission
      console.log("Mission assignment not implemented yet");

    } else if (data.assignmentType === "RIDE") {
      // Fourth level assignment - Ride
      console.log("Ride assignment not implemented yet");

    } else if (data.assignmentType === "CHAUFFEUR") {
      // Fifth level assignment - Chauffeur
      console.log("Chauffeur assignment not implemented yet");
    }

    revalidatePath("/cars");
    revalidatePath(`/cars/${data.vehicleId}`);

    // If the assignment is for an event, also revalidate the event page
    if (data.assignmentType === "EVENT") {
      revalidatePath(`/events/${data.entityId}`);
    }

    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Error assigning vehicle:", error);
    return { success: false, error: "Failed to assign vehicle" };
  }
}
