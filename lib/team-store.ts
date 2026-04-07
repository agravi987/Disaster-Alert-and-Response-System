import "server-only";
import { Collection } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getDemoUsers } from "@/lib/user-store";
import { RescueTeamAvailability, RescueTeamStatus } from "@/types/team";

interface TeamStatusDocument {
  email: string;
  name: string;
  status: RescueTeamAvailability;
  lastUpdated: Date;
}

interface MissionCountDocument {
  _id: string;
  count: number;
}

const ACTIVE_MISSION_STATUSES = ["Assigned", "In Progress"];

async function getTeamStatusCollection(): Promise<Collection<TeamStatusDocument>> {
  const database = await getDatabase();
  return database.collection<TeamStatusDocument>("rescue_team_status");
}

async function getMissionCollectionForCounts() {
  const database = await getDatabase();
  return database.collection("missions");
}

async function getActiveMissionCountMap(): Promise<Map<string, number>> {
  const missionsCollection = await getMissionCollectionForCounts();
  const rows = (await missionsCollection
    .aggregate([
      { $match: { status: { $in: ACTIVE_MISSION_STATUSES } } },
      { $group: { _id: "$assignedTeamEmail", count: { $sum: 1 } } },
    ])
    .toArray()) as MissionCountDocument[];

  return new Map(rows.map((row) => [row._id, row.count]));
}

function mapTeamStatusDocumentToStatus(
  document: TeamStatusDocument,
  activeMissionCount: number,
): RescueTeamStatus {
  const computedStatus =
    document.status === "offline"
      ? "offline"
      : activeMissionCount > 0
        ? "busy"
        : document.status;

  return {
    email: document.email,
    name: document.name,
    status: computedStatus,
    lastUpdated: document.lastUpdated.toISOString(),
    activeMissionCount,
  };
}

export async function ensureRescueTeamsSeeded(): Promise<void> {
  const teamsCollection = await getTeamStatusCollection();
  const accounts = await getDemoUsers();
  const rescueTeams = accounts.filter((account) => account.role === "rescue-team");
  const now = new Date();

  for (const team of rescueTeams) {
    await teamsCollection.updateOne(
      { email: team.email },
      {
        $set: {
          name: team.name,
          lastUpdated: now,
        },
        $setOnInsert: {
          status: "available",
        },
      },
      { upsert: true },
    );
  }
}

export async function getRescueTeamStatuses(): Promise<RescueTeamStatus[]> {
  await ensureRescueTeamsSeeded();
  const [teamsCollection, activeMissionCounts] = await Promise.all([
    getTeamStatusCollection(),
    getActiveMissionCountMap(),
  ]);

  const teams = await teamsCollection.find({}).sort({ name: 1 }).toArray();
  return teams.map((team) =>
    mapTeamStatusDocumentToStatus(team, activeMissionCounts.get(team.email) ?? 0),
  );
}

export async function getRescueTeamStatusByEmail(
  email: string,
): Promise<RescueTeamStatus | null> {
  const teams = await getRescueTeamStatuses();
  return teams.find((team) => team.email === email) ?? null;
}

export async function updateRescueTeamStatus(
  email: string,
  status: RescueTeamAvailability,
): Promise<RescueTeamStatus | null> {
  await ensureRescueTeamsSeeded();

  if (status === "available") {
    const activeMissionCounts = await getActiveMissionCountMap();
    if ((activeMissionCounts.get(email) ?? 0) > 0) {
      throw new Error("TEAM_HAS_ACTIVE_MISSIONS");
    }
  }

  const teamsCollection = await getTeamStatusCollection();
  const result = await teamsCollection.findOneAndUpdate(
    { email },
    { $set: { status, lastUpdated: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) return null;

  const activeMissionCounts = await getActiveMissionCountMap();
  return mapTeamStatusDocumentToStatus(result, activeMissionCounts.get(result.email) ?? 0);
}

export async function markRescueTeamBusy(email: string): Promise<void> {
  const teamsCollection = await getTeamStatusCollection();
  await teamsCollection.updateOne(
    { email },
    { $set: { status: "busy", lastUpdated: new Date() } },
  );
}

export async function syncRescueTeamAvailability(email: string): Promise<void> {
  const teamsCollection = await getTeamStatusCollection();
  const activeMissionCounts = await getActiveMissionCountMap();
  const activeCount = activeMissionCounts.get(email) ?? 0;
  const nextStatus: RescueTeamAvailability = activeCount > 0 ? "busy" : "available";

  await teamsCollection.updateOne(
    { email, status: { $ne: "offline" } },
    { $set: { status: nextStatus, lastUpdated: new Date() } },
  );
}
