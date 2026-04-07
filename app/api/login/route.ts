import { NextResponse } from "next/server";
import {
  AUTH_EMAIL_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_ROLE_COOKIE_NAME,
  getDashboardPathForRole,
} from "@/lib/auth";
import { findUserByCredentials } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const account = await findUserByCredentials(email, password);

    if (!account) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Minimal auth: store role/email in HTTP-only cookies after successful login.
    const response = NextResponse.json({
      message: "Login successful.",
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
  } catch {
    return NextResponse.json({ error: "Unable to process login." }, { status: 500 });
  }
}
