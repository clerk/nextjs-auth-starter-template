import { NextRequest, NextResponse } from "next/server";

// OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET /api/vehicles - Get all vehicles
export async function GET(req: NextRequest) {
  try {
    // Simple mock data without any authentication checks
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

    // Set CORS headers to allow requests from any origin
    return new NextResponse(JSON.stringify(mockVehicles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch vehicles" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
