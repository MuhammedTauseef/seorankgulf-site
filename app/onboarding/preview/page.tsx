"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Msg {
  role: "user" | "ai";
  text: string;
}

/** /onboarding/preview — client tests their freshly generated AI agent. */
export default function PreviewPage() {
  const [agentName, setAgentName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/onboarding/preview")
      .then((r) => r.json())
      .then((d) => {
        if (d.agent_config) {
          setAgentName(d.agent_config.business_name || "Your business");
          const g = d.agent_config.greeting || "Hi! How can I help?";
          setGreeting(g);
          setMessages([{ role: "ai", text: g }]);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply || "Sorry, I didn't catch that. Could you say it differently?" }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Hmm, something went wrong. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="block">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Your AI Agent</span>
          <h1 className="display" style={{ fontSize: "2.2rem", marginBottom: 8 }}>
            {ready ? `Meet your agent for ${agentName || "your business"}` : "Loading your agent..."}
          </h1>
          <p style={{ color: "#4b5563", marginBottom: 24 }}>
            This is a live preview — chat with it like a customer would. If it looks good, continue to payment.
          </p>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "white" }}>
            <div style={{ background: "#1e3a5f", color: "white", padding: "14px 20px", fontWeight: 700 }}>
              💬 {agentName || "Preview"} — AI Assistant
            </div>
            <div style={{ height: 380, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#f59e0b" : "#f3f4f6",
                  color: m.role === "user" ? "#111827" : "#1f2937",
                  padding: "10px 16px", borderRadius: 16, maxWidth: "80%",
                }}>
                  {m.text}
                </div>
              ))}
              {loading && <div style={{ color: "#9ca3af", fontSize: ".9rem" }}>typing...</div>}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", borderTop: "1px solid #e5e7eb" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask something a customer would ask..."
                style={{ flex: 1, border: "none", padding: "14px 20px", fontSize: "1rem", outline: "none" }}
              />
              <button onClick={send} disabled={loading} style={{ border: "none", background: "#f59e0b", padding: "0 28px", fontWeight: 700, cursor: "pointer" }}>
                Send
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/onboarding" className="btn" style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #d1d5db", textDecoration: "none", color: "#374151", fontWeight: 600 }}>
              ← Edit details
            </Link>
            <Link href="/checkout" className="btn btn-gold" style={{ padding: "12px 32px", borderRadius: 10, background: "#f59e0b", textDecoration: "none", color: "#111827", fontWeight: 700 }}>
              Looks good — continue to payment →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
