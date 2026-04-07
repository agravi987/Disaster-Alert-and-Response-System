import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_EMAIL_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });

  for (const cookieName of [
    AUTH_COOKIE_NAME,
    AUTH_ROLE_COOKIE_NAME,
    AUTH_EMAIL_COOKIE_NAME,
  ]) {
    response.cookies.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}
