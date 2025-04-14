import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

// GET /api/chauffeurs - Get all chauffeurs
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

    // Fetch chauffeurs with their user information
    const chauffeurs = await prisma.chauffeur.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to a more convenient format for the frontend
    const formattedChauffeurs = chauffeurs.map((chauffeur) => ({
      id: chauffeur.id,
      userId: chauffeur.userId,
      firstName: chauffeur.user.firstName,
      lastName: chauffeur.user.lastName,
      fullName: `${chauffeur.user.firstName} ${chauffeur.user.lastName}`,
      email: chauffeur.user.email,
      phone: chauffeur.user.phone,
      licenseNumber: chauffeur.licenseNumber,
      licenseExpiry: chauffeur.licenseExpiry,
      status: chauffeur.status,
      rating: chauffeur.rating,
      notes: chauffeur.notes,
      vehicle: chauffeur.vehicle ? {
        id: chauffeur.vehicle.id,
        name: `${chauffeur.vehicle.make} ${chauffeur.vehicle.model}`,
        licensePlate: chauffeur.vehicle.licensePlate,
      } : null,
      createdAt: chauffeur.createdAt,
      updatedAt: chauffeur.updatedAt,
    }));

    return NextResponse.json(formattedChauffeurs);
  } catch (error) {
    console.error("Error fetching chauffeurs:", error);
    return NextResponse.json(
      { error: "Failed to fetch chauffeurs" },
      { status: 500 }
    );
  }
}

// POST /api/chauffeurs - Create a new chauffeur
export async function POST(req: NextRequest) {
  try {
    // Authentication is handled by the middleware
    const { userId } = auth();

    // Just a double-check, but middleware should already handle this
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user already has a chauffeur profile
    const existingChauffeur = await prisma.chauffeur.findUnique({
      where: { userId: body.userId },
    });

    if (existingChauffeur) {
      return NextResponse.json(
        { error: "User already has a chauffeur profile" },
        { status: 400 }
      );
    }

    // Create the chauffeur profile
    const chauffeur = await prisma.chauffeur.create({
      data: {
        userId: body.userId,
        licenseNumber: body.licenseNumber,
        licenseExpiry: new Date(body.licenseExpiry),
        vehicleId: body.vehicleId || null,
        status: body.status || "AVAILABLE",
        rating: body.rating || null,
        notes: body.notes || null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
      },
    });

    // Update the user's role to CHAUFFEUR if it's not already
    if (user.role !== "CHAUFFEUR") {
      await prisma.user.update({
        where: { id: body.userId },
        data: { role: "CHAUFFEUR" },
      });
    }

    return NextResponse.json(chauffeur, { status: 201 });
  } catch (error) {
    console.error("Error creating chauffeur:", error);
    return NextResponse.json(
      { error: "Failed to create chauffeur" },
      { status: 500 }
    );
  }
}
