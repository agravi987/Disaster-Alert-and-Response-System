import { FiClock, FiMapPin, FiRadio } from "react-icons/fi";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

const missions = [
  {
    title: "Flood Evacuation Support",
    location: "Sector 7",
    status: "In Progress",
    update: "Rescue boats deployed.",
  },
  {
    title: "Medical Transfer",
    location: "North District",
    status: "Assigned",
    update: "Awaiting ambulance handoff.",
  },
];

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
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Mission List
        </h2>
        <div className="mt-4 grid gap-3">
          {missions.map((mission) => (
            <article
              key={mission.title}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {mission.title}
              </h3>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-3">
                <p className="inline-flex items-center gap-2">
                  <FiMapPin className="text-teal-600 dark:text-teal-300" />
                  {mission.location}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiClock className="text-teal-600 dark:text-teal-300" />
                  {mission.status}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiRadio className="text-teal-600 dark:text-teal-300" />
                  {mission.update}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </RoleShell>
  );
}
