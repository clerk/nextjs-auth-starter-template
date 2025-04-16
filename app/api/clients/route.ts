import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/clients - Get all clients
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

    // Build filter object
    const filter: any = {};

    if (active === "true") {
      filter.active = true;
    } else if (active === "false") {
      filter.active = false;
    }

    if (search) {
      // Check for special search parameters like "active:true"
      if (search.startsWith("active:")) {
        const activeValue = search.split(":")[1];
        if (activeValue === "true") {
          filter.active = true;
        } else if (activeValue === "false") {
          filter.active = false;
        }
      } else {
        // Regular search
        filter.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
        ];
      }
    }

    // Get clients with filtering
    const clients = await db.client.findMany({
      where: filter,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        website: true,
        logoUrl: true,
        active: true,
        contractStart: true,
        contractEnd: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            bookings: true,
            events: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
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
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    // Validate contact information if provided
    if (data.contactEmail) {
      if (!data.contactFirstName || !data.contactLastName) {
        return NextResponse.json(
          { error: "Contact first and last name are required" },
          { status: 400 }
        );
      }
    }

    // Check if a client with the same name already exists
    const existingClient = await db.client.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive"
        }
      }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "A client with this name already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // Check if a user with the contact email already exists
    if (data.contactEmail) {
      const existingUser = await db.user.findFirst({
        where: {
          email: data.contactEmail
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Create the client
    const client = await db.client.create({
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
        _count: {
          select: {
            users: true,
            bookings: true,
            events: true,
          },
        },
      },
    });

    // Create a user for the client contact if provided
    if (data.contactEmail && data.contactFirstName && data.contactLastName) {
      try {
        // Import the Clerk SDK
        const { clerkClient } = await import("@clerk/nextjs/server");

        // Create a new user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [data.contactEmail],
          firstName: data.contactFirstName,
          lastName: data.contactLastName,
          password: null, // This will force Clerk to send a magic link
          skipPasswordRequirement: true,
        });

        // Create a user in our database linked to the client
        if (clerkUser.id) {
          await db.user.create({
            data: {
              clerkId: clerkUser.id,
              email: data.contactEmail,
              firstName: data.contactFirstName,
              lastName: data.contactLastName,
              phone: data.contactPhone || null,
              role: "CUSTOMER", // Set the role to CUSTOMER for client contacts
              clientId: client.id, // Link to the client
            },
          });

          // Send invitation email if requested
          if (data.sendInvitation) {
            await clerkClient.invitations.createInvitation({
              emailAddress: data.contactEmail,
              redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}`,
              publicMetadata: {
                clientId: client.id,
                clientName: client.name,
              },
            });
          }
        }
      } catch (userError) {
        console.error("Error creating user for client:", userError);
        // We don't want to fail the client creation if user creation fails
        // But we should log it and maybe notify the admin
      }
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
