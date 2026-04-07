import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth-server";
import { getDashboardPathForRole } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionInfo();

  if (session.isAuthenticated && session.role) {
    redirect(getDashboardPathForRole(session.role));
  }

  redirect("/login");
}
