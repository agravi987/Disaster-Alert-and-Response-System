export type UserRole = "admin" | "citizen" | "rescue-center" | "rescue-team";

export interface DemoAccount {
  name: string;
  role: UserRole;
  email: string;
  password: string;
}

export const AUTH_COOKIE_NAME = "disaster_auth";
export const AUTH_COOKIE_VALUE = "authenticated";
export const AUTH_ROLE_COOKIE_NAME = "disaster_role";
export const AUTH_EMAIL_COOKIE_NAME = "disaster_email";

function getEnvValue(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function getEnvValueFromAliases(names: string[], fallback: string): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return fallback;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: getEnvValue("ADMIN_NAME", "Admin Control"),
    role: "admin",
    email: getEnvValue("ADMIN_EMAIL", "admin@rescue.local"),
    password: getEnvValue("ADMIN_PASSWORD", "Admin@123"),
  },
  {
    name: getEnvValueFromAliases(["CITIZEN_NAME", "USER_NAME"], "Citizen User"),
    role: "citizen",
    email: getEnvValueFromAliases(
      ["CITIZEN_EMAIL", "USER_EMAIL"],
      "citizen@rescue.local",
    ),
    password: getEnvValueFromAliases(
      ["CITIZEN_PASSWORD", "USER_PASSWORD"],
      "Citizen@123",
    ),
  },
  {
    name: getEnvValue("RESCUE_CENTER_NAME", "Rescue Center"),
    role: "rescue-center",
    email: getEnvValue("RESCUE_CENTER_EMAIL", "center@rescue.local"),
    password: getEnvValue("RESCUE_CENTER_PASSWORD", "Center@123"),
  },
  {
    name: getEnvValue("RESCUE_TEAM_NAME", "Rescue Team Alpha"),
    role: "rescue-team",
    email: getEnvValue("RESCUE_TEAM_EMAIL", "team@rescue.local"),
    password: getEnvValue("RESCUE_TEAM_PASSWORD", "Team@123"),
  },
];

export function isUserRole(value: string | undefined | null): value is UserRole {
  return (
    value === "admin" ||
    value === "citizen" ||
    value === "rescue-center" ||
    value === "rescue-team"
  );
}

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "citizen":
      return "/citizen/dashboard";
    case "rescue-center":
      return "/rescue-center/dashboard";
    case "rescue-team":
      return "/rescue-team/dashboard";
    default:
      return "/login";
  }
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/citizen")) return "citizen";
  if (pathname.startsWith("/rescue-center")) return "rescue-center";
  if (pathname.startsWith("/rescue-team")) return "rescue-team";
  return null;
}

export function getAccountByCredentials(
  email: string,
  password: string,
): DemoAccount | null {
  return (
    DEMO_ACCOUNTS.find(
      (account) => account.email === email && account.password === password,
    ) ?? null
  );
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "citizen":
      return "Citizen";
    case "rescue-center":
      return "Rescue Center";
    case "rescue-team":
      return "Rescue Team";
  }
}
