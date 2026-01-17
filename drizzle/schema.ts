import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Medication Categories - فئات الأدوية
 * Stores medication types that require pre-authorization
 */
export const medicationCategories = mysqlTable("medication_categories", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicationCategory = typeof medicationCategories.$inferSelect;
export type InsertMedicationCategory = typeof medicationCategories.$inferInsert;

/**
 * Requirements - متطلبات الأهلية
 * Stores eligibility requirements for each medication category
 */
export const requirements = mysqlTable("requirements", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  labelEn: varchar("labelEn", { length: 255 }).notNull(),
  labelAr: varchar("labelAr", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  isRequired: boolean("isRequired").default(true).notNull(),
  requiresDocument: boolean("requiresDocument").default(false).notNull(),
  documentTypes: text("documentTypes"), // JSON array of accepted file types
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Requirement = typeof requirements.$inferSelect;
export type InsertRequirement = typeof requirements.$inferInsert;

/**
 * Pre-Authorization Requests - طلبات الموافقة المسبقة
 * Stores submitted pre-auth requests from users
 */
export const preAuthRequests = mysqlTable("pre_auth_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "appealed"]).default("pending").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
  rejectionReason: text("rejectionReason"),
  appealReason: text("appealReason"),
  appealedAt: timestamp("appealedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreAuthRequest = typeof preAuthRequests.$inferSelect;
export type InsertPreAuthRequest = typeof preAuthRequests.$inferInsert;

/**
 * Request Documents - مستندات الطلب
 * Stores documents uploaded for each requirement in a request
 */
export const requestDocuments = mysqlTable("request_documents", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  requirementId: int("requirementId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RequestDocument = typeof requestDocuments.$inferSelect;
export type InsertRequestDocument = typeof requestDocuments.$inferInsert;

/**
 * Request Checklist Items - بنود قائمة التحقق
 * Stores the status of each requirement check in a request
 */
export const requestChecklistItems = mysqlTable("request_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  requirementId: int("requirementId").notNull(),
  isChecked: boolean("isChecked").default(false).notNull(),
  checkedAt: timestamp("checkedAt"),
  notes: text("notes"),
});

export type RequestChecklistItem = typeof requestChecklistItems.$inferSelect;
export type InsertRequestChecklistItem = typeof requestChecklistItems.$inferInsert;
