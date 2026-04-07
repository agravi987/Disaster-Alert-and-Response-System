import { FiActivity, FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { requireRole } from "@/lib/auth-server";
import { getAlertStats } from "@/lib/alert-store";

export default async function AdminDashboardPage() {
  const session = await requireRole("admin");
  const stats = await getAlertStats();

  return (
    <RoleShell
      roleLabel="Admin"
      title="Admin Command Dashboard"
      subtitle="Monitor system-wide incidents and coordinate cross-team response."
      email={session.email}
      navItems={getRoleNavItems("admin")}
    >
      <div data-testid="dashboard-page">
        <SummaryCards
          cards={[
            {
              label: "Open Alerts",
              value: stats.active.toString(),
              helper: "Across all monitored zones",
              icon: FiAlertTriangle,
            },
            {
              label: "Resolved",
              value: stats.resolved.toString(),
              helper: "Total resolved",
              icon: FiCheckCircle,
            },
            {
              label: "Total Alerts",
              value: stats.total.toString(),
              helper: "All time total",
              icon: FiClock,
            },
            {
              label: "System Health",
              value: "Stable",
              helper: "No degraded services",
              icon: FiActivity,
            },
          ]}
        />
      </div>

      <AlertDashboard
        canCreate
        canResolve
        canDelete
        canEdit
        userRole={session.role}
        userEmail={session.email}
        listTitle="Global Incident Feed"
        createTitle="Issue Administrative Alert"
      />
    </RoleShell>
  );
}
