"use client";

import { useState } from "react";

/**
 * Password input with a show/hide toggle.
 * Drop-in replacement for the plain password <input> on auth pages.
 */
export default function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
  required = true,
}: {
  id: string;
  label: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={72}
          style={{ paddingRight: 64, width: "100%" }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: 0,
            cursor: "pointer",
            fontSize: ".82rem",
            fontWeight: 700,
            color: "#8a94a6",
            padding: "6px 4px",
          }}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
