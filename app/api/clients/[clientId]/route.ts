import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/clients/[clientId] - Get a specific client
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.clientId;

    // Get client with related data
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        billingInfo: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        events: {
          take: 5,
          orderBy: { startDate: "desc" },
        },
        _count: {
          select: {
            users: true,
            bookings: true,
            events: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[clientId] - Update a specific client
export async function PUT(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.clientId;
    const data = await req.json();

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: clientId },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Update the client
    const updatedClient = await db.client.update({
      where: { id: clientId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        website: data.website,
        logoUrl: data.logoUrl,
        active: data.active,
        contractStart: data.contractStart ? new Date(data.contractStart) : null,
        contractEnd: data.contractEnd ? new Date(data.contractEnd) : null,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[clientId] - Delete a specific client
export async function DELETE(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.clientId;

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: clientId },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client has related records
    const relatedRecords = await db.client.findUnique({
      where: { id: clientId },
      select: {
        _count: {
          select: {
            users: true,
            bookings: true,
            events: true,
          },
        },
      },
    });

    if (
      relatedRecords?._count.users > 0 ||
      relatedRecords?._count.bookings > 0 ||
      relatedRecords?._count.events > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete client with related users, bookings, or events. Deactivate the client instead.",
        },
        { status: 400 }
      );
    }

    // Delete billing info if exists
    await db.billingInfo.deleteMany({
      where: { clientId },
    });

    // Delete the client
    await db.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
