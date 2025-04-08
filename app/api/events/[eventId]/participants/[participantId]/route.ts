import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/participants/[participantId] - Get a specific participant
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; participantId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, participantId } = params;

    // Check if participant exists and belongs to the event
    const participant = await db.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId]/participants/[participantId] - Update a specific participant
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string; participantId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, participantId } = params;
    const data = await req.json();

    // Check if participant exists and belongs to the event
    const existingParticipant = await db.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
      },
    });

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Update the participant
    const updatedParticipant = await db.eventParticipant.update({
      where: { id: participantId },
      data: {
        role: data.role,
        status: data.status,
      },
    });

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/participants/[participantId] - Remove a participant from an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; participantId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, participantId } = params;

    // Check if participant exists and belongs to the event
    const existingParticipant = await db.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
      },
    });

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Delete the participant
    await db.eventParticipant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({
      message: "Participant removed successfully",
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
