import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners/[partnerId]/chauffeurs
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId } = params;

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

    // Get all chauffeurs for this partner
    const chauffeurs = await db.chauffeur.findMany({
      where: { partnerId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chauffeurs);
  } catch (error) {
    console.error("Error fetching chauffeurs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/partners/[partnerId]/chauffeurs
export async function POST(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId } = params;
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

      console.error(`Missing required fields: ${missingFields.join(', ')}`, data);

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

    // Create the chauffeur
    const chauffeur = await db.chauffeur.create({
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
        vehicleId: data.vehicleId === "none" ? null : data.vehicleId,
        partnerId,
      },
    });

    return NextResponse.json(chauffeur);
  } catch (error) {
    console.error("Error creating chauffeur:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
