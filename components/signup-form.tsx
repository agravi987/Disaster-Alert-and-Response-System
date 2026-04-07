"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { UserRole } from "@/lib/auth";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "admin", label: "Admin" },
  { value: "rescue-center", label: "Rescue Center" },
  { value: "rescue-team", label: "Rescue Team" },
];

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const responseData = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setErrorMessage(responseData.error ?? "Sign-up failed.");
        return;
      }

      router.push(responseData.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unexpected error while signing up.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="signup-name"
        >
          Name
        </label>
        <div className="relative">
          <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            placeholder="Your full name"
            data-testid="signup-name"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="signup-email"
        >
          Email
        </label>
        <div className="relative">
          <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            placeholder="you@example.com"
            data-testid="signup-email"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="signup-password"
        >
          Password
        </label>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            placeholder="Enter password"
            data-testid="signup-password"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="signup-role"
        >
          Role
        </label>
        <select
          id="signup-role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
          data-testid="signup-role"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600 dark:text-red-400" data-testid="signup-error">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-600"
        data-testid="signup-submit"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-600 hover:underline dark:text-teal-300">
          Sign in
        </Link>
      </p>
    </form>
  );
}
