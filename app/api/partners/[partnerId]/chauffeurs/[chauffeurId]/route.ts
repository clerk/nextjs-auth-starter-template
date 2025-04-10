import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners/[partnerId]/chauffeurs/[chauffeurId]
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string; chauffeurId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, chauffeurId } = params;

    // Check if partner exists
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Get the chauffeur
    const chauffeur = await db.chauffeur.findUnique({
      where: {
        id: chauffeurId,
        partnerId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            uploadedAt: true,
            expiryDate: true,
            isVerified: true,
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

    return NextResponse.json(chauffeur);
  } catch (error) {
    console.error("Error fetching chauffeur:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[partnerId]/chauffeurs/[chauffeurId]
export async function PUT(
  req: NextRequest,
  { params }: { params: { partnerId: string; chauffeurId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, chauffeurId } = params;
    const data = await req.json();

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.licenseNumber || !data.licenseExpiry) {
      const missingFields = [];
      if (!data.firstName) missingFields.push('firstName');
      if (!data.lastName) missingFields.push('lastName');
      if (!data.email) missingFields.push('email');
      if (!data.phone) missingFields.push('phone');
      if (!data.licenseNumber) missingFields.push('licenseNumber');
      if (!data.licenseExpiry) missingFields.push('licenseExpiry');

      console.error(`Missing required fields in update: ${missingFields.join(', ')}`, data);

      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Check if chauffeur exists
    const existingChauffeur = await db.chauffeur.findUnique({
      where: {
        id: chauffeurId,
        partnerId,
      },
    });

    if (!existingChauffeur) {
      return NextResponse.json(
        { error: "Chauffeur not found" },
        { status: 404 }
      );
    }

    // Update the chauffeur
    const updatedChauffeur = await db.chauffeur.update({
      where: { id: chauffeurId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        licenseExpiry: new Date(data.licenseExpiry),
        isExternalChauffeur: data.isExternalChauffeur || false,
        nextIsChauffeurId: data.nextIsChauffeurId,
        notes: data.notes,
        status: data.status || "AVAILABLE",
        vehicleId: data.vehicleId,
      },
    });

    return NextResponse.json(updatedChauffeur);
  } catch (error) {
    console.error("Error updating chauffeur:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[partnerId]/chauffeurs/[chauffeurId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { partnerId: string; chauffeurId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, chauffeurId } = params;

    // Check if partner exists
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Check if chauffeur exists
    const chauffeur = await db.chauffeur.findUnique({
      where: {
        id: chauffeurId,
        partnerId,
      },
    });

    if (!chauffeur) {
      return NextResponse.json(
        { error: "Chauffeur not found" },
        { status: 404 }
      );
    }

    // Delete the chauffeur's documents first
    await db.document.deleteMany({
      where: { chauffeurId },
    });

    // Delete the chauffeur
    await db.chauffeur.delete({
      where: { id: chauffeurId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chauffeur:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
