"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { DEMO_GROUPS, demosByGroup, type DemoPersona } from "@/lib/demos";
import { createClient } from "@/lib/supabase/client";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "What services do you provide?",
  "How much does it cost?",
  "How does the free demo work?",
  "Do you work with my kind of business?",
];

function personaPayload(d: DemoPersona | null) {
  if (!d) return undefined;
  return { name: d.name, business: d.business, blurb: d.blurb };
}

/**
 * Reusable live-demo playground: business picker + chat.
 * Pass initialDemo to pre-select a business (used by /demo/[slug]),
 * and showPicker={false} to hide the picker on dedicated demo pages.
 */
export default function DemoPlayground({
  initialDemo = null,
  showPicker = true,
}: {
  initialDemo?: DemoPersona | null;
  showPicker?: boolean;
}) {
  const [demo, setDemo] = useState<DemoPersona | null>(initialDemo);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: initialDemo
        ? initialDemo.welcome
        : "Hi, I'm ReplyPilot — pick a demo business below, or just ask me about getting an AI agent for your own business.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = checking
  const bodyRef = useRef<HTMLDivElement>(null);

  // Live demos require an account — marketing pages stay public,
  // but chatting with the AI needs a login (lead capture).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, busy]);

  function pick(d: DemoPersona | null) {
    if (busy) return;
    setDemo(d);
    setMsgs([
      {
        role: "assistant",
        text: d
          ? d.welcome
          : "Back to ReplyPilot mode — ask me about getting an AI agent for your business.",
      },
    ]);
    setInput("");
  }

  async function send(text: string) {
    const clean = text.trim().slice(0, 800);
    if (!clean || busy || !loggedIn) return;
    const next = [...msgs, { role: "user" as const, text: clean }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12),
          persona: personaPayload(demo),
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setMsgs([
        ...next,
        { role: "assistant", text: data.reply || "Sorry — please try again." },
      ]);
    } catch {
      setMsgs([
        ...next,
        { role: "assistant", text: "Network hiccup — please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function clear() {
    if (busy) return;
    setMsgs([
      {
        role: "assistant",
        text: demo
          ? demo.welcome
          : "Chat cleared — ask me anything about getting an AI agent for your business.",
      },
    ]);
  }

  return (
    <>
      {showPicker && (
        <div className="demo-picker">
          <div className="demo-picker-kicker">Choose a demo business</div>
          <div style={{ display: "grid", gap: 18 }}>
            {DEMO_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="demo-group-label">{g.heading}</div>
                <div className="demo-chips">
                  {demosByGroup(g.key).map((d) => {
                    const active = demo?.name === d.name;
                    return (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => pick(active ? null : d)}
                        aria-pressed={active}
                        className={`demo-chip${active ? " active" : ""}`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {demo && (
            <p className="demo-note">
              You&apos;re chatting with the AI assistant of{" "}
              <strong>{demo.name}</strong> ({demo.business}). Tap again to go
              back to ReplyPilot mode.
            </p>
          )}
        </div>
      )}

      <div className="chat-shell">
        {loggedIn === null ? (
          <div
            className="chat-body"
            style={{
              minHeight: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p className="demo-note">Loading demo…</p>
          </div>
        ) : (
          <>
            <div className="chat-head" style={{ borderRadius: 0 }}>
              <span className="ava">{demo ? demo.name.charAt(0) : "R"}</span>
              <div>
                <b>{demo ? `${demo.name} Assistant` : "ReplyPilot Assistant"}</b>
                <small>
                  <i /> Online — replies instantly
                </small>
              </div>
              <button onClick={clear} aria-label="Clear chat" title="Clear chat">
                ⟳
              </button>
            </div>
            <div
              className="chat-body"
              ref={bodyRef}
              style={{ minHeight: 380, maxHeight: 480 }}
            >
              {msgs.map((m, i) => (
                <div key={i} className={`cmsg ${m.role}`}>
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="ctyping" aria-label="Assistant is typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
              {!loggedIn && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "18px 16px",
                    borderRadius: 12,
                    border: "1px dashed rgba(201,162,39,.7)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
                  <p className="demo-note" style={{ margin: "0 0 14px" }}>
                    Log in to start chatting with the live AI demo.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href="/login"
                      className="btn btn-gold"
                      style={{ minHeight: 44, padding: "0 22px" }}
                    >
                      Log in
                    </a>
                    <a
                      href="/signup"
                      className="btn btn-ghost"
                      style={{ minHeight: 44, padding: "0 22px" }}
                    >
                      Create free account
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="cchips">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    loggedIn ? send(s) : (window.location.href = "/login")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            {loggedIn ? (
              <form className="chat-input" onSubmit={onSubmit}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  aria-label="Type your message"
                  maxLength={800}
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            ) : (
              <div className="chat-input" style={{ gap: 10 }}>
                <a
                  href="/login"
                  className="btn btn-gold"
                  style={{ flex: 1, minHeight: 50 }}
                >
                  Log in to chat
                </a>
                <a
                  href="/signup"
                  className="btn btn-ghost"
                  style={{ flex: 1, minHeight: 50 }}
                >
                  Sign up free
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
