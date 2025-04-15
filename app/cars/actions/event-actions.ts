// This file contains client-side functions that call server actions

import { getEventsAction, createEventVehicleAssignmentAction } from "@/app/api/actions/event-actions";

// Fetch all events
export async function getEvents(filter?: { status?: string }) {
  try {
    console.log('Client: Fetching events with filter:', filter);

    // Call the server action
    const result = await getEventsAction(filter);
    console.log('Client: Received events result:', result);

    return result;
  } catch (error) {
    console.error("Client: Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

// Create event vehicle assignment
export async function createEventVehicleAssignment(data: {
  eventId: string;
  vehicleId: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) {
  try {
    console.log('Client: Creating event vehicle assignment:', data);

    // Call the server action
    const result = await createEventVehicleAssignmentAction(data);
    console.log('Client: Event vehicle assignment result:', result);

    return result;
  } catch (error) {
    console.error("Client: Error creating event vehicle assignment:", error);
    return { success: false, error: "Failed to assign vehicle to event" };
  }
}
