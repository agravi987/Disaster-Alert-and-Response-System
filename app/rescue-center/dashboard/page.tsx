import { FiClock, FiLayers, FiMapPin, FiTruck } from "react-icons/fi";
import AlertDashboard from "@/components/alert-dashboard";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import SummaryCards from "@/components/summary-cards";
import { requireRole } from "@/lib/auth-server";

export default async function RescueCenterDashboardPage() {
  const session = await requireRole("rescue-center");

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
              value: "9",
              helper: "Awaiting triage",
              icon: FiLayers,
            },
            {
              label: "Teams Available",
              value: "5",
              helper: "Ready for dispatch",
              icon: FiTruck,
            },
            {
              label: "Dispatch Time",
              value: "12m",
              helper: "Current average",
              icon: FiClock,
            },
            {
              label: "Hotspot",
              value: "Sector 7",
              helper: "Highest current activity",
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
