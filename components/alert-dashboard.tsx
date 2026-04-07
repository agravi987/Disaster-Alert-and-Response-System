"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import AlertsList from "@/components/alerts-list";
import CreateAlertForm from "@/components/create-alert-form";
import { UserRole } from "@/lib/auth";
import { Alert, CreateAlertPayload, UpdateAlertPayload } from "@/types/alert";

interface AlertDashboardProps {
  canCreate?: boolean;
  canResolve?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  userEmail?: string | null;
  userRole?: UserRole | null;
  listTitle?: string;
  createTitle?: string;
  customAlerts?: Alert[]; // Provide external custom alerts instead of fetching all
  hideFeed?: boolean;
}

export default function AlertDashboard({
  canCreate = true,
  canResolve = true,
  canDelete = false,
  canEdit = false,
  userEmail,
  userRole,
  listTitle,
  createTitle,
  customAlerts,
  hideFeed = false,
}: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>(customAlerts ?? []);
  const [isLoading, setIsLoading] = useState(!customAlerts && !hideFeed);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (customAlerts) {
      setAlerts(customAlerts);
    }
  }, [customAlerts]);

  async function fetchAlerts() {
    if (customAlerts || hideFeed) return;
    
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/alerts", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts.");
      }

      const data = (await response.json()) as { alerts: Alert[] };
      setAlerts(data.alerts ?? []);
    } catch {
      setErrorMessage("Unable to load alerts right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateAlert(payload: CreateAlertPayload) {
    setErrorMessage("");

    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = (await response.json()) as { error?: string };
      throw new Error(errorResponse.error ?? "Failed to create alert.");
    }

    const data = (await response.json()) as { alert: Alert };
    // Only prepend if we're showing the general feed or if custom alerts aren't strictly replacing this handler's output for all things
    setAlerts((previousAlerts) => [data.alert, ...previousAlerts]);
    setShowCreateForm(false);
  }

  async function handleResolveAlert(id: string) {
    setErrorMessage("");
    setResolvingAlertId(id);

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorResponse = (await response.json()) as { error?: string };
        throw new Error(errorResponse.error ?? "Failed to update alert status.");
      }

      const data = (await response.json()) as { alert: Alert };
      setAlerts((previousAlerts) =>
        previousAlerts.map((alert) =>
          alert.id === data.alert.id ? data.alert : alert,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update alert.";
      setErrorMessage(message);
    } finally {
      setResolvingAlertId(null);
    }
  }

  async function handleDeleteAlert(id: string) {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    setErrorMessage("");
    setDeletingAlertId(id);

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorResponse = (await response.json()) as { error?: string };
        throw new Error(errorResponse.error ?? "Failed to delete alert.");
      }

      setAlerts((previousAlerts) => previousAlerts.filter((alert) => alert.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete alert.";
      setErrorMessage(message);
    } finally {
      setDeletingAlertId(null);
    }
  }

  async function handleUpdateAlert(id: string, payload: UpdateAlertPayload) {
    setErrorMessage("");
    setUpdatingAlertId(id);

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = (await response.json()) as { error?: string };
        throw new Error(errorResponse.error ?? "Failed to update alert.");
      }

      const data = (await response.json()) as { alert: Alert };
      setAlerts((previousAlerts) =>
        previousAlerts.map((alert) =>
          alert.id === data.alert.id ? data.alert : alert,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update alert.";
      setErrorMessage(message);
    } finally {
      setUpdatingAlertId(null);
    }
  }

  useEffect(() => {
    if (!customAlerts && !hideFeed) {
      void fetchAlerts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridClassName = useMemo(() => {
    if (!canCreate || !showCreateForm) return "grid gap-4";
    return "grid gap-4 lg:grid-cols-[1fr_1.35fr]";
  }, [canCreate, showCreateForm]);

  return (
    <section className={gridClassName}>
      {canCreate ? (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowCreateForm((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
            data-testid="toggle-alert-form"
          >
            {showCreateForm ? <FiX className="text-base" /> : <FiPlus className="text-base" />}
            {showCreateForm ? "Hide Alert Form" : "Add Alert"}
          </button>

          {showCreateForm ? (
            <CreateAlertForm
              onCreateAlert={handleCreateAlert}
              title={createTitle ?? "Create New Alert"}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Use <strong>Add Alert</strong> to open the form only when you need it.
            </p>
          )}
        </section>
      ) : null}

      {!hideFeed && (
        <div className="space-y-3">
          {errorMessage ? (
            <p className="rounded-md border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
          ) : null}

          {isLoading ? (
            <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Loading alerts...
            </p>
          ) : (
            <AlertsList
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onDeleteAlert={handleDeleteAlert}
              onUpdateAlert={handleUpdateAlert}
              resolvingAlertId={resolvingAlertId}
              deletingAlertId={deletingAlertId}
              updatingAlertId={updatingAlertId}
              canResolve={canResolve}
              canDelete={canDelete}
              canEdit={canEdit}
              userEmail={userEmail}
              userRole={userRole}
              title={listTitle}
            />
          )}
        </div>
      )}
    </section>
  );
}
