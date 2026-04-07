import { FiClock, FiMapPin, FiTruck } from "react-icons/fi";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { requireRole } from "@/lib/auth-server";

const assignments = [
  {
    incident: "Flooding near Riverside School",
    team: "Team Alpha",
    eta: "11 min",
    location: "Sector 7",
  },
  {
    incident: "Building fire reported",
    team: "Team Bravo",
    eta: "7 min",
    location: "Old Market",
  },
  {
    incident: "Landslide blockage",
    team: "Team Delta",
    eta: "19 min",
    location: "Hill Road",
  },
];

export default async function RescueCenterAssignmentsPage() {
  const session = await requireRole("rescue-center");

  return (
    <RoleShell
      roleLabel="Rescue Center"
      title="Assignments"
      subtitle="Track dispatch assignments and estimated response windows."
      email={session.email}
      navItems={getRoleNavItems("rescue-center")}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Current Assignments
        </h2>
        <div className="mt-4 grid gap-3">
          {assignments.map((assignment) => (
            <article
              key={assignment.incident}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {assignment.incident}
              </h3>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-3">
                <p className="inline-flex items-center gap-2">
                  <FiTruck className="text-teal-600 dark:text-teal-300" />
                  {assignment.team}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiClock className="text-teal-600 dark:text-teal-300" />
                  ETA: {assignment.eta}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiMapPin className="text-teal-600 dark:text-teal-300" />
                  {assignment.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </RoleShell>
  );
}
