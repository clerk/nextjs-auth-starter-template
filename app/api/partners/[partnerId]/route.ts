import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners/[partnerId] - Get a specific partner
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId as string;

    // Get partner with related data
    const partner = await db.partner.findUnique({
      where: { id: partnerId },
      include: {
        eventParticipations: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            event: true,
          },
        },
        missionPartners: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            mission: true,
          },
        },
        ridePartners: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            ride: true,
          },
        },
        _count: {
          select: {
            eventParticipations: true,
            missionPartners: true,
            ridePartners: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[partnerId] - Update a specific partner
export async function PUT(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId as string;
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    if (!data.email || !data.email.trim()) {
      return NextResponse.json(
        { error: "Partner email is required" },
        { status: 400 }
      );
    }

    // Check if partner exists
    const existingPartner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (
      data.email !== existingPartner.email &&
      (await db.partner.findUnique({ where: { email: data.email } }))
    ) {
      return NextResponse.json(
        { error: "A partner with this email already exists" },
        { status: 400 }
      );
    }

    // Process numeric fields
    const numericFields = ['ratePerKm', 'ratePerHour', 'minimumFare', 'commissionRate', 'balance'];
    const processedData = { ...data };
    
    numericFields.forEach(field => {
      if (processedData[field] !== undefined && processedData[field] !== null && processedData[field] !== '') {
        processedData[field] = parseFloat(processedData[field]);
      } else {
        delete processedData[field];
      }
    });

    // Update the partner
    const updatedPartner = await db.partner.update({
      where: { id: partnerId },
      data: {
        name: processedData.name,
        email: processedData.email,
        phone: processedData.phone,
        address: processedData.address,
        city: processedData.city,
        country: processedData.country,
        postalCode: processedData.postalCode,
        website: processedData.website,
        logoUrl: processedData.logoUrl,
        type: processedData.type,
        status: processedData.status,
        notes: processedData.notes,
        balance: processedData.balance,
        ratePerKm: processedData.ratePerKm,
        ratePerHour: processedData.ratePerHour,
        minimumFare: processedData.minimumFare,
        commissionRate: processedData.commissionRate,
        paymentTerms: processedData.paymentTerms,
        bankName: processedData.bankName,
        bankAccountNumber: processedData.bankAccountNumber,
        bankRoutingNumber: processedData.bankRoutingNumber,
        taxId: processedData.taxId,
      },
      include: {
        _count: {
          select: {
            eventParticipations: true,
            missionPartners: true,
            ridePartners: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[partnerId] - Delete a specific partner
export async function DELETE(
  req: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partnerId = params.partnerId as string;

    // Check if partner exists
    const existingPartner = await db.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Check if partner has related records
    const relatedRecords = await db.partner.findUnique({
      where: { id: partnerId },
      select: {
        _count: {
          select: {
            eventParticipations: true,
            missionPartners: true,
            ridePartners: true,
          },
        },
      },
    });

    if (
      relatedRecords?._count.eventParticipations > 0 ||
      relatedRecords?._count.missionPartners > 0 ||
      relatedRecords?._count.ridePartners > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete partner with related events, missions, or rides. Change the partner status to INACTIVE instead.",
        },
        { status: 400 }
      );
    }

    // Delete the partner
    await db.partner.delete({
      where: { id: partnerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
