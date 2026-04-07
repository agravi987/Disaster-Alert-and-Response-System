export type RescueTeamAvailability = "available" | "busy" | "offline";

export interface RescueTeamStatus {
  email: string;
  name: string;
  status: RescueTeamAvailability;
  lastUpdated: string;
  activeMissionCount: number;
}
