import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_EMAIL_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  getDashboardPathForRole,
  isUserRole,
  UserRole,
} from "@/lib/auth";
import { createUser } from "@/lib/user-store";

interface SignupBody {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const role = body.role;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required." },
        { status: 400 },
      );
    }

    if (!isUserRole(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    const account = await createUser({
      name,
      email,
      password,
      role,
    });

    const response = NextResponse.json({
      message: "Sign up successful.",
      role: account.role,
      redirectTo: getDashboardPathForRole(account.role),
    });

    response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set(AUTH_ROLE_COOKIE_NAME, account.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set(AUTH_EMAIL_COOKIE_NAME, account.email, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "Email already exists. Try another email." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Unable to process signup." }, { status: 500 });
  }
}
