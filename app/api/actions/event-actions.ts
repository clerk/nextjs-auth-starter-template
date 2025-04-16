"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fetch all events
export async function getEventsAction(filter?: { status?: string }) {
  try {
    console.log('Server action: Fetching events with filter:', filter);
    
    const events = await prisma.event.findMany({
      where: filter,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    console.log('Server action: Found events:', events.length);
    
    // Transform the events to a simpler format for the dropdown
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.title,
      clientName: event.client?.name || 'No client',
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      location: event.location || 'No location',
    }));
    
    return { success: true, data: formattedEvents };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

// Create event vehicle assignment
export async function createEventVehicleAssignmentAction(data: {
  eventId: string;
  vehicleId: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) {
  try {
    // Check if the assignment already exists
    const existingAssignment = await prisma.eventVehicle.findFirst({
      where: {
        eventId: data.eventId,
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
    const assignment = await prisma.eventVehicle.create({
      data: {
        eventId: data.eventId,
        vehicleId: data.vehicleId,
        assignedAt: new Date(),
        status: "ASSIGNED",
        notes: data.notes,
      },
    });

    // Update the vehicle status to IN_USE
    await prisma.vehicle.update({
      where: {
        id: data.vehicleId,
      },
      data: {
        status: "IN_USE",
      },
    });

    revalidatePath("/cars");
    revalidatePath(`/cars/${data.vehicleId}`);
    revalidatePath(`/events/${data.eventId}`);
    
    return { success: true, data: assignment };
  } catch (error) {
    console.error("Error creating event vehicle assignment:", error);
    return { success: false, error: "Failed to assign vehicle to event" };
  }
}
