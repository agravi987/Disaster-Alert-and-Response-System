import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function RescueCenterIncomingAlertsPage() {
  const session = await requireRole("rescue-center");

  return (
    <RoleShell
      roleLabel="Rescue Center"
      title="Incoming Alerts"
      subtitle="Review, validate, and prioritize newly reported incidents."
      email={session.email}
      navItems={getRoleNavItems("rescue-center")}
    >
      <AlertDashboard
        canCreate={false}
        canResolve
        canEdit
        userRole={session.role}
        userEmail={session.email}
        listTitle="Incoming Queue"
      />
    </RoleShell>
  );
}
