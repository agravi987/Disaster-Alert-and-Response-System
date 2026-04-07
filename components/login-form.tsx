"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail } from "react-icons/fi";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setErrorMessage(responseData.error ?? "Login failed.");
        return;
      }

      router.push(responseData.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unexpected error while logging in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative">
          <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            placeholder="admin@rescue.local"
            data-testid="login-email"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400"
            placeholder="Enter password"
            data-testid="login-password"
            required
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600 dark:text-red-400" data-testid="login-error">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-600"
        data-testid="login-submit"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        New here?{" "}
        <Link href="/signup" className="font-medium text-teal-600 hover:underline dark:text-teal-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}
