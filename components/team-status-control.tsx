"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiNavigation, FiRadio } from "react-icons/fi";
import { RescueTeamAvailability, RescueTeamStatus } from "@/types/team";

function getBadgeClass(status: RescueTeamAvailability): string {
  switch (status) {
    case "available":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "busy":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "offline":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
  }
}

interface TeamStatusControlProps {
  email: string | null;
}

export default function TeamStatusControl({ email }: TeamStatusControlProps) {
  const [teams, setTeams] = useState<RescueTeamStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentTeam = useMemo(
    () => teams.find((team) => team.email === email) ?? null,
    [teams, email],
  );

  async function loadTeams() {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/rescue-teams", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load team status.");
      }

      const payload = (await response.json()) as { teams: RescueTeamStatus[] };
      setTeams(payload.teams ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load team status.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function setStatus(status: RescueTeamAvailability) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsUpdating(true);

    try {
      const response = await fetch("/api/rescue-teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update status.");
      }

      setSuccessMessage(`Status changed to ${status}.`);
      await loadTeams();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update status.";
      setErrorMessage(message);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void loadTeams();
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Check-In Status
      </h2>

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Loading status...
        </p>
      ) : currentTeam ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <FiNavigation className="text-teal-600 dark:text-teal-300" />
                GPS
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Live position synced
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <FiRadio className="text-teal-600 dark:text-teal-300" />
                Radio
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Channel 4 connected
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <FiCheckCircle className="text-teal-600 dark:text-teal-300" />
                Availability
              </p>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getBadgeClass(
                    currentTeam.status,
                  )}`}
                >
                  {currentTeam.status}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                Active missions: {currentTeam.activeMissionCount}
              </p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("available")}
              disabled={isUpdating}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Mark Available
            </button>
            <button
              type="button"
              onClick={() => setStatus("busy")}
              disabled={isUpdating}
              className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Mark Busy
            </button>
            <button
              type="button"
              onClick={() => setStatus("offline")}
              disabled={isUpdating}
              className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Mark Offline
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Team profile not found.
        </p>
      )}

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}
    </section>
  );
}
