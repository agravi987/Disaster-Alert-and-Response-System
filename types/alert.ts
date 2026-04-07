export type AlertStatus = "Active" | "Resolved";

export interface Alert {
  id: string;
  title: string;
  description: string;
  location: string;
  status: AlertStatus;
  createdAt: string;
  createdBy?: string; // email of the citizen who reported
}

export interface CreateAlertPayload {
  title: string;
  description: string;
  location: string;
  createdBy?: string; // email of citizen reporter
}

export interface UpdateAlertPayload {
  title?: string;
  description?: string;
  location?: string;
}
