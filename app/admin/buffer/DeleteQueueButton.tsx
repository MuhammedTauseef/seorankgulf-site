"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Delete button for one QUEUED buffer row. Confirms first, then calls
 * DELETE /api/admin/blog/queue — the API itself refuses any row whose
 * status is not 'queued', so this button is a convenience, not the guard.
 */
export default function DeleteQueueButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (busy) return;
    const ok = window.confirm(
      `Remove "${title}" from the buffer queue? This cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/blog/queue?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Delete failed.");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not delete. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      style={{
        color: "#b3261e",
        background: "none",
        border: "none",
        cursor: busy ? "wait" : "pointer",
        fontSize: ".9rem",
        padding: 0,
      }}
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
