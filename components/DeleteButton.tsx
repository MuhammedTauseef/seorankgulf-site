"use client";

import { useState } from "react";

/** Small delete button for the admin dashboard (leads + bookings). */
export default function DeleteButton({
  type,
  id,
  label,
}: {
  type: "lead" | "booking";
  id: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (busy) return;
    const ok = window.confirm(`Delete this ${type} from ${label}? This cannot be undone.`);
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (!res.ok) throw new Error("failed");
      window.location.reload();
    } catch {
      alert("Could not delete. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      aria-label={`Delete ${type}`}
      title={`Delete this ${type}`}
      style={{
        background: "transparent",
        border: "1px solid var(--border, #e2e2e2)",
        borderRadius: 8,
        padding: "4px 10px",
        fontSize: ".8rem",
        cursor: busy ? "wait" : "pointer",
        color: "#b3261e",
        whiteSpace: "nowrap",
      }}
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
