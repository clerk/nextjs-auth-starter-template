import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/missions - Get all missions for an event
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

    // Get missions for the event
    const missions = await db.mission.findMany({
      where: { eventId },
      include: {
        rides: {
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            chauffeur: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(missions);
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/missions - Create a new mission for an event
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
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the mission
    const mission = await db.mission.create({
      data: {
        title: data.title,
        description: data.description,
        eventId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || "PLANNED",
        location: data.location,
        fare: data.fare ? parseFloat(data.fare) : null,
        notes: data.notes,
      },
    });

    // Create rides if provided
    if (data.rides && Array.isArray(data.rides)) {
      for (const ride of data.rides) {
        await db.ride.create({
          data: {
            bookingId: ride.bookingId,
            passengerId: ride.passengerId,
            chauffeurId: ride.chauffeurId,
            pickupAddress: ride.pickupAddress,
            dropoffAddress: ride.dropoffAddress,
            pickupTime: new Date(ride.pickupTime),
            dropoffTime: ride.dropoffTime ? new Date(ride.dropoffTime) : null,
            status: ride.status || "SCHEDULED",
            fare: ride.fare ? parseFloat(ride.fare) : null,
            distance: ride.distance ? parseFloat(ride.distance) : null,
            duration: ride.duration,
            notes: ride.notes,
            missionId: mission.id,
          },
        });
      }
    }

    // Update event total fare if pricing type is MISSION_BASED
    if (event.pricingType === "MISSION_BASED") {
      const allMissions = await db.mission.findMany({
        where: { eventId },
        select: { fare: true },
      });

      const totalFare = allMissions.reduce((sum, mission) => {
        return sum + (mission.fare ? parseFloat(mission.fare.toString()) : 0);
      }, 0);

      await db.event.update({
        where: { id: eventId },
        data: { totalFare },
      });
    }

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json(
      { error: "Failed to create mission" },
      { status: 500 }
    );
  }
}
