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

    const clientId = params.clientId as string;

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
            phone: true,
            role: true,
            clerkId: true,
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

    const clientId = params.clientId as string;
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: clientId },
      include: {
        users: {
          take: 1,
          orderBy: {
            createdAt: "desc"
          },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if another client with the same name exists (excluding this client)
    const duplicateClient = await db.client.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
        id: {
          not: clientId,
        },
      },
    });

    if (duplicateClient) {
      return NextResponse.json(
        { error: "Another client with this name already exists" },
        { status: 409 }
      );
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
        active: data.active ?? true,
        contractStart: data.contractStart && data.contractStart !== "" ? new Date(data.contractStart) : null,
        contractEnd: data.contractEnd && data.contractEnd !== "" ? new Date(data.contractEnd) : null,
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            clerkId: true,
          },
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

    // Handle primary contact information
    if (
      data.contactEmail &&
      data.contactFirstName &&
      data.contactLastName
    ) {
      if (existingClient.users && existingClient.users.length > 0) {
        // Update existing primary contact
        const primaryContact = existingClient.users[0];

        // Update the user in our database
        await db.user.update({
          where: { id: primaryContact.id },
          data: {
            firstName: data.contactFirstName,
            lastName: data.contactLastName,
            email: data.contactEmail,
            phone: data.contactPhone || null,
          },
        });

        // Update the user in Clerk if needed
        if (primaryContact.clerkId) {
          try {
            const { clerkClient } = await import("@clerk/nextjs/server");
            await clerkClient.users.updateUser(primaryContact.clerkId, {
              firstName: data.contactFirstName,
              lastName: data.contactLastName,
              emailAddress: [data.contactEmail],
            });
          } catch (userError) {
            console.error("Error updating user in Clerk:", userError);
            // We don't want to fail the client update if Clerk update fails
          }
        }
      } else {
        // Since we can't create a user without a clerkId, we'll store the contact info
        // in a note in the client's metadata or in a comment to the user

        // For now, we'll just log the contact information and return a message
        console.log("Primary contact information provided but not saved as a user:", {
          firstName: data.contactFirstName,
          lastName: data.contactLastName,
          email: data.contactEmail,
          phone: data.contactPhone || null,
        });

        // Note: In a complete implementation, we would:
        // 1. Create a Clerk user first
        // 2. Get the clerkId from the created user
        // 3. Then create a user in our database with that clerkId
        // 4. Send an invitation email to the user
      }
    }

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

    const clientId = params.clientId as string;

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
