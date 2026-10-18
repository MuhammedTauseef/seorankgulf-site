import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { emails, sendEmail } from "@/lib/emails";

describe("email dev-mode (no API key)", () => {
  const origKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (origKey) process.env.RESEND_API_KEY = origKey;
    else delete process.env.RESEND_API_KEY;
  });

  it("welcome template renders and reports dev-mode", async () => {
    const r = await emails.welcome("t@e.com", "Ahmed", "Salon");
    expect(r.status).toBe("dev-mode");
    expect(r.status).not.toBe("sent");
  });

  it("agentReady template renders and reports dev-mode", async () => {
    const r = await emails.agentReady("t@e.com", "Salon");
    expect(r.status).toBe("dev-mode");
  });

  it("paymentReceipt template renders and reports dev-mode", async () => {
    const r = await emails.paymentReceipt("t@e.com", "$125", "Deposit");
    expect(r.status).toBe("dev-mode");
  });

  it("monthlyReport template renders and reports dev-mode", async () => {
    const r = await emails.monthlyReport("t@e.com", "Salon", { chats: 1, leads: 2, bookings: 3 });
    expect(r.status).toBe("dev-mode");
  });

  it("demoFollowup template renders and reports dev-mode", async () => {
    const r = await emails.demoFollowup("t@e.com", "Ahmed");
    expect(r.status).toBe("dev-mode");
  });

  it("bookingConfirmed template renders and reports dev-mode", async () => {
    const r = await emails.bookingConfirmed("t@e.com", "Ahmed", "2026-10-15", "14:00", "Salon");
    expect(r.status).toBe("dev-mode");
  });

  it("never falsely claims sent", async () => {
    const results = await Promise.all([
      emails.welcome("t@e.com", "A", "B"),
      emails.agentReady("t@e.com", "B"),
    ]);
    expect(results.every((r) => r.status !== "sent")).toBe(true);
  });

  it("includes explanatory detail", async () => {
    const r = await sendEmail({ to: "t@e.com", subject: "x", html: "<p>hi</p>" });
    expect(r.status).toBe("dev-mode");
    expect(r.detail).toBeTruthy();
  });
});
