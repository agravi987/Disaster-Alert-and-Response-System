import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/api-auth";
import { getMissionById, updateMissionStatus } from "@/lib/mission-store";
import { MissionStatus } from "@/types/mission";

type RouteContext = { params: Promise<{ id: string }> };

function isMissionStatus(value: unknown): value is MissionStatus {
  return value === "Assigned" || value === "In Progress" || value === "Completed";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role === "citizen") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Mission id is required." }, { status: 400 });
    }

    const mission = await getMissionById(id);
    if (!mission) {
      return NextResponse.json({ error: "Mission not found." }, { status: 404 });
    }

    if (session.role === "rescue-team" && mission.assignedTeamEmail !== session.email) {
      return NextResponse.json(
        { error: "You can only update your own assigned missions." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { status?: MissionStatus };
    if (!isMissionStatus(body.status)) {
      return NextResponse.json({ error: "Invalid mission status." }, { status: 400 });
    }

    const updated = await updateMissionStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Mission not found." }, { status: 404 });
    }

    return NextResponse.json({ mission: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update mission." }, { status: 500 });
  }
}
