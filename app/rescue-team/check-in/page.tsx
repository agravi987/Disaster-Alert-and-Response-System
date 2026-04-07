import { FiCheckCircle, FiNavigation, FiRadio } from "react-icons/fi";
import RoleShell from "@/components/role-shell";
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
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Check-In Status
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiNavigation className="text-teal-600 dark:text-teal-300" />
              GPS
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Live position synced
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiRadio className="text-teal-600 dark:text-teal-300" />
              Radio
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Channel 4 connected
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <FiCheckCircle className="text-teal-600 dark:text-teal-300" />
              Readiness
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Team marked available
            </p>
          </article>
        </div>
      </section>
    </RoleShell>
  );
}
