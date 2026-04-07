import { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiClipboard,
  FiHome,
  FiLayers,
  FiList,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { UserRole } from "@/lib/auth";

export interface RoleNavItem {
  href: string;
  label: string;
  icon: IconType;
}

export function getRoleNavItems(role: UserRole): RoleNavItem[] {
  switch (role) {
    case "admin":
      return [
        { href: "/admin/dashboard", label: "Dashboard", icon: FiHome },
        { href: "/admin/users", label: "Users", icon: FiUsers },
        { href: "/admin/all-alerts", label: "All Alerts", icon: FiLayers },
      ];
    case "citizen":
      return [
        { href: "/citizen/dashboard", label: "Dashboard", icon: FiHome },
        { href: "/citizen/report-alert", label: "Report Alert", icon: FiAlertCircle },
        { href: "/citizen/my-alerts", label: "My Alerts", icon: FiList },
      ];
    case "rescue-center":
      return [
        { href: "/rescue-center/dashboard", label: "Dashboard", icon: FiHome },
        { href: "/rescue-center/incoming-alerts", label: "Incoming", icon: FiLayers },
        { href: "/rescue-center/assignments", label: "Assignments", icon: FiClipboard },
      ];
    case "rescue-team":
      return [
        { href: "/rescue-team/dashboard", label: "Dashboard", icon: FiHome },
        { href: "/rescue-team/my-missions", label: "Missions", icon: FiTruck },
        { href: "/rescue-team/check-in", label: "Check-In", icon: FiUserCheck },
      ];
  }
}
