import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// POST /api/partners/[partnerId]/vehicles/[vehicleId]/documents
export async function POST(
  req: NextRequest,
  { params }: { params: { partnerId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, vehicleId } = params;

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

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: {
        id: vehicleId,
        partnerId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Process the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Get other form fields
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const expiryDate = formData.get("expiryDate") as string;
    const notes = formData.get("notes") as string;
    const isVerified = formData.get("isVerified") === "true";

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "documents", "vehicles", vehicleId);
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convert the file to a Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create a URL for the file
    const fileUrl = `/uploads/documents/vehicles/${vehicleId}/${fileName}`;

    // Create the document in the database
    const document = await db.document.create({
      data: {
        name,
        type,
        url: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes,
        isVerified,
        vehicleId,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/partners/[partnerId]/vehicles/[vehicleId]/documents
export async function GET(
  req: NextRequest,
  { params }: { params: { partnerId: string; vehicleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId, vehicleId } = params;

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

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: {
        id: vehicleId,
        partnerId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Get all documents for this vehicle
    const documents = await db.document.findMany({
      where: { vehicleId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
