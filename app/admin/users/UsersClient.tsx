"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  business_name: string;
  subscription_status: string;
  has_paid: boolean;
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
};

export default function UsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users.");
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(u: UserRow, role: "admin" | "client") {
    if (!confirm(`${role === "admin" ? "Promote" : "Demote"} ${u.email} ${role === "admin" ? "to admin" : "to client"}?`)) return;
    setBusy(u.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Role update failed.");
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Role update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteUser(u: UserRow) {
    if (!confirm(`Delete ${u.email}? This removes their account and all associated data. This cannot be undone.`)) return;
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users?user_id=${encodeURIComponent(u.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading users…</p>;
  if (error) return <p style={{ color: "#ef4444" }}>{error} <button onClick={load}>Retry</button></p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{users.length} registered users</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Business</th>
            <th>Paid</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id}>
                <td>{u.email}{isSelf ? " (you)" : ""}</td>
                <td>{u.full_name}</td>
                <td>
                  <span className={`badge ${u.role === "admin" ? "badge-gold" : ""}`}>{u.role}</span>
                </td>
                <td>{u.business_name}</td>
                <td>{u.has_paid ? "✅" : "—"}</td>
                <td>{new Date(u.created_at).toLocaleDateString("en-GB")}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {isSelf ? (
                    <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>—</span>
                  ) : (
                    <>
                      {u.role === "admin" ? (
                        <button
                          className="btn-small"
                          disabled={busy === u.id}
                          onClick={() => setRole(u, "client")}
                        >
                          Demote
                        </button>
                      ) : (
                        <button
                          className="btn-small"
                          disabled={busy === u.id}
                          onClick={() => setRole(u, "admin")}
                        >
                          Make admin
                        </button>
                      )}
                      {" "}
                      <button
                        className="btn-small btn-danger"
                        disabled={busy === u.id}
                        onClick={() => deleteUser(u)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
