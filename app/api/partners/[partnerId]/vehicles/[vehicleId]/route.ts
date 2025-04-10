import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners/[partnerId]/vehicles/[vehicleId] - Get a specific vehicle
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, vehicleId } = params;

    // Check if vehicle exists and belongs to the partner
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        partnerId,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[partnerId]/vehicles/[vehicleId] - Update a specific vehicle
export async function PUT(
  req: NextRequest,
  { params }: { params: { partnerId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, vehicleId } = params;
    const data = await req.json();

    // Check if vehicle exists and belongs to the partner
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        partnerId,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Validate required fields
    if (!data.make || !data.model || !data.year || !data.licensePlate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if license plate is being changed and if it's already in use
    if (
      data.licensePlate !== existingVehicle.licensePlate &&
      (await db.vehicle.findUnique({ where: { licensePlate: data.licensePlate } }))
    ) {
      return NextResponse.json(
        { error: "A vehicle with this license plate already exists" },
        { status: 400 }
      );
    }

    // Process numeric fields
    const year = parseInt(data.year);
    const capacity = parseInt(data.capacity);

    // Update the vehicle
    const updatedVehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: {
        make: data.make,
        model: data.model,
        year,
        licensePlate: data.licensePlate,
        isForeignPlate: data.isForeignPlate || false,
        color: data.color,
        capacity,
        vehicleType: data.vehicleType,
        status: data.status,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
        // Update additional data from the API if available
        fuelType: data.fuelType,
        registrationDate: data.registrationDate,
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[partnerId]/vehicles/[vehicleId] - Delete a specific vehicle
export async function DELETE(
  req: NextRequest,
  { params }: { params: { partnerId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, vehicleId } = params;

    // Check if vehicle exists and belongs to the partner
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        partnerId,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Check if vehicle has related chauffeurs
    const relatedChauffeurs = await db.chauffeur.findMany({
      where: { vehicleId },
    });

    if (relatedChauffeurs.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete vehicle with assigned chauffeurs. Reassign chauffeurs first.",
        },
        { status: 400 }
      );
    }

    // Delete the vehicle
    await db.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
