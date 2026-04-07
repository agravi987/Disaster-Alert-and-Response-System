import DispatchCenterBoard from "@/components/dispatch-center-board";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function RescueCenterAssignmentsPage() {
  const session = await requireRole("rescue-center");

  return (
    <RoleShell
      roleLabel="Rescue Center"
      title="Assignments"
      subtitle="View team availability and assign tasks only to free field units."
      email={session.email}
      navItems={getRoleNavItems("rescue-center")}
    >
      <DispatchCenterBoard />
    </RoleShell>
  );
}
