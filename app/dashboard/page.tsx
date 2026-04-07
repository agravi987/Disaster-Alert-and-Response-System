import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth-server";
import { getDashboardPathForRole } from "@/lib/auth";

export default async function LegacyDashboardPage() {
  const session = await getSessionInfo();

  if (!session.isAuthenticated || !session.role) {
    redirect("/login");
  }

  redirect(getDashboardPathForRole(session.role));
}
