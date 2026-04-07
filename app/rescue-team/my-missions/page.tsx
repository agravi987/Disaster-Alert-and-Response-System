import RoleShell from "@/components/role-shell";
import TeamMissionBoard from "@/components/team-mission-board";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function RescueTeamMissionsPage() {
  const session = await requireRole("rescue-team");

  return (
    <RoleShell
      roleLabel="Rescue Team"
      title="My Missions"
      subtitle="Operational mission board for your current shift."
      email={session.email}
      navItems={getRoleNavItems("rescue-team")}
    >
      <TeamMissionBoard />
    </RoleShell>
  );
}
