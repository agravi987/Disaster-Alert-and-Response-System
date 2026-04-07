import Link from "next/link";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import { FiShield } from "react-icons/fi";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";

interface RoleNavItem {
  href: string;
  label: string;
  icon: IconType;
}

interface RoleShellProps {
  roleLabel: string;
  title: string;
  subtitle: string;
  email: string | null;
  navItems: RoleNavItem[];
  children: ReactNode;
}

export default function RoleShell({
  roleLabel,
  title,
  subtitle,
  email,
  navItems,
  children,
}: RoleShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 transition-colors dark:bg-slate-950 md:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition-colors dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-2xl md:p-6">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              <FiShield className="text-sm" />
              {roleLabel}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            {email ? (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Signed in as {email}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <nav className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-200"
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="text-base" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <section className="grid gap-4">{children}</section>
      </div>
    </main>
  );
}
