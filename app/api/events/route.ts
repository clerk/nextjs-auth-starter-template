import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events - Get all events
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const clientId = url.searchParams.get("clientId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (startDate && endDate) {
      filter.startDate = {
        gte: new Date(startDate),
      };
      filter.endDate = {
        lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.startDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.endDate = {
        lte: new Date(endDate),
      };
    }

    // Get events with related data
    const events = await db.event.findMany({
      where: filter,
      include: {
        client: true,
        missions: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
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
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.clientId || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the event
    const event = await db.event.create({
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || "PLANNED",
        location: data.location,
        pricingType: data.pricingType || "MISSION_BASED",
        fixedPrice: data.fixedPrice ? parseFloat(data.fixedPrice) : null,
        notes: data.notes,
      },
    });

    // Add participants if provided
    if (data.participants && Array.isArray(data.participants)) {
      for (const participant of data.participants) {
        await db.eventParticipant.create({
          data: {
            eventId: event.id,
            userId: participant.userId,
            role: participant.role,
            status: participant.status || "PENDING",
          },
        });
      }
    }

    // Add vehicles if provided
    if (data.vehicles && Array.isArray(data.vehicles)) {
      for (const vehicle of data.vehicles) {
        await db.eventVehicle.create({
          data: {
            eventId: event.id,
            vehicleId: vehicle.vehicleId,
            status: vehicle.status || "ASSIGNED",
            notes: vehicle.notes,
          },
        });
      }
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
