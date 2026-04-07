import { UserRole } from "@/lib/auth";
import { Alert } from "@/types/alert";

interface AlertPermissionSet {
  canRead: boolean;
  canCreate: boolean;
  canResolve: boolean;
  canEditAny: boolean;
  canEditOwn: boolean;
  canDeleteAny: boolean;
  canDeleteOwn: boolean;
}

export interface RoleResponsibility {
  mission: string;
  responsibilities: string[];
}

const ALERT_PERMISSIONS: Record<UserRole, AlertPermissionSet> = {
  admin: {
    canRead: true,
    canCreate: true,
    canResolve: true,
    canEditAny: true,
    canEditOwn: false,
    canDeleteAny: true,
    canDeleteOwn: false,
  },
  citizen: {
    canRead: true,
    canCreate: true,
    canResolve: false,
    canEditAny: false,
    canEditOwn: true,
    canDeleteAny: false,
    canDeleteOwn: true,
  },
  "rescue-center": {
    canRead: true,
    canCreate: true,
    canResolve: true,
    canEditAny: true,
    canEditOwn: false,
    canDeleteAny: false,
    canDeleteOwn: false,
  },
  "rescue-team": {
    canRead: true,
    canCreate: false,
    canResolve: true,
    canEditAny: false,
    canEditOwn: false,
    canDeleteAny: false,
    canDeleteOwn: false,
  },
};

export const ROLE_RESPONSIBILITIES: Record<UserRole, RoleResponsibility> = {
  admin: {
    mission: "Govern the platform and keep the full response network coordinated.",
    responsibilities: [
      "Manage users and role access policies.",
      "Monitor end-to-end response performance.",
      "Override and correct incident records when needed.",
    ],
  },
  citizen: {
    mission: "Report incidents early and keep report details accurate.",
    responsibilities: [
      "Create verified alerts from the ground.",
      "Update or remove personal reports if details were incorrect.",
      "Track response status for submitted incidents.",
    ],
  },
  "rescue-center": {
    mission: "Run dispatch operations and triage active incidents.",
    responsibilities: [
      "Validate incoming reports and prioritize urgent cases.",
      "Create and update operational alerts for dispatch.",
      "Mark incidents resolved after response confirmation.",
    ],
  },
  "rescue-team": {
    mission: "Execute field operations and close incidents safely.",
    responsibilities: [
      "Respond to assigned incidents in the field.",
      "Share readiness and check-in updates with command.",
      "Mark incidents resolved once ground execution is complete.",
    ],
  },
};

function isOwner(actorEmail: string | null, alert: Alert): boolean {
  return Boolean(actorEmail && alert.createdBy && actorEmail === alert.createdBy);
}

export function canReadAlerts(role: UserRole): boolean {
  return ALERT_PERMISSIONS[role].canRead;
}

export function canCreateAlerts(role: UserRole): boolean {
  return ALERT_PERMISSIONS[role].canCreate;
}

export function canResolveAlerts(role: UserRole): boolean {
  return ALERT_PERMISSIONS[role].canResolve;
}

export function canEditAlert(
  role: UserRole,
  alert: Alert,
  actorEmail: string | null,
): boolean {
  const permissions = ALERT_PERMISSIONS[role];
  return permissions.canEditAny || (permissions.canEditOwn && isOwner(actorEmail, alert));
}

export function canDeleteAlert(
  role: UserRole,
  alert: Alert,
  actorEmail: string | null,
): boolean {
  const permissions = ALERT_PERMISSIONS[role];
  return (
    permissions.canDeleteAny || (permissions.canDeleteOwn && isOwner(actorEmail, alert))
  );
}
