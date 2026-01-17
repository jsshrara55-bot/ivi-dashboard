import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
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
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
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

describe("medications router", () => {
  it("allows public access to list medications", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public access allowed
    const result = await caller.medications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to get medication by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public access allowed
    const result = await caller.medications.getById({ id: 1 });
    // Result may be undefined if no data exists, but should not throw
    expect(result === undefined || typeof result === 'object').toBe(true);
  });

  it("prevents non-admin from creating medications", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.medications.create({
        code: "test",
        nameEn: "Test Medication",
        nameAr: "دواء اختباري",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("allows admin to seed initial data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw for admin
    const result = await caller.medications.seed();
    expect(result).toEqual({ success: true });
  });
});

describe("requirements router", () => {
  it("allows public access to list requirements by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Should not throw - public access allowed
    const result = await caller.requirements.listByCategory({ categoryId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("prevents non-admin from creating requirements", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.requirements.create({
        categoryId: 1,
        code: "test",
        labelEn: "Test Requirement",
        labelAr: "متطلب اختباري",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("preAuth router", () => {
  it("requires authentication to create request", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.preAuth.create({
        categoryId: 1,
        checklistItems: [],
      })
    ).rejects.toThrow();
  });

  it("allows authenticated user to create request", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    // This will attempt to create a request - may fail due to DB constraints
    // but should not fail due to auth
    try {
      const result = await caller.preAuth.create({
        categoryId: 1,
        checklistItems: [],
      });
      expect(result).toHaveProperty('id');
    } catch (error: any) {
      // If it fails, it should not be due to auth
      expect(error.message).not.toContain('login');
    }
  });

  it("prevents non-admin from listing all requests", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.preAuth.listAll()).rejects.toThrow("Admin access required");
  });

  it("allows admin to list all requests", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preAuth.listAll();
    expect(Array.isArray(result)).toBe(true);
  });
});
