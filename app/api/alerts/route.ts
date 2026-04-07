import { NextResponse } from "next/server";
import { createAlert, getAlerts } from "@/lib/alert-store";
import { getRequestSession } from "@/lib/api-auth";
import { canCreateAlerts, canReadAlerts } from "@/lib/rbac";
import { CreateAlertPayload } from "@/types/alert";

export async function GET() {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!session.role || !canReadAlerts(session.role)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const alerts = await getAlerts();
    return NextResponse.json({ alerts }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!session.role || !canCreateAlerts(session.role)) {
      return NextResponse.json(
        { error: "Your role cannot create alerts." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Partial<CreateAlertPayload>;

    const payload: CreateAlertPayload = {
      title: body.title?.trim() ?? "",
      description: body.description?.trim() ?? "",
      location: body.location?.trim() ?? "",
      createdBy: session.email ?? undefined,
    };

    if (!payload.title || !payload.description || !payload.location) {
      return NextResponse.json(
        { error: "Title, description, and location are required." },
        { status: 400 },
      );
    }

    // New alerts are persisted in MongoDB and returned to update UI immediately.
    const alert = await createAlert(payload);
    return NextResponse.json({ alert }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create alert." }, { status: 500 });
  }
}
