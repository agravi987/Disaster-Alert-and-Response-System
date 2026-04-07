import { FiClock, FiLayers, FiMapPin, FiTruck } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { getAlerts, getAlertStats } from "@/lib/alert-store";
import { requireRole } from "@/lib/auth-server";
import { getMissionStats } from "@/lib/mission-store";
import { getRescueTeamStatuses } from "@/lib/team-store";

export default async function RescueCenterDashboardPage() {
  const session = await requireRole("rescue-center");
  const [alertStats, alerts, teamStatuses, missionStats] = await Promise.all([
    getAlertStats(),
    getAlerts(),
    getRescueTeamStatuses(),
    getMissionStats(),
  ]);
  const teamsAvailable = teamStatuses.filter((team) => team.status === "available").length;
  const hotspot = alerts.find((alert) => alert.status === "Active")?.location ?? "No hotspot";

  return (
    <RoleShell
      roleLabel="Rescue Center"
      title="Dispatch Operations"
      subtitle="Coordinate incoming incidents and assign active field teams."
      email={session.email}
      navItems={getRoleNavItems("rescue-center")}
    >
      <div data-testid="dashboard-page">
        <SummaryCards
          cards={[
            {
              label: "Incoming Alerts",
              value: alertStats.active.toString(),
              helper: "Awaiting triage",
              icon: FiLayers,
            },
            {
              label: "Teams Available",
              value: teamsAvailable.toString(),
              helper: "Ready for dispatch",
              icon: FiTruck,
            },
            {
              label: "Open Missions",
              value: (missionStats.assigned + missionStats.inProgress).toString(),
              helper: "Assigned to field teams",
              icon: FiClock,
            },
            {
              label: "Hotspot",
              value: hotspot,
              helper: "Latest active alert location",
              icon: FiMapPin,
            },
          ]}
        />
      </div>

      <AlertDashboard
        canCreate
        canResolve
        canEdit
        userRole={session.role}
        userEmail={session.email}
        listTitle="Dispatch Queue"
        createTitle="Create Dispatch Alert"
      />
    </RoleShell>
  );
}
