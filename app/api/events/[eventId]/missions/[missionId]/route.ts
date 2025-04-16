import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/events/[eventId]/missions/[missionId] - Get a specific mission
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string; missionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, missionId } = params;

    // Check if mission exists and belongs to the event
    const mission = await db.mission.findFirst({
      where: {
        id: missionId,
        eventId,
      },
      include: {
        rides: {
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            chauffeur: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { error: "Failed to fetch mission" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId]/missions/[missionId] - Update a specific mission
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string; missionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, missionId } = params;
    const data = await req.json();

    // Check if mission exists and belongs to the event
    const existingMission = await db.mission.findFirst({
      where: {
        id: missionId,
        eventId,
      },
    });

    if (!existingMission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Update the mission
    const updatedMission = await db.mission.update({
      where: { id: missionId },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        location: data.location,
        fare: data.fare ? parseFloat(data.fare) : null,
        notes: data.notes,
      },
    });

    // Update event total fare if pricing type is MISSION_BASED
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (event && event.pricingType === "MISSION_BASED") {
      const allMissions = await db.mission.findMany({
        where: { eventId },
        select: { fare: true },
      });

      const totalFare = allMissions.reduce((sum, mission) => {
        return sum + (mission.fare ? parseFloat(mission.fare.toString()) : 0);
      }, 0);

      await db.event.update({
        where: { id: eventId },
        data: { totalFare },
      });
    }

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error("Error updating mission:", error);
    return NextResponse.json(
      { error: "Failed to update mission" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/missions/[missionId] - Delete a specific mission
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; missionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, missionId } = params;

    // Check if mission exists and belongs to the event
    const existingMission = await db.mission.findFirst({
      where: {
        id: missionId,
        eventId,
      },
    });

    if (!existingMission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Update rides to remove mission association
    await db.ride.updateMany({
      where: { missionId },
      data: { missionId: null },
    });

    // Delete the mission
    await db.mission.delete({
      where: { id: missionId },
    });

    // Update event total fare if pricing type is MISSION_BASED
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (event && event.pricingType === "MISSION_BASED") {
      const allMissions = await db.mission.findMany({
        where: { eventId },
        select: { fare: true },
      });

      const totalFare = allMissions.reduce((sum, mission) => {
        return sum + (mission.fare ? parseFloat(mission.fare.toString()) : 0);
      }, 0);

      await db.event.update({
        where: { id: eventId },
        data: { totalFare },
      });
    }

    return NextResponse.json({ message: "Mission deleted successfully" });
  } catch (error) {
    console.error("Error deleting mission:", error);
    return NextResponse.json(
      { error: "Failed to delete mission" },
      { status: 500 }
    );
  }
}
