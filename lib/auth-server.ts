import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_EMAIL_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  getDashboardPathForRole,
  isUserRole,
  UserRole,
} from "@/lib/auth";

export interface SessionInfo {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
}

export async function getSessionInfo(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const roleCookie = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;
  const emailCookie = cookieStore.get(AUTH_EMAIL_COOKIE_NAME)?.value ?? null;

  if (authCookie !== AUTH_COOKIE_VALUE || !isUserRole(roleCookie)) {
    return {
      isAuthenticated: false,
      role: null,
      email: null,
    };
  }

  return {
    isAuthenticated: true,
    role: roleCookie,
    email: emailCookie,
  };
}

export async function requireRole(requiredRole: UserRole): Promise<SessionInfo> {
  const session = await getSessionInfo();

  if (!session.isAuthenticated || !session.role) {
    redirect("/login");
  }

  if (session.role !== requiredRole) {
    redirect(getDashboardPathForRole(session.role));
  }

  return session;
}
