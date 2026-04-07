import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/api-auth";
import {
  getRescueTeamStatuses,
  updateRescueTeamStatus,
} from "@/lib/team-store";
import { RescueTeamAvailability } from "@/types/team";

const TEAM_MANAGEMENT_ROLES = new Set(["admin", "rescue-center", "rescue-team"]);

function isRescueTeamAvailability(value: unknown): value is RescueTeamAvailability {
  return value === "available" || value === "busy" || value === "offline";
}

export async function GET() {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!TEAM_MANAGEMENT_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const teams = await getRescueTeamStatuses();
    return NextResponse.json({ teams }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch rescue teams." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!TEAM_MANAGEMENT_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as {
      status?: RescueTeamAvailability;
      teamEmail?: string;
    };

    if (!isRescueTeamAvailability(body.status)) {
      return NextResponse.json({ error: "Invalid team status." }, { status: 400 });
    }

    const targetEmail =
      session.role === "rescue-team"
        ? session.email
        : body.teamEmail?.trim().toLowerCase() ?? "";

    if (!targetEmail) {
      return NextResponse.json({ error: "Team email is required." }, { status: 400 });
    }

    const updated = await updateRescueTeamStatus(targetEmail, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    return NextResponse.json({ team: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "TEAM_HAS_ACTIVE_MISSIONS") {
      return NextResponse.json(
        { error: "Team has active missions and cannot be marked available yet." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to update team status." },
      { status: 500 },
    );
  }
}
