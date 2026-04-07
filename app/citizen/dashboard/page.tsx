import { FiAlertTriangle, FiMapPin, FiShield, FiCheckCircle } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { requireRole } from "@/lib/auth-server";
import { getUserAlertStats } from "@/lib/alert-store";

export default async function CitizenDashboardPage() {
  const session = await requireRole("citizen");
  const stats = await getUserAlertStats(session.email!);

  return (
    <RoleShell
      roleLabel="Citizen"
      title="Citizen Alert Portal"
      subtitle="Report incidents quickly and track live response status from command."
      email={session.email}
      navItems={getRoleNavItems("citizen")}
    >
      <div data-testid="dashboard-page">
        <SummaryCards
          cards={[
            {
              label: "My Reports",
              value: stats.total.toString(),
              helper: "Total alerts you submitted",
              icon: FiAlertTriangle,
            },
            {
              label: "Active Reports",
              value: stats.active.toString(),
              helper: "Awaiting resolution",
              icon: FiMapPin,
            },
            {
              label: "Resolved",
              value: stats.resolved.toString(),
              helper: "Successfully handled",
              icon: FiCheckCircle,
            },
            {
              label: "Safety Status",
              value: "Stable",
              helper: "No active warnings nearby",
              icon: FiShield,
            },
          ]}
        />
      </div>

      <AlertDashboard
        canCreate
        canResolve={false}
        canDelete
        canEdit
        userRole={session.role}
        userEmail={session.email}
        listTitle="Community Alert Feed"
        createTitle="Report a Verified Incident"
      />
    </RoleShell>
  );
}
