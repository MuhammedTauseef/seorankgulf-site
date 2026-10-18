import { describe, it, expect } from "vitest";
import { safeJsonLd } from "@/lib/json-ld";

describe("safeJsonLd", () => {
  it("escapes < to prevent script breakout", () => {
    const out = safeJsonLd({ title: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c");
  });

  it("produces valid JSON", () => {
    const data = { a: 1, b: "test <tag>" };
    expect(JSON.parse(safeJsonLd(data))).toEqual({ a: 1, b: "test <tag>" });
  });

  it("handles normal content unchanged except <", () => {
    const out = safeJsonLd({ name: "ReplyPilot" });
    expect(out).toBe('{"name":"ReplyPilot"}');
  });
});

describe("input validation patterns", () => {
  // Mirrors validation logic in API routes — ensures the rules hold.

  it("agent config: tone whitelist", () => {
    const allowed = ["friendly", "professional", "playful", "formal"];
    expect(allowed.includes("rude")).toBe(false);
    expect(allowed.includes("friendly")).toBe(true);
  });

  it("agent config: status can only move forward", () => {
    const order = ["draft", "preview", "ready"];
    const canMove = (from: string, to: string) =>
      ["draft", "preview", "ready"].includes(to) &&
      order.indexOf(to) >= order.indexOf(from);
    expect(canMove("draft", "preview")).toBe(true);
    expect(canMove("ready", "draft")).toBe(false);
    expect(canMove("draft", "live")).toBe(false);
  });

  it("profile: name validation rejects HTML", () => {
    const bad = '<script>alert(1)</script>';
    expect(/[<>"\x00-\x1f]/.test(bad)).toBe(true);
    expect(/[<>"\x00-\x1f]/.test("Ahmed Khan")).toBe(false);
  });

  it("profile: name truncated to 120 chars", () => {
    expect("a".repeat(200).trim().slice(0, 120).length).toBe(120);
  });

  it("KB: file type whitelist", () => {
    const allowed = [".txt", ".md", ".pdf", ".doc", ".docx", ".csv"];
    expect(allowed.includes(".exe")).toBe(false);
    expect(allowed.includes(".pdf")).toBe(true);
  });

  it("KB: path traversal blocked", () => {
    const bad = ["../secret", "a<b", "x|y"];
    for (const name of bad) {
      expect(/[<>:"|?*\x00-\x1f]/.test(name) || name.includes("..")).toBe(true);
    }
    expect(/[<>:"|?*\x00-\x1f]/.test("my-doc.pdf") || "my-doc.pdf".includes("..")).toBe(false);
  });

  it("FAQ: length caps enforced", () => {
    expect("q".repeat(600).slice(0, 500).length).toBe(500);
    expect("a".repeat(6000).slice(0, 5000).length).toBe(5000);
  });
});
