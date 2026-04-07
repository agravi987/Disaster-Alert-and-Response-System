import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_EMAIL_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  isUserRole,
  UserRole,
} from "@/lib/auth";

export async function isRequestAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;

  return authCookie === AUTH_COOKIE_VALUE && isUserRole(roleCookie);
}

export interface RequestSession {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
}

export async function getRequestSession(): Promise<RequestSession> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;
  const emailCookie = cookieStore.get(AUTH_EMAIL_COOKIE_NAME)?.value ?? null;

  if (authCookie !== AUTH_COOKIE_VALUE || !isUserRole(roleCookie)) {
    return { isAuthenticated: false, role: null, email: null };
  }

  return { isAuthenticated: true, role: roleCookie, email: emailCookie };
}
