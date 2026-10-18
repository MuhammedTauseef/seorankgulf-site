"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = ["What does it cost?", "How does it work?", "I want a free demo"];

/**
 * Floating AI agent widget. Answers AS ReplyPilot (see /api/chat),
 * powered by the Gemini free tier.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi! I'm ReplyPilot's AI assistant. Ask me about our services, pricing, or how the free demo works.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, open, busy]);

  async function send(text: string) {
    const clean = text.trim().slice(0, 800);
    if (!clean || busy) return;
    const next = [...msgs, { role: "user" as const, text: clean }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = (await res.json()) as { reply?: string };
      setMsgs([
        ...next,
        {
          role: "assistant",
          text: data.reply || "Sorry — please try again.",
        },
      ]);
    } catch {
      setMsgs([
        ...next,
        {
          role: "assistant",
          text: "Network hiccup — please try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function toggle() {
    setOpen((v) => {
      if (!v && !openedOnce.current) openedOnce.current = true;
      return !v;
    });
  }

  return (
    <>
      {open && (
        <div
          className="chat-panel"
          role="dialog"
          aria-label="Chat with ReplyPilot assistant"
        >
          <div className="chat-head">
            <span className="ava">R</span>
            <div>
              <b>ReplyPilot Assistant</b>
              <small>
                <i /> Online — replies instantly
              </small>
            </div>
            <button onClick={toggle} aria-label="Close chat">
              ×
            </button>
          </div>
          <div className="chat-body" ref={bodyRef}>
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
          </div>
          {msgs.length <= 1 && !busy && (
            <div className="cchips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <form className="chat-input" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              aria-label="Type your message"
              maxLength={800}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
      <button
        className="chat-fab"
        onClick={toggle}
        aria-label={open ? "Close chat" : "Chat with ReplyPilot assistant"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </>
  );
}
