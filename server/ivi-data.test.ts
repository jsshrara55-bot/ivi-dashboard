import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("IVI Data API", () => {
  describe("ivi.summary", () => {
    it("returns IVI summary data", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.summary();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalCompanies");
      expect(result).toHaveProperty("avgIviScore");
    });
  });

  describe("ivi.scores.list", () => {
    it("returns IVI scores list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.scores.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("ivi.claims.stats", () => {
    it("returns claims statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.claims.stats();

      expect(result).toBeDefined();
      // Stats may be null if no data, or have these properties
      if (result) {
        expect(result).toHaveProperty("totalClaims");
        expect(result).toHaveProperty("byStatus");
      }
    });
  });

  describe("ivi.calls.stats", () => {
    it("returns call center statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.calls.stats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("avgSatisfaction");
    });
  });

  describe("ivi.insurancePreAuths.stats", () => {
    it("returns pre-authorization statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.insurancePreAuths.stats();

      expect(result).toBeDefined();
      // Stats may be null if no data, or have these properties
      if (result) {
        expect(result).toHaveProperty("total");
        expect(result).toHaveProperty("totalCost");
      }
    });
  });

  describe("ivi.providers.stats", () => {
    it("returns provider statistics", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ivi.providers.stats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("byNetwork");
      expect(result).toHaveProperty("byRegion");
    });
  });
});
