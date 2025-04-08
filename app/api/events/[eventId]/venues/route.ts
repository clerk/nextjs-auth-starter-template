import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/venues - Get all venues for an event
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

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Since there's no Venue model in the schema yet, we'll return a mock response
    // This should be updated once the Venue model is added to the schema
    const mockVenues = [
      {
        id: "venue1",
        name: "Grand Ballroom",
        address: "123 Main St, City",
        capacity: 500,
        status: "available",
        startTime: new Date(),
        conflicts: [],
        assigned: false,
      },
      {
        id: "venue2",
        name: "Conference Room A",
        address: "456 Business Ave, City",
        capacity: 100,
        status: "available",
        startTime: new Date(),
        conflicts: [],
        assigned: false,
      },
    ];

    return NextResponse.json(mockVenues);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/venues - Add a venue to an event
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
    const data = await req.json();

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate required fields
    if (!data.name || !data.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Since there's no Venue model in the schema yet, we'll return a mock response
    // This should be updated once the Venue model is added to the schema
    const mockVenue = {
      id: `venue-${Date.now()}`,
      name: data.name,
      address: data.address,
      capacity: data.capacity || 100,
      status: "available",
      startTime: new Date(),
      conflicts: [],
      assigned: false,
    };

    return NextResponse.json(mockVenue);
  } catch (error) {
    console.error("Error adding venue:", error);
    return NextResponse.json(
      { error: "Failed to add venue" },
      { status: 500 }
    );
  }
}
