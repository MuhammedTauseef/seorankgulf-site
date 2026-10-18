import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");
function src(p: string): string {
  return readFileSync(join(root, p), "utf-8");
}

describe("admin API authorization patterns", () => {
  const adminRoutes = [
    "app/api/admin/users/route.ts",
    "app/api/admin/faqs/route.ts",
    "app/api/admin/blog/route.ts",
    "app/api/admin/videos/route.ts",
    "app/api/admin/demos/route.ts",
    "app/api/admin/pages/route.ts",
    "app/api/admin/settings/route.ts",
  ];

  for (const route of adminRoutes) {
    it(`${route} requires admin`, () => {
      const code = src(route);
      expect(code.includes("requireAdmin") || code.includes("role") ).toBe(true);
      // Must reject non-admins with 403
      expect(code.includes("403")).toBe(true);
    });
  }

  it("users API blocks self role-change", () => {
    expect(src("app/api/admin/users/route.ts")).toContain("cannot change your own role");
  });

  it("users API protects last admin", () => {
    const code = src("app/api/admin/users/route.ts");
    expect(code).toContain("Cannot demote the last admin");
    expect(code).toContain("Cannot delete the last admin");
  });
});

describe("customer data isolation patterns", () => {
  it("conversations API filters by user_id", () => {
    expect(src("app/api/conversations/route.ts")).toContain('.eq("user_id", user.id)');
  });

  it("agent-config API scopes to own client", () => {
    const code = src("app/api/agent-config/route.ts");
    expect(code).toContain('.eq("user_id", user.id)');
  });

  it("profile API scopes updates to own id", () => {
    const code = src("app/api/profile/route.ts");
    expect(code).toContain('.eq("id", user.id)');
  });

  it("profile API never writes role", () => {
    const code = src("app/api/profile/route.ts");
    // The update call must only contain full_name
    expect(code).toContain(".update({ full_name })");
  });

  it("dashboard API scopes by user", () => {
    const code = src("app/api/dashboard/route.ts");
    expect(code).toContain("user.id");
  });
});

describe("webhook security patterns", () => {
  it("whop webhook verifies HMAC signature", () => {
    const code = src("app/api/webhooks/whop/route.ts");
    expect(code.toLowerCase()).toContain("hmac");
    expect(code).toContain("401");
  });

  it("webhook has replay protection", () => {
    const code = src("app/api/webhooks/whop/route.ts");
    // 5-minute timestamp window
    expect(code.includes("300") || code.toLowerCase().includes("replay")).toBe(true);
  });
});

describe("chat API safety patterns", () => {
  it("chat route has timeout", () => {
    const code = src("app/api/chat/route.ts");
    expect(code).toContain("AbortController");
    expect(code).toContain("30_000");
  });

  it("chat route requires authentication", () => {
    const code = src("app/api/chat/route.ts");
    expect(code).toContain("401");
  });

  it("chat route has user-based rate limiting", () => {
    const code = src("app/api/chat/route.ts");
    expect(code).toContain("userKey");
  });
});
