import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

// GET /api/vehicles - Get all vehicles
export async function GET(req: NextRequest) {
  try {
    // Authentication is handled by the middleware
    const { userId } = auth();

    // Just a double-check, but middleware should already handle this
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build the where clause based on filters
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // For now, return mock vehicles since we're still developing
    // In a real implementation, you would fetch vehicles from the database
    const mockVehicles = [
      {
        id: "vehicle_1",
        make: "Mercedes",
        model: "S-Class",
        licensePlate: "ABC123",
        year: 2023,
        color: "Black",
        capacity: 4,
        vehicleType: "SEDAN",
        status: "AVAILABLE",
      },
      {
        id: "vehicle_2",
        make: "BMW",
        model: "7 Series",
        licensePlate: "XYZ789",
        year: 2022,
        color: "Silver",
        capacity: 4,
        vehicleType: "SEDAN",
        status: "AVAILABLE",
      },
      {
        id: "vehicle_3",
        make: "Audi",
        model: "A8",
        licensePlate: "DEF456",
        year: 2023,
        color: "White",
        capacity: 4,
        vehicleType: "SEDAN",
        status: "AVAILABLE",
      },
    ];

    // In a real implementation, you would filter vehicles based on the status parameter
    const filteredVehicles = status
      ? mockVehicles.filter(vehicle => vehicle.status === status)
      : mockVehicles;

    return NextResponse.json(filteredVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
