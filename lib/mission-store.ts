import "server-only";
import { Collection, ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import {
  getRescueTeamStatusByEmail,
  markRescueTeamBusy,
  syncRescueTeamAvailability,
} from "@/lib/team-store";
import { Mission, MissionStatus } from "@/types/mission";

interface MissionDocument {
  _id?: ObjectId;
  title: string;
  description: string;
  location: string;
  sourceAlertId?: string;
  assignedTeamEmail: string;
  assignedTeamName: string;
  assignedBy: string;
  status: MissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMissionPayload {
  title: string;
  description: string;
  location: string;
  sourceAlertId?: string;
  assignedTeamEmail: string;
  assignedBy: string;
}

export interface MissionStats {
  assigned: number;
  inProgress: number;
  completed: number;
  total: number;
}

async function getMissionCollection(): Promise<Collection<MissionDocument>> {
  const database = await getDatabase();
  return database.collection<MissionDocument>("missions");
}

function mapMissionDocumentToMission(document: MissionDocument): Mission {
  if (!document._id) {
    throw new Error("Invalid mission document: missing _id.");
  }

  return {
    id: document._id.toHexString(),
    title: document.title,
    description: document.description,
    location: document.location,
    sourceAlertId: document.sourceAlertId,
    assignedTeamEmail: document.assignedTeamEmail,
    assignedTeamName: document.assignedTeamName,
    assignedBy: document.assignedBy,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function getMissions(options?: {
  assignedTeamEmail?: string;
}): Promise<Mission[]> {
  const missionsCollection = await getMissionCollection();
  const query = options?.assignedTeamEmail
    ? { assignedTeamEmail: options.assignedTeamEmail }
    : {};
  const missions = await missionsCollection.find(query).sort({ createdAt: -1 }).toArray();
  return missions.map(mapMissionDocumentToMission);
}

export async function getMissionById(id: string): Promise<Mission | null> {
  if (!ObjectId.isValid(id)) return null;
  const missionsCollection = await getMissionCollection();
  const mission = await missionsCollection.findOne({ _id: new ObjectId(id) });
  return mission ? mapMissionDocumentToMission(mission) : null;
}

export async function createMissionAssignment(
  payload: CreateMissionPayload,
): Promise<Mission> {
  const teamStatus = await getRescueTeamStatusByEmail(payload.assignedTeamEmail);
  if (!teamStatus) {
    throw new Error("TEAM_NOT_FOUND");
  }
  if (teamStatus.status !== "available") {
    throw new Error("TEAM_NOT_AVAILABLE");
  }

  const now = new Date();
  const missionDocument: MissionDocument = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    location: payload.location.trim(),
    sourceAlertId: payload.sourceAlertId?.trim() || undefined,
    assignedTeamEmail: teamStatus.email,
    assignedTeamName: teamStatus.name,
    assignedBy: payload.assignedBy.trim(),
    status: "Assigned",
    createdAt: now,
    updatedAt: now,
  };

  const missionsCollection = await getMissionCollection();
  const insertResult = await missionsCollection.insertOne(missionDocument);
  const createdMission = await missionsCollection.findOne({
    _id: insertResult.insertedId,
  });

  if (!createdMission) {
    throw new Error("CREATE_FAILED");
  }

  await markRescueTeamBusy(teamStatus.email);
  return mapMissionDocumentToMission(createdMission);
}

export async function updateMissionStatus(
  id: string,
  status: MissionStatus,
): Promise<Mission | null> {
  if (!ObjectId.isValid(id)) return null;

  const missionsCollection = await getMissionCollection();
  const updatedMission = await missionsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updatedMission) return null;

  if (status === "Completed") {
    await syncRescueTeamAvailability(updatedMission.assignedTeamEmail);
  } else {
    await markRescueTeamBusy(updatedMission.assignedTeamEmail);
  }

  return mapMissionDocumentToMission(updatedMission);
}

export async function getMissionStats(
  assignedTeamEmail?: string,
): Promise<MissionStats> {
  const missionsCollection = await getMissionCollection();
  const baseQuery = assignedTeamEmail ? { assignedTeamEmail } : {};
  const [assigned, inProgress, completed, total] = await Promise.all([
    missionsCollection.countDocuments({ ...baseQuery, status: "Assigned" }),
    missionsCollection.countDocuments({ ...baseQuery, status: "In Progress" }),
    missionsCollection.countDocuments({ ...baseQuery, status: "Completed" }),
    missionsCollection.countDocuments(baseQuery),
  ]);

  return { assigned, inProgress, completed, total };
}
