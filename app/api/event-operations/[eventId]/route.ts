import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// DELETE /api/event-operations/[eventId] - Delete an event and all related data
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.eventId;

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete related records first
    await db.eventParticipant.deleteMany({
      where: { eventId },
    });

    await db.eventVehicle.deleteMany({
      where: { eventId },
    });

    // Delete missions and their rides
    const missions = await db.mission.findMany({
      where: { eventId },
      select: { id: true },
    });

    for (const mission of missions) {
      await db.ride.updateMany({
        where: { missionId: mission.id },
        data: { missionId: null },
      });
    }

    await db.mission.deleteMany({
      where: { eventId },
    });

    // Delete the event
    await db.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

// POST /api/event-operations/[eventId] - Handle various event operations
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.eventId;
    const { operation } = await req.json();

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      include: {
        missions: true,
        participants: true,
        eventVehicles: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Handle different operations
    switch (operation) {
      case "clone":
        return await handleCloneEvent(existingEvent);
      case "cancel":
        return await handleCancelEvent(eventId);
      case "complete":
        return await handleCompleteEvent(eventId);
      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing event operation:", error);
    return NextResponse.json(
      { error: "Failed to process event operation" },
      { status: 500 }
    );
  }
}

// Helper function to clone an event
async function handleCloneEvent(existingEvent: any) {
  try {
    // Create a new event with the same data but a different title
    const newEvent = await db.event.create({
      data: {
        title: `${existingEvent.title} (Clone)`,
        description: existingEvent.description,
        clientId: existingEvent.clientId,
        startDate: existingEvent.startDate,
        endDate: existingEvent.endDate,
        status: "PLANNED", // Always set status to PLANNED for cloned events
        location: existingEvent.location,
        pricingType: existingEvent.pricingType,
        fixedPrice: existingEvent.fixedPrice,
        notes: existingEvent.notes,
      },
    });

    // Clone missions
    for (const mission of existingEvent.missions) {
      await db.mission.create({
        data: {
          title: mission.title,
          description: mission.description,
          eventId: newEvent.id,
          startDate: mission.startDate,
          endDate: mission.endDate,
          status: "PLANNED", // Always set status to PLANNED for cloned missions
          location: mission.location,
          fare: mission.fare,
          notes: mission.notes,
        },
      });
    }

    // Clone participants
    for (const participant of existingEvent.participants) {
      await db.eventParticipant.create({
        data: {
          eventId: newEvent.id,
          userId: participant.userId,
          role: participant.role,
          status: "PENDING", // Reset status to PENDING for cloned participants
        },
      });
    }

    // Clone vehicle assignments
    for (const vehicle of existingEvent.eventVehicles) {
      await db.eventVehicle.create({
        data: {
          eventId: newEvent.id,
          vehicleId: vehicle.vehicleId,
          status: "ASSIGNED",
          notes: vehicle.notes,
        },
      });
    }

    return NextResponse.json({
      message: "Event cloned successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error cloning event:", error);
    return NextResponse.json(
      { error: "Failed to clone event" },
      { status: 500 }
    );
  }
}

// Helper function to cancel an event
async function handleCancelEvent(eventId: string) {
  try {
    // Update event status to CANCELLED
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: { status: "CANCELLED" },
    });

    // Update all missions to CANCELLED
    await db.mission.updateMany({
      where: { eventId },
      data: { status: "CANCELLED" },
    });

    // Get all mission IDs for this event
    const missions = await db.mission.findMany({
      where: { eventId },
      select: { id: true },
    });

    // Update all rides associated with these missions to CANCELLED
    for (const mission of missions) {
      await db.ride.updateMany({
        where: { missionId: mission.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({
      message: "Event cancelled successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error cancelling event:", error);
    return NextResponse.json(
      { error: "Failed to cancel event" },
      { status: 500 }
    );
  }
}

// Helper function to mark an event as complete
async function handleCompleteEvent(eventId: string) {
  try {
    // Update event status to COMPLETED
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: { status: "COMPLETED" },
    });

    // Update all missions to COMPLETED
    await db.mission.updateMany({
      where: { eventId },
      data: { status: "COMPLETED" },
    });

    // Get all mission IDs for this event
    const missions = await db.mission.findMany({
      where: { eventId },
      select: { id: true },
    });

    // Update all rides associated with these missions to COMPLETED
    for (const mission of missions) {
      await db.ride.updateMany({
        where: { missionId: mission.id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      message: "Event marked as completed",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error completing event:", error);
    return NextResponse.json(
      { error: "Failed to complete event" },
      { status: 500 }
    );
  }
}