import { NextResponse } from "next/server";
import {
  createMissionAssignment,
  getMissions,
  getMissionStats,
} from "@/lib/mission-store";
import { getRequestSession } from "@/lib/api-auth";

const DISPATCH_ROLES = new Set(["admin", "rescue-center"]);

export async function GET() {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role === "citizen") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const teamEmail = session.role === "rescue-team" ? session.email ?? undefined : undefined;
    const [missions, stats] = await Promise.all([
      getMissions({ assignedTeamEmail: teamEmail }),
      getMissionStats(teamEmail),
    ]);

    return NextResponse.json({ missions, stats }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch missions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role || !session.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!DISPATCH_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      location?: string;
      sourceAlertId?: string;
      assignedTeamEmail?: string;
    };

    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const location = body.location?.trim() ?? "";
    const assignedTeamEmail = body.assignedTeamEmail?.trim().toLowerCase() ?? "";

    if (!title || !description || !location || !assignedTeamEmail) {
      return NextResponse.json(
        {
          error: "Title, description, location, and assigned team are required.",
        },
        { status: 400 },
      );
    }

    const mission = await createMissionAssignment({
      title,
      description,
      location,
      sourceAlertId: body.sourceAlertId,
      assignedTeamEmail,
      assignedBy: session.email,
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TEAM_NOT_FOUND") {
      return NextResponse.json({ error: "Selected team was not found." }, { status: 404 });
    }
    if (error instanceof Error && error.message === "TEAM_NOT_AVAILABLE") {
      return NextResponse.json(
        { error: "Selected team is not available for assignment." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Unable to create mission." }, { status: 500 });
  }
}
