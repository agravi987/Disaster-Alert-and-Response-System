"use client";

import { useState } from "react";
import { FiCheckCircle, FiMapPin, FiEdit2, FiTrash2 } from "react-icons/fi";
import { UserRole } from "@/lib/auth";
import { canDeleteAlert, canEditAlert } from "@/lib/rbac";
import { Alert, UpdateAlertPayload } from "@/types/alert";

interface AlertsListProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => Promise<void>;
  onDeleteAlert?: (id: string) => Promise<void>;
  onUpdateAlert?: (id: string, payload: UpdateAlertPayload) => Promise<void>;
  resolvingAlertId: string | null;
  deletingAlertId?: string | null;
  updatingAlertId?: string | null;
  canResolve?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  userEmail?: string | null;
  userRole?: UserRole | null;
  title?: string;
}

export default function AlertsList({
  alerts,
  onResolveAlert,
  onDeleteAlert,
  onUpdateAlert,
  resolvingAlertId,
  deletingAlertId,
  updatingAlertId,
  canResolve = true,
  canDelete = false,
  canEdit = false,
  userEmail,
  userRole,
  title = "Live Alerts",
}: AlertsListProps) {
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const startEdit = (alert: Alert) => {
    setEditingAlertId(alert.id);
    setEditTitle(alert.title);
    setEditDescription(alert.description);
    setEditLocation(alert.location);
  };

  const cancelEdit = () => {
    setEditingAlertId(null);
  };

  const handleSave = async (id: string) => {
    if (onUpdateAlert) {
      await onUpdateAlert(id, {
        title: editTitle,
        description: editDescription,
        location: editLocation,
      });
      setEditingAlertId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-5">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-4 space-y-3" data-testid="alerts-list">
        {alerts.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No alerts yet. Create one to begin.
          </p>
        ) : null}

        {alerts.map((alert) => {
          const isResolved = alert.status === "Resolved";
          const isResolving = resolvingAlertId === alert.id;
          const isDeleting = deletingAlertId === alert.id;
          const isUpdating = updatingAlertId === alert.id;
          const isEditing = editingAlertId === alert.id;
          
          const showDelete =
            Boolean(onDeleteAlert) &&
            canDelete &&
            Boolean(
              userRole && canDeleteAlert(userRole, alert, userEmail ?? null),
            );
          const showEdit =
            Boolean(onUpdateAlert) &&
            canEdit &&
            Boolean(userRole && canEditAlert(userRole, alert, userEmail ?? null));

          if (isEditing) {
            return (
              <article
                key={alert.id}
                className="rounded-lg border border-teal-500 bg-slate-50 p-4 dark:border-teal-600 dark:bg-slate-950/70"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Title"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Description"
                    rows={3}
                  />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Location"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(alert.id)}
                      disabled={isUpdating}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      className="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article
              key={alert.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70 relative group"
              data-testid="alert-item"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {alert.description}
                  </p>
                  <p className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <FiMapPin className="text-sm text-teal-600 dark:text-teal-300" />
                    {alert.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      isResolved
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                    data-testid={`alert-status-${alert.id}`}
                  >
                    {alert.status}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    {showEdit && !isResolved && (
                       <button
                         onClick={() => startEdit(alert)}
                         className="text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
                         title="Edit Alert"
                       >
                         <FiEdit2 />
                       </button>
                    )}
                    {showDelete && (
                      <button
                        onClick={() => onDeleteAlert && onDeleteAlert(alert.id)}
                        disabled={isDeleting}
                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 disabled:opacity-50"
                        title="Delete Alert"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isResolved ? (
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <FiCheckCircle className="text-sm" />
                  Resolved
                </p>
              ) : canResolve ? (
                <button
                  type="button"
                  onClick={() => onResolveAlert(alert.id)}
                  disabled={isResolving}
                  className="mt-3 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                  data-testid={`resolve-button-${alert.id}`}
                >
                  {isResolving ? "Updating..." : "Mark as Resolved"}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
