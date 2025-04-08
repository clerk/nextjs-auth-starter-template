import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../lib/db";

// GET /api/events/[eventId] - Get a specific event
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.eventId;

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        client: true,
        missions: {
          include: {
            rides: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        eventVehicles: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId] - Update a specific event
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.eventId;
    const data = await req.json();

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update the event
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        location: data.location,
        pricingType: data.pricingType,
        fixedPrice: data.fixedPrice ? parseFloat(data.fixedPrice) : null,
        notes: data.notes,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId] - Delete a specific event
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


