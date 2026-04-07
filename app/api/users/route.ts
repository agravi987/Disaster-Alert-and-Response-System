import { NextRequest, NextResponse } from "next/server";
import { createUser, getAllUsers } from "@/lib/user-store";
import { requireRole } from "@/lib/auth-server";
import { isUserRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("admin");
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const body = await request.json();

    const { name, role, email, password } = body;

    if (!name || !role || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!isUserRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const newUser = await createUser({ name, role, email, password });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
