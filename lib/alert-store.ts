import "server-only";
import { Collection, ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { Alert, CreateAlertPayload, UpdateAlertPayload } from "@/types/alert";

interface AlertDocument {
  _id?: ObjectId;
  title: string;
  description: string;
  location: string;
  status: "Active" | "Resolved";
  createdAt: Date;
  createdBy?: string; // email of citizen reporter
}

async function getAlertsCollection(): Promise<Collection<AlertDocument>> {
  const database = await getDatabase();
  return database.collection<AlertDocument>("alerts");
}

function mapAlertDocumentToAlert(document: AlertDocument): Alert {
  if (!document._id) {
    throw new Error("Invalid alert document: missing _id.");
  }

  return {
    id: document._id.toHexString(),
    title: document.title,
    description: document.description,
    location: document.location,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
    createdBy: document.createdBy,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  const alertsCollection = await getAlertsCollection();

  const alerts = await alertsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return alerts.map(mapAlertDocumentToAlert);
}

export async function getAlertById(id: string): Promise<Alert | null> {
  if (!ObjectId.isValid(id)) return null;

  const alertsCollection = await getAlertsCollection();
  const alert = await alertsCollection.findOne({ _id: new ObjectId(id) });
  return alert ? mapAlertDocumentToAlert(alert) : null;
}

export async function getAlertsByUser(email: string): Promise<Alert[]> {
  const alertsCollection = await getAlertsCollection();

  const alerts = await alertsCollection
    .find({ createdBy: email })
    .sort({ createdAt: -1 })
    .toArray();

  return alerts.map(mapAlertDocumentToAlert);
}

export interface AlertStats {
  total: number;
  active: number;
  resolved: number;
}

export async function getAlertStats(): Promise<AlertStats> {
  const alertsCollection = await getAlertsCollection();
  const [total, active, resolved] = await Promise.all([
    alertsCollection.countDocuments({}),
    alertsCollection.countDocuments({ status: "Active" }),
    alertsCollection.countDocuments({ status: "Resolved" }),
  ]);
  return { total, active, resolved };
}

export async function getUserAlertStats(email: string): Promise<AlertStats> {
  const alertsCollection = await getAlertsCollection();
  const [total, active, resolved] = await Promise.all([
    alertsCollection.countDocuments({ createdBy: email }),
    alertsCollection.countDocuments({ createdBy: email, status: "Active" }),
    alertsCollection.countDocuments({ createdBy: email, status: "Resolved" }),
  ]);
  return { total, active, resolved };
}

export async function createAlert(payload: CreateAlertPayload): Promise<Alert> {
  const alertsCollection = await getAlertsCollection();

  const insertResult = await alertsCollection.insertOne({
    title: payload.title,
    description: payload.description,
    location: payload.location,
    status: "Active",
    createdAt: new Date(),
    createdBy: payload.createdBy,
  });

  const createdAlert = await alertsCollection.findOne({
    _id: insertResult.insertedId,
  });

  if (!createdAlert) {
    throw new Error("Failed to create alert.");
  }

  return mapAlertDocumentToAlert(createdAlert);
}

export async function updateAlert(
  id: string,
  payload: UpdateAlertPayload,
): Promise<Alert | null> {
  if (!ObjectId.isValid(id)) return null;

  const alertsCollection = await getAlertsCollection();
  const objectId = new ObjectId(id);

  const $set: Partial<AlertDocument> = {};
  if (payload.title !== undefined) $set.title = payload.title;
  if (payload.description !== undefined) $set.description = payload.description;
  if (payload.location !== undefined) $set.location = payload.location;

  if (Object.keys($set).length === 0) return null;

  const updatedAlert = await alertsCollection.findOneAndUpdate(
    { _id: objectId },
    { $set },
    { returnDocument: "after" },
  );

  return updatedAlert ? mapAlertDocumentToAlert(updatedAlert) : null;
}

export async function markAlertAsResolved(id: string): Promise<Alert | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const alertsCollection = await getAlertsCollection();
  const objectId = new ObjectId(id);

  const updatedAlert = await alertsCollection.findOneAndUpdate(
    { _id: objectId },
    { $set: { status: "Resolved" } },
    { returnDocument: "after" },
  );

  return updatedAlert ? mapAlertDocumentToAlert(updatedAlert) : null;
}

export async function deleteAlert(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const alertsCollection = await getAlertsCollection();
  const objectId = new ObjectId(id);

  const result = await alertsCollection.deleteOne({ _id: objectId });
  return result.deletedCount === 1;
}
