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
