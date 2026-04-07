import { FiCheckCircle, FiClock, FiTool, FiTruck } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { requireRole } from "@/lib/auth-server";

export default async function RescueTeamDashboardPage() {
  const session = await requireRole("rescue-team");

  return (
    <RoleShell
      roleLabel="Rescue Team"
      title="Field Team Dashboard"
      subtitle="Manage active missions, check-ins, and ground updates."
      email={session.email}
      navItems={getRoleNavItems("rescue-team")}
    >
      <div data-testid="dashboard-page">
        <SummaryCards
          cards={[
            {
              label: "Active Missions",
              value: "2",
              helper: "Currently assigned",
              icon: FiTruck,
            },
            {
              label: "Completed Today",
              value: "4",
              helper: "Successfully resolved",
              icon: FiCheckCircle,
            },
            {
              label: "Next Dispatch",
              value: "8m",
              helper: "Estimated mobilization",
              icon: FiClock,
            },
            {
              label: "Equipment",
              value: "Ready",
              helper: "All kits checked",
              icon: FiTool,
            },
          ]}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Shift Brief
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Stay on standby for high-priority flood and fire incidents in Sectors 5-8.
        </p>
      </section>

      <AlertDashboard
        canCreate={false}
        canResolve
        canDelete={false}
        canEdit={false}
        userRole={session.role}
        userEmail={session.email}
        listTitle="Field Resolution Queue"
      />
    </RoleShell>
  );
}
