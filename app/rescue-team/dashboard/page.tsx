import { FiCheckCircle, FiClock, FiTool, FiTruck } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { requireRole } from "@/lib/auth-server";
import { getMissionStats } from "@/lib/mission-store";
import { getRescueTeamStatusByEmail } from "@/lib/team-store";

export default async function RescueTeamDashboardPage() {
  const session = await requireRole("rescue-team");
  const [missionStats, teamStatus] = await Promise.all([
    getMissionStats(session.email ?? undefined),
    session.email ? getRescueTeamStatusByEmail(session.email) : null,
  ]);

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
              value: (missionStats.assigned + missionStats.inProgress).toString(),
              helper: "Assigned + in progress",
              icon: FiTruck,
            },
            {
              label: "Completed",
              value: missionStats.completed.toString(),
              helper: "Resolved by your team",
              icon: FiCheckCircle,
            },
            {
              label: "Current Status",
              value: teamStatus?.status ? teamStatus.status.toUpperCase() : "UNKNOWN",
              helper: "Availability from check-in",
              icon: FiClock,
            },
            {
              label: "Active Queue",
              value: (teamStatus?.activeMissionCount ?? 0).toString(),
              helper: "Open missions assigned",
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
          Keep check-in status current and move assignments through In Progress to Completed.
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
