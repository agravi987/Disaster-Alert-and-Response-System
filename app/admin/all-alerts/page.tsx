import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function AdminAllAlertsPage() {
  const session = await requireRole("admin");

  return (
    <RoleShell
      roleLabel="Admin"
      title="All Alerts"
      subtitle="Full incident stream with status control."
      email={session.email}
      navItems={getRoleNavItems("admin")}
    >
      <AlertDashboard
        canCreate={false}
        canResolve
        canDelete
        canEdit
        userRole={session.role}
        userEmail={session.email}
        listTitle="System Incident Ledger"
      />
    </RoleShell>
  );
}
