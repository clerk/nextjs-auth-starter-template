import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/vehicles/[vehicleId] - Get a specific vehicle assignment
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, vehicleId } = params;

    // Check if vehicle assignment exists
    const eventVehicle = await db.eventVehicle.findFirst({
      where: {
        id: vehicleId,
        eventId,
      },
      include: {
        vehicle: true,
      },
    });

    if (!eventVehicle) {
      return NextResponse.json(
        { error: "Vehicle assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(eventVehicle);
  } catch (error) {
    console.error("Error fetching vehicle assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle assignment" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId]/vehicles/[vehicleId] - Update a specific vehicle assignment
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, vehicleId } = params;
    const data = await req.json();

    // Check if vehicle assignment exists
    const existingAssignment = await db.eventVehicle.findFirst({
      where: {
        id: vehicleId,
        eventId,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Vehicle assignment not found" },
        { status: 404 }
      );
    }

    // Update the vehicle assignment
    const updatedAssignment = await db.eventVehicle.update({
      where: { id: vehicleId },
      data: {
        status: data.status,
        notes: data.notes,
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating vehicle assignment:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle assignment" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/vehicles/[vehicleId] - Remove a vehicle from an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, vehicleId } = params;

    // Check if vehicle assignment exists
    const existingAssignment = await db.eventVehicle.findFirst({
      where: {
        id: vehicleId,
        eventId,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Vehicle assignment not found" },
        { status: 404 }
      );
    }

    // Delete the vehicle assignment
    await db.eventVehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({
      message: "Vehicle removed from event successfully",
    });
  } catch (error) {
    console.error("Error removing vehicle from event:", error);
    return NextResponse.json(
      { error: "Failed to remove vehicle from event" },
      { status: 500 }
    );
  }
}
