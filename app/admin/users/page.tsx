import { FiHome, FiShield, FiTool, FiUsers } from "react-icons/fi";
import RoleShell from "@/components/role-shell";
import { getRoleNavItems } from "@/components/role-nav";
import { DEMO_ACCOUNTS, UserRole } from "@/lib/auth";
import { requireRole } from "@/lib/auth-server";
import { ROLE_RESPONSIBILITIES } from "@/lib/rbac";
import { getDemoUsers } from "@/lib/user-store";

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  admin: FiShield,
  citizen: FiUsers,
  "rescue-center": FiHome,
  "rescue-team": FiTool,
};

export default async function AdminUsersPage() {
  const session = await requireRole("admin");
  let users = DEMO_ACCOUNTS;

  try {
    users = await getDemoUsers();
  } catch {
    users = DEMO_ACCOUNTS;
  }

  return (
    <RoleShell
      roleLabel="Admin"
      title="Role & Access Governance"
      subtitle="Review operational accounts across admin, citizen, center, and team roles."
      email={session.email}
      navItems={getRoleNavItems("admin")}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Role Accounts
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {users.map((account) => {
            const Icon = roleIcons[account.role];
            return (
              <article
                key={account.email}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <Icon className="text-teal-600 dark:text-teal-300" />
                  {account.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {account.email}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
                  {account.role}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Responsibility Matrix
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(Object.keys(ROLE_RESPONSIBILITIES) as UserRole[]).map((role) => (
            <article
              key={role}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                {role}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {ROLE_RESPONSIBILITIES[role].mission}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {ROLE_RESPONSIBILITIES[role].responsibilities.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </RoleShell>
  );
}
