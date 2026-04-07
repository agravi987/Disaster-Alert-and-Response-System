"use client";

import { useState, useEffect, FormEvent } from "react";
import { FiEdit2, FiTrash2, FiUserPlus, FiX } from "react-icons/fi";
import { DemoAccount, UserRole } from "@/lib/auth";

export default function UsersManager() {
  const [users, setUsers] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen" as UserRole,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingEmail(null);
    setFormData({ name: "", email: "", password: "", role: "citizen" });
    setIsFormOpen(true);
    setError("");
  }

  function openEditForm(user: DemoAccount) {
    setEditingEmail(user.email);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // don't show existing password
      role: user.role,
    });
    setIsFormOpen(true);
    setError("");
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingEmail
        ? `/api/users/${encodeURIComponent(editingEmail)}`
        : "/api/users";
      const method = editingEmail ? "PUT" : "POST";

      const payload = { ...formData };
      if (editingEmail && !payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save user");
      }

      await fetchUsers();
      closeForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(email: string) {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) return;

    try {
      const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          User Management
        </h2>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <FiUserPlus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {error && !isFormOpen && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {isFormOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingEmail ? "Edit User" : "Create New User"}
            </h3>
            <button
              onClick={closeForm}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  disabled={!!editingEmail} // don't allow changing email for now
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="citizen">Citizen</option>
                  <option value="rescue-center">Rescue Center</option>
                  <option value="rescue-team">Rescue Team</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password {editingEmail && "(leave blank to keep current)"}
                </label>
                <input
                  type="text"
                  required={!editingEmail}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {users.map((user) => (
            <li
              key={user.email}
              className="flex items-center justify-between p-4 transition hover:bg-slate-50 dark:hover:bg-slate-950/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                  {user.role}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(user)}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-600 dark:hover:bg-slate-800 dark:hover:text-teal-400 transition"
                    title="Edit user"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.email)}
                    className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
                    title="Delete user"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {users.length === 0 && (
            <li className="p-8 text-center text-sm text-slate-500">
              No users found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
