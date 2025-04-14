import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

// GET /api/users - Get all users
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
    const role = url.searchParams.get("role");

    // Build the where clause based on filters
    const where: any = {};
    if (role) {
      where.role = role;
    }

    // For now, return mock users since we're still developing
    // In a real implementation, you would fetch users from the database
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

    // In a real implementation, you would filter users based on the role parameter
    const formattedUsers = mockUsers;

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
