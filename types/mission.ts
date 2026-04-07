export type MissionStatus = "Assigned" | "In Progress" | "Completed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  location: string;
  sourceAlertId?: string;
  assignedTeamEmail: string;
  assignedTeamName: string;
  assignedBy: string;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
}
