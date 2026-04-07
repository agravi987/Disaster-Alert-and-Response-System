import RoleShell from "@/components/role-shell";
import TeamStatusControl from "@/components/team-status-control";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

export default async function RescueTeamCheckInPage() {
  const session = await requireRole("rescue-team");

  return (
    <RoleShell
      roleLabel="Rescue Team"
      title="Field Check-In"
      subtitle="Share live location and mission readiness updates with dispatch."
      email={session.email}
      navItems={getRoleNavItems("rescue-team")}
    >
      <TeamStatusControl email={session.email} />
    </RoleShell>
  );
}
