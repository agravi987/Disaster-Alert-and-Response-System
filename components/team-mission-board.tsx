"use client";

import { useEffect, useState } from "react";
import { FiClock, FiMapPin, FiRadio } from "react-icons/fi";
import { Mission, MissionStatus } from "@/types/mission";

function getMissionBadgeClass(status: MissionStatus): string {
  switch (status) {
    case "Assigned":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    case "In Progress":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "Completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
  }
}

export default function TeamMissionBoard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingMissionId, setUpdatingMissionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadMissions() {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/missions", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to fetch missions.");
      }

      const payload = (await response.json()) as { missions: Mission[] };
      setMissions(payload.missions ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch missions.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string, status: MissionStatus) {
    setUpdatingMissionId(id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update mission.");
      }

      await loadMissions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update mission.";
      setErrorMessage(message);
    } finally {
      setUpdatingMissionId(null);
    }
  }

  useEffect(() => {
    void loadMissions();
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mission List</h2>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {isLoading ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading missions...</p>
        ) : missions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No missions assigned right now.
          </p>
        ) : (
          missions.map((mission) => {
            const isUpdating = updatingMissionId === mission.id;

            return (
              <article
                key={mission.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {mission.title}
                  </h3>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMissionBadgeClass(
                      mission.status,
                    )}`}
                  >
                    {mission.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {mission.description}
                </p>

                <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-3">
                  <p className="inline-flex items-center gap-2">
                    <FiMapPin className="text-teal-600 dark:text-teal-300" />
                    {mission.location}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <FiClock className="text-teal-600 dark:text-teal-300" />
                    Updated {new Date(mission.updatedAt).toLocaleTimeString()}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <FiRadio className="text-teal-600 dark:text-teal-300" />
                    Assigned by {mission.assignedBy}
                  </p>
                </div>

                {mission.status === "Assigned" ? (
                  <button
                    type="button"
                    onClick={() => updateStatus(mission.id, "In Progress")}
                    disabled={isUpdating}
                    className="mt-3 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {isUpdating ? "Updating..." : "Start Mission"}
                  </button>
                ) : null}

                {mission.status === "In Progress" ? (
                  <button
                    type="button"
                    onClick={() => updateStatus(mission.id, "Completed")}
                    disabled={isUpdating}
                    className="mt-3 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {isUpdating ? "Updating..." : "Mark Completed"}
                  </button>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
