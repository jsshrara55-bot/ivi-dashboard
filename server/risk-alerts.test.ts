import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@example.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-user",
    email: "user@example.com",
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

describe("Risk Alerts API", () => {
  describe("ivi.riskAlerts.list", () => {
    it("returns risk alerts for authenticated users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.ivi.riskAlerts.list();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("ivi.riskAlerts.getUnsent", () => {
    it("returns unsent alerts for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.ivi.riskAlerts.getUnsent();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.ivi.riskAlerts.getUnsent()).rejects.toThrow();
    });
  });

  describe("ivi.riskAlerts.create", () => {
    it("allows admin to create risk alert", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.ivi.riskAlerts.create({
        contNo: "TEST-CONT-001",
        companyName: "Test Company",
        previousRisk: "Medium",
        newRisk: "High",
        previousScore: "45.5",
        newScore: "35.2",
      });
      
      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });

    it("rejects non-admin users from creating alerts", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.ivi.riskAlerts.create({
          contNo: "TEST-CONT-002",
          companyName: "Test Company 2",
          previousRisk: "Low",
          newRisk: "Medium",
        })
      ).rejects.toThrow();
    });
  });
});
