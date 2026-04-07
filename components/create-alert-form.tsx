"use client";

import { FormEvent, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { CreateAlertPayload } from "@/types/alert";

interface CreateAlertFormProps {
  onCreateAlert: (payload: CreateAlertPayload) => Promise<void>;
  title?: string;
  onCancel?: () => void;
}

export default function CreateAlertForm({
  onCreateAlert,
  title = "Create New Alert",
  onCancel,
}: CreateAlertFormProps) {
  const [titleInput, setTitleInput] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const payload: CreateAlertPayload = {
      title: titleInput.trim(),
      description: description.trim(),
      location: location.trim(),
    };

    if (!payload.title || !payload.description || !payload.location) {
      setErrorMessage("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateAlert(payload);
      setTitleInput("");
      setDescription("");
      setLocation("");
    } catch {
      setErrorMessage("Failed to create alert. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-5">
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <FiAlertTriangle className="text-teal-600 dark:text-teal-300" />
        {title}
      </h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label
            htmlFor="alert-title"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Title
          </label>
          <input
            id="alert-title"
            type="text"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            placeholder="Flooding in Sector 4"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            data-testid="alert-title"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="alert-description"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>
          <textarea
            id="alert-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Roads are blocked due to rising water level."
            className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            data-testid="alert-description"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="alert-location"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Location
          </label>
          <input
            id="alert-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Sector 4, Riverside"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            data-testid="alert-location"
          />
        </div>

        {errorMessage ? (
          <p
            className="text-sm text-red-600 dark:text-red-400"
            data-testid="alert-form-error"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-600"
            data-testid="alert-submit"
          >
            {isSubmitting ? "Creating..." : "Create Alert"}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
