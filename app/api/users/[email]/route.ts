import { NextRequest, NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/lib/user-store";
import { requireRole } from "@/lib/auth-server";
import { isUserRole } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    await requireRole("admin");
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const body = await request.json();

    if (body.role && !isUserRole(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await updateUser(decodedEmail, {
      name: body.name,
      role: body.role,
      password: body.password,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    await requireRole("admin");
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const success = await deleteUser(decodedEmail);

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
