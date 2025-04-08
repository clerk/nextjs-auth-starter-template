import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/vehicles - Get all vehicles for an event
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

    // Get vehicles for the event
    const vehicles = await db.eventVehicle.findMany({
      where: { eventId },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/vehicles - Add a vehicle to an event
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
    if (!data.vehicleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Check if vehicle is already assigned to the event
    const existingAssignment = await db.eventVehicle.findFirst({
      where: {
        eventId,
        vehicleId: data.vehicleId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Vehicle is already assigned to this event" },
        { status: 400 }
      );
    }

    // Create the vehicle assignment
    const eventVehicle = await db.eventVehicle.create({
      data: {
        eventId,
        vehicleId: data.vehicleId,
        status: data.status || "ASSIGNED",
        notes: data.notes,
      },
    });

    return NextResponse.json(eventVehicle, { status: 201 });
  } catch (error) {
    console.error("Error assigning vehicle:", error);
    return NextResponse.json(
      { error: "Failed to assign vehicle" },
      { status: 500 }
    );
  }
}
