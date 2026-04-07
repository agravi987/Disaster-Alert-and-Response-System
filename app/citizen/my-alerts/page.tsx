import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";
import { getAlertsByUser } from "@/lib/alert-store";

export default async function CitizenMyAlertsPage() {
  const session = await requireRole("citizen");
  const userAlerts = await getAlertsByUser(session.email!);

  return (
    <RoleShell
      roleLabel="Citizen"
      title="My Alerts"
      subtitle="Track current status of alerts you reported."
      email={session.email}
      navItems={getRoleNavItems("citizen")}
    >
      <AlertDashboard
        canCreate={false}
        canResolve={false}
        canDelete
        canEdit
        userRole={session.role}
        userEmail={session.email}
        customAlerts={userAlerts}
        listTitle="Submitted Alerts"
      />
    </RoleShell>
  );
}
