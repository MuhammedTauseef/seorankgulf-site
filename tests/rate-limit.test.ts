import { describe, it, expect } from "vitest";
import { rateLimit, clientIp, userKey } from "@/lib/rate-limit";

function mockReq(headers: Record<string, string>): Request {
  return {
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  } as unknown as Request;
}

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `t1-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const key = `t2-${Date.now()}-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("resets after window expires", () => {
    const key = `t3-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 1, 1)).toBe(true);
    // wait for window to pass
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 1)).toBe(true);
        resolve();
      }, 5);
    });
  });

  it("isolates different keys", () => {
    const a = `a-${Date.now()}-${Math.random()}`;
    const b = `b-${Date.now()}-${Math.random()}`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip over x-forwarded-for", () => {
    const req = mockReq({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("rejects malformed IPs", () => {
    const req = mockReq({ "x-forwarded-for": "not-an-ip!!!" });
    expect(clientIp(req)).toBe("invalid-ip");
  });

  it("returns unknown with no headers", () => {
    expect(clientIp(mockReq({}))).toBe("unknown");
  });

  it("accepts valid IPv6", () => {
    const req = mockReq({ "x-real-ip": "2001:db8::1" });
    expect(clientIp(req)).toBe("2001:db8::1");
  });
});

describe("userKey", () => {
  it("formats correctly", () => {
    expect(userKey("chat", "abc123")).toBe("chat:user:abc123");
  });

  it("limits per user independently", () => {
    const k = userKey("test", `u-${Date.now()}-${Math.random()}`);
    expect(rateLimit(k, 1, 60_000)).toBe(true);
    expect(rateLimit(k, 1, 60_000)).toBe(false);
  });
});
