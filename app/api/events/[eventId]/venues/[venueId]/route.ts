import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/venues/[venueId] - Get a specific venue assignment
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; venueId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, venueId } = params;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Since there's no Venue model in the schema yet, we'll return a mock response
    // This should be updated once the Venue model is added to the schema
    const mockVenue = {
      id: venueId,
      name: "Grand Ballroom",
      address: "123 Main St, City",
      capacity: 500,
      status: "available",
      startTime: new Date(),
      conflicts: [],
      assigned: false,
    };

    return NextResponse.json(mockVenue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId]/venues/[venueId] - Update a specific venue assignment
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string; venueId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, venueId } = params;
    const data = await req.json();

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Since there's no Venue model in the schema yet, we'll return a mock response
    // This should be updated once the Venue model is added to the schema
    const updatedVenue = {
      id: venueId,
      name: data.name || "Grand Ballroom",
      address: data.address || "123 Main St, City",
      capacity: data.capacity || 500,
      status: data.status || "available",
      startTime: new Date(),
      conflicts: [],
      assigned: data.assigned || false,
    };

    return NextResponse.json(updatedVenue);
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/venues/[venueId] - Remove a venue from an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; venueId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, venueId } = params;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Since there's no Venue model in the schema yet, we'll just return a success message
    // This should be updated once the Venue model is added to the schema
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing venue:", error);
    return NextResponse.json(
      { error: "Failed to remove venue" },
      { status: 500 }
    );
  }
}
