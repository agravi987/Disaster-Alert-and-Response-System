import { NextResponse } from "next/server";
import {
  deleteAlert,
  getAlertById,
  markAlertAsResolved,
  updateAlert,
} from "@/lib/alert-store";
import { getRequestSession } from "@/lib/api-auth";
import { canDeleteAlert, canEditAlert, canResolveAlerts } from "@/lib/rbac";
import { UpdateAlertPayload } from "@/types/alert";

type RouteContext = { params: Promise<{ id: string }> };

// PUT: mark alert as resolved.
export async function PUT(_request: Request, context: RouteContext) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!canResolveAlerts(session.role)) {
      return NextResponse.json(
        { error: "Your role cannot resolve alerts." },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Alert id is required." }, { status: 400 });
    }

    const updatedAlert = await markAlertAsResolved(id);

    if (!updatedAlert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    return NextResponse.json({ alert: updatedAlert }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update alert." }, { status: 500 });
  }
}

// PATCH: update alert details according to role permissions.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Alert id is required." }, { status: 400 });
    }

    const targetAlert = await getAlertById(id);
    if (!targetAlert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    if (!canEditAlert(session.role, targetAlert, session.email)) {
      return NextResponse.json(
        { error: "Your role cannot edit this alert." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Partial<UpdateAlertPayload>;
    const payload: UpdateAlertPayload = {
      title: body.title?.trim(),
      description: body.description?.trim(),
      location: body.location?.trim(),
    };

    if (
      payload.title === undefined &&
      payload.description === undefined &&
      payload.location === undefined
    ) {
      return NextResponse.json(
        { error: "Provide at least one field to update." },
        { status: 400 },
      );
    }

    const updatedAlert = await updateAlert(id, payload);
    if (!updatedAlert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    return NextResponse.json({ alert: updatedAlert }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update alert." }, { status: 500 });
  }
}

// DELETE: remove an alert according to role permissions.
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getRequestSession();
    if (!session.isAuthenticated || !session.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Alert id is required." }, { status: 400 });
    }

    const targetAlert = await getAlertById(id);
    if (!targetAlert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    if (!canDeleteAlert(session.role, targetAlert, session.email)) {
      return NextResponse.json(
        { error: "Your role cannot delete this alert." },
        { status: 403 },
      );
    }

    const deleted = await deleteAlert(id);
    if (!deleted) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete alert." }, { status: 500 });
  }
}