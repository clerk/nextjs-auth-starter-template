import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

// GET /api/chauffeurs/[id] - Get a specific chauffeur
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth session
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: params.id },
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
    });

    if (!chauffeur) {
      return NextResponse.json(
        { error: "Chauffeur not found" },
        { status: 404 }
      );
    }

    // Format the chauffeur data
    const formattedChauffeur = {
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
    };

    return NextResponse.json(formattedChauffeur);
  } catch (error) {
    console.error("Error fetching chauffeur:", error);
    return NextResponse.json(
      { error: "Failed to fetch chauffeur" },
      { status: 500 }
    );
  }
}

// PUT /api/chauffeurs/[id] - Update a chauffeur
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth session
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if the chauffeur exists
    const existingChauffeur = await prisma.chauffeur.findUnique({
      where: { id: params.id },
    });

    if (!existingChauffeur) {
      return NextResponse.json(
        { error: "Chauffeur not found" },
        { status: 404 }
      );
    }

    // Update the chauffeur
    const updatedChauffeur = await prisma.chauffeur.update({
      where: { id: params.id },
      data: {
        licenseNumber: body.licenseNumber,
        licenseExpiry: new Date(body.licenseExpiry),
        vehicleId: body.vehicleId || null,
        status: body.status || existingChauffeur.status,
        rating: body.rating || existingChauffeur.rating,
        notes: body.notes,
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

    return NextResponse.json(updatedChauffeur);
  } catch (error) {
    console.error("Error updating chauffeur:", error);
    return NextResponse.json(
      { error: "Failed to update chauffeur" },
      { status: 500 }
    );
  }
}

// DELETE /api/chauffeurs/[id] - Delete a chauffeur
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth session
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the chauffeur exists
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!chauffeur) {
      return NextResponse.json(
        { error: "Chauffeur not found" },
        { status: 404 }
      );
    }

    // Delete the chauffeur
    await prisma.chauffeur.delete({
      where: { id: params.id },
    });

    // Update the user's role if needed (optional)
    // This depends on your business logic - you might want to keep the CHAUFFEUR role
    // or change it back to something else

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chauffeur:", error);
    return NextResponse.json(
      { error: "Failed to delete chauffeur" },
      { status: 500 }
    );
  }
}
