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

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    // Simple mock data without any authentication checks
    const mockUsers = [
      {
        id: "user_1",
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        role: "CHAUFFEUR",
      },
      {
        id: "user_2",
        firstName: "Jane",
        lastName: "Smith",
        fullName: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+0987654321",
        role: "CHAUFFEUR",
      },
      {
        id: "user_3",
        firstName: "Michael",
        lastName: "Johnson",
        fullName: "Michael Johnson",
        email: "michael.johnson@example.com",
        phone: "+1122334455",
        role: "CHAUFFEUR",
      },
    ];

    // Set CORS headers to allow requests from any origin
    return new NextResponse(JSON.stringify(mockUsers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
