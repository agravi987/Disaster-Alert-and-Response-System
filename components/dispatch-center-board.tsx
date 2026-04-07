"use client";

import { useEffect, useMemo, useState } from "react";
import { FiClock, FiMapPin, FiTruck, FiUsers } from "react-icons/fi";
import { Alert } from "@/types/alert";
import { Mission } from "@/types/mission";
import { RescueTeamStatus } from "@/types/team";

function getStatusBadgeClass(status: RescueTeamStatus["status"]): string {
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

function getMissionBadgeClass(status: Mission["status"]): string {
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

export default function DispatchCenterBoard() {
  const [teams, setTeams] = useState<RescueTeamStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [selectedTeamEmail, setSelectedTeamEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "Active"),
    [alerts],
  );
  const availableTeams = useMemo(
    () => teams.filter((team) => team.status === "available"),
    [teams],
  );
  const selectedAlert =
    activeAlerts.find((alert) => alert.id === selectedAlertId) ?? null;

  async function loadDispatchData() {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const [teamsResponse, alertsResponse, missionsResponse] = await Promise.all([
        fetch("/api/rescue-teams", { cache: "no-store" }),
        fetch("/api/alerts", { cache: "no-store" }),
        fetch("/api/missions", { cache: "no-store" }),
      ]);

      if (!teamsResponse.ok || !alertsResponse.ok || !missionsResponse.ok) {
        throw new Error("Unable to load dispatch data.");
      }

      const teamsPayload = (await teamsResponse.json()) as {
        teams: RescueTeamStatus[];
      };
      const alertsPayload = (await alertsResponse.json()) as { alerts: Alert[] };
      const missionsPayload = (await missionsResponse.json()) as { missions: Mission[] };

      setTeams(teamsPayload.teams ?? []);
      setAlerts(alertsPayload.alerts ?? []);
      setMissions(missionsPayload.missions ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load dispatch data.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssignMission() {
    if (!selectedAlert || !selectedTeamEmail) {
      setErrorMessage("Select an active alert and an available team.");
      return;
    }

    setIsAssigning(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedAlert.title,
          description: selectedAlert.description,
          location: selectedAlert.location,
          sourceAlertId: selectedAlert.id,
          assignedTeamEmail: selectedTeamEmail,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to assign mission.");
      }

      setSuccessMessage("Mission assigned successfully.");
      setSelectedTeamEmail("");
      await loadDispatchData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to assign mission.";
      setErrorMessage(message);
    } finally {
      setIsAssigning(false);
    }
  }

  useEffect(() => {
    void loadDispatchData();
  }, []);

  useEffect(() => {
    if (!selectedAlertId && activeAlerts.length > 0) {
      setSelectedAlertId(activeAlerts[0].id);
    } else if (
      selectedAlertId &&
      !activeAlerts.some((alert) => alert.id === selectedAlertId)
    ) {
      setSelectedAlertId(activeAlerts[0]?.id ?? "");
    }
  }, [activeAlerts, selectedAlertId]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <FiUsers className="text-teal-600 dark:text-teal-300" />
            Rescue Team Availability
          </h2>
          <div className="mt-4 grid gap-3" data-testid="team-status-list">
            {isLoading ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No rescue teams found.
              </p>
            ) : (
              teams.map((team) => (
                <article
                  key={team.email}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {team.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {team.email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
                        team.status,
                      )}`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                    Active missions: {team.activeMissionCount}
                  </p>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <FiTruck className="text-teal-600 dark:text-teal-300" />
            Assign Task
          </h2>

          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="assignment-alert"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Active Alert
              </label>
              <select
                id="assignment-alert"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedAlertId}
                onChange={(event) => setSelectedAlertId(event.target.value)}
                data-testid="assignment-alert-select"
              >
                {activeAlerts.map((alert) => (
                  <option key={alert.id} value={alert.id}>
                    {alert.title} - {alert.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="assignment-team"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Available Team
              </label>
              <select
                id="assignment-team"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedTeamEmail}
                onChange={(event) => setSelectedTeamEmail(event.target.value)}
                data-testid="assignment-team-select"
              >
                <option value="">Select team</option>
                {availableTeams.map((team) => (
                  <option key={team.email} value={team.email}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {successMessage}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleAssignMission}
              disabled={
                isAssigning ||
                availableTeams.length === 0 ||
                activeAlerts.length === 0 ||
                !selectedAlertId ||
                !selectedTeamEmail
              }
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              data-testid="assignment-submit"
            >
              {isAssigning ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Current Missions
        </h2>
        <div className="mt-4 grid gap-3">
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading missions...</p>
          ) : missions.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No missions assigned yet.
            </p>
          ) : (
            missions.map((mission) => (
              <article
                key={mission.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                data-testid="mission-item"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
                  <p className="inline-flex items-center gap-2">
                    <FiTruck className="text-teal-600 dark:text-teal-300" />
                    {mission.assignedTeamName}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <FiMapPin className="text-teal-600 dark:text-teal-300" />
                    {mission.location}
                  </p>
                  <p className="inline-flex items-center gap-2 md:col-span-2">
                    <FiClock className="text-teal-600 dark:text-teal-300" />
                    Updated: {new Date(mission.updatedAt).toLocaleString()}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
