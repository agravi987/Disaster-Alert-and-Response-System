import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function CitizenReportAlertPage() {
  const session = await requireRole("citizen");

  return (
    <RoleShell
      roleLabel="Citizen"
      title="Report Alert"
      subtitle="Share accurate details so rescue teams can respond faster."
      email={session.email}
      navItems={getRoleNavItems("citizen")}
    >
      <AlertDashboard
        canCreate
        canResolve={false}
        userRole={session.role}
        userEmail={session.email}
        canDelete
        canEdit
        listTitle="Latest Public Alerts"
        createTitle="Report Incident"
      />
    </RoleShell>
  );
}
