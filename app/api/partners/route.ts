import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/partners - Get all partners
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const active = url.searchParams.get("active");
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");

    // Build filter object
    const filter: any = {};

    if (active === "true") {
      filter.status = "ACTIVE";
    } else if (active === "false") {
      filter.status = { not: "ACTIVE" };
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get partners with counts of related records
    const partners = await db.partner.findMany({
      where: filter,
      orderBy: { name: "asc" },
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

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create a new partner
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Check if partner with same email already exists
    const existingPartner = await db.partner.findUnique({
      where: { email: data.email },
    });

    if (existingPartner) {
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

    // Create the partner
    const partner = await db.partner.create({
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
        type: processedData.type || "EXTERNAL",
        status: processedData.status || "ACTIVE",
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
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
