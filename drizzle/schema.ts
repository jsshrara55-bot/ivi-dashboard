import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date } from "drizzle-orm/mysql-core";

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

// ============================================================
// IVI DATA TABLES - Based on Data Dictionary
// ============================================================

/**
 * Corporate Clients - الشركات العميلة
 * Stores corporate client information with contracts
 */
export const corporateClients = mysqlTable("corporate_clients", {
  id: int("id").autoincrement().primaryKey(),
  contNo: varchar("contNo", { length: 50 }).notNull().unique(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  region: varchar("region", { length: 100 }),
  network: varchar("network", { length: 20 }),
  employeeCount: int("employeeCount"),
  contractStart: date("contractStart"),
  contractEnd: date("contractEnd"),
  premiumAmount: decimal("premiumAmount", { precision: 15, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CorporateClient = typeof corporateClients.$inferSelect;
export type InsertCorporateClient = typeof corporateClients.$inferInsert;

/**
 * Members - الأعضاء المؤمن عليهم
 * Stores member/employee information
 */
export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  mbrNo: varchar("mbrNo", { length: 50 }).notNull().unique(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  gender: varchar("gender", { length: 10 }),
  age: int("age"),
  maritalStatus: varchar("maritalStatus", { length: 10 }),
  nationality: varchar("nationality", { length: 50 }),
  city: varchar("city", { length: 100 }),
  planNetwork: varchar("planNetwork", { length: 20 }),
  hasChronic: boolean("hasChronic").default(false),
  chronicConditions: text("chronicConditions"),
  enrollmentDate: date("enrollmentDate"),
  status: mysqlEnum("memberStatus", ["Active", "Suspended", "Terminated"]).default("Active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * Providers - مقدمي الخدمات الصحية
 * Stores healthcare provider information
 */
export const providers = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  provCode: varchar("provCode", { length: 50 }).notNull().unique(),
  provName: varchar("provName", { length: 255 }).notNull(),
  providerNetwork: varchar("providerNetwork", { length: 20 }),
  providerPractice: varchar("providerPractice", { length: 100 }),
  providerRegion: varchar("providerRegion", { length: 100 }),
  providerTown: varchar("providerTown", { length: 100 }),
  areaCode: varchar("areaCode", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

/**
 * Claims - المطالبات
 * Stores insurance claims data
 */
export const claims = mysqlTable("claims", {
  id: int("id").autoincrement().primaryKey(),
  claimId: varchar("claimId", { length: 50 }).notNull().unique(),
  mbrNo: varchar("mbrNo", { length: 50 }).notNull(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  provCode: varchar("provCode", { length: 50 }),
  claimDate: date("claimDate"),
  icdCode: varchar("icdCode", { length: 20 }),
  diagnosis: varchar("diagnosis", { length: 255 }),
  benefitCode: varchar("benefitCode", { length: 20 }),
  benefitDesc: varchar("benefitDesc", { length: 255 }),
  claimedAmount: decimal("claimedAmount", { precision: 12, scale: 2 }),
  approvedAmount: decimal("approvedAmount", { precision: 12, scale: 2 }),
  status: mysqlEnum("claimStatus", ["Approved", "Rejected", "Pending", "Partially Approved"]).default("Pending"),
  rejectionReason: text("rejectionReason"),
  processingDays: int("processingDays"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

/**
 * Pre-Authorizations (Insurance) - الموافقات المسبقة للتأمين
 * Stores pre-authorization requests for sensitive medications
 */
export const insurancePreAuths = mysqlTable("insurance_pre_auths", {
  id: int("id").autoincrement().primaryKey(),
  preauthId: varchar("preauthId", { length: 50 }).notNull().unique(),
  mbrNo: varchar("mbrNo", { length: 50 }).notNull(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  provCode: varchar("provCode", { length: 50 }),
  medicationName: varchar("medicationName", { length: 255 }),
  medicationCategory: varchar("medicationCategory", { length: 100 }),
  estimatedCost: decimal("estimatedCost", { precision: 12, scale: 2 }),
  requestDate: date("requestDate"),
  docsSubmitted: text("docsSubmitted"),
  docsComplete: boolean("docsComplete").default(false),
  status: mysqlEnum("preauthStatus", ["Approved", "Rejected", "Pending"]).default("Pending"),
  decisionDate: date("decisionDate"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsurancePreAuth = typeof insurancePreAuths.$inferSelect;
export type InsertInsurancePreAuth = typeof insurancePreAuths.$inferInsert;

/**
 * Call Center Interactions - تفاعلات مركز الاتصال
 * Stores customer service call records
 */
export const callCenterCalls = mysqlTable("call_center_calls", {
  id: int("id").autoincrement().primaryKey(),
  callId: varchar("callId", { length: 50 }).notNull().unique(),
  mbrNo: varchar("mbrNo", { length: 50 }).notNull(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  callCat: varchar("callCat", { length: 20 }),
  callType: varchar("callType", { length: 50 }),
  callReason: varchar("callReason", { length: 255 }),
  crtDate: timestamp("crtDate"),
  updDate: timestamp("updDate"),
  status: mysqlEnum("callStatus", ["OPENED", "CLOSED", "WIP"]).default("OPENED"),
  resolutionTimeHours: int("resolutionTimeHours"),
  satisfactionScore: int("satisfactionScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CallCenterCall = typeof callCenterCalls.$inferSelect;
export type InsertCallCenterCall = typeof callCenterCalls.$inferInsert;

/**
 * IVI Scores - درجات مؤشر القيمة الذكي
 * Stores calculated IVI scores for each corporate client
 */
export const iviScores = mysqlTable("ivi_scores", {
  id: int("id").autoincrement().primaryKey(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  sector: varchar("sector", { length: 100 }),
  region: varchar("region", { length: 100 }),
  employeeCount: int("employeeCount"),
  totalClaims: int("totalClaims"),
  totalClaimed: decimal("totalClaimed", { precision: 15, scale: 2 }),
  totalApproved: decimal("totalApproved", { precision: 15, scale: 2 }),
  hScore: decimal("hScore", { precision: 5, scale: 2 }),
  eScore: decimal("eScore", { precision: 5, scale: 2 }),
  uScore: decimal("uScore", { precision: 5, scale: 2 }),
  iviScore: decimal("iviScore", { precision: 5, scale: 2 }),
  riskCategory: mysqlEnum("riskCategory", ["Low", "Medium", "High"]).default("Medium"),
  chronicRate: decimal("chronicRate", { precision: 5, scale: 2 }),
  complaintRate: decimal("complaintRate", { precision: 5, scale: 2 }),
  rejectionRate: decimal("rejectionRate", { precision: 5, scale: 2 }),
  lossRatio: decimal("lossRatio", { precision: 5, scale: 2 }),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IviScore = typeof iviScores.$inferSelect;
export type InsertIviScore = typeof iviScores.$inferInsert;

/**
 * Risk Change Alerts - تنبيهات تغيير فئة المخاطر
 * Stores alerts when a company's risk category changes
 */
export const riskChangeAlerts = mysqlTable("risk_change_alerts", {
  id: int("id").autoincrement().primaryKey(),
  contNo: varchar("contNo", { length: 50 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  previousRisk: mysqlEnum("previousRisk", ["Low", "Medium", "High"]).notNull(),
  newRisk: mysqlEnum("newRisk", ["Low", "Medium", "High"]).notNull(),
  previousScore: decimal("previousScore", { precision: 5, scale: 2 }),
  newScore: decimal("newScore", { precision: 5, scale: 2 }),
  notificationSent: boolean("notificationSent").default(false).notNull(),
  notificationSentAt: timestamp("notificationSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiskChangeAlert = typeof riskChangeAlerts.$inferSelect;
export type InsertRiskChangeAlert = typeof riskChangeAlerts.$inferInsert;

/**
 * Notification Scheduler Settings - إعدادات جدولة الإشعارات
 * Stores configuration for automated daily risk alert notifications
 */
export const notificationScheduler = mysqlTable("notification_scheduler", {
  id: int("id").autoincrement().primaryKey(),
  /** Whether the scheduler is enabled */
  isEnabled: boolean("isEnabled").default(false).notNull(),
  /** Time of day to send notifications (HH:MM format) */
  scheduledTime: varchar("scheduledTime", { length: 5 }).default("09:00").notNull(),
  /** Days of week to send (comma-separated: 0=Sun, 1=Mon, ..., 6=Sat) */
  daysOfWeek: varchar("daysOfWeek", { length: 20 }).default("1,2,3,4,5").notNull(),
  /** Last time the scheduler ran */
  lastRunAt: timestamp("lastRunAt"),
  /** Next scheduled run time */
  nextRunAt: timestamp("nextRunAt"),
  /** Number of notifications sent in last run */
  lastRunCount: int("lastRunCount").default(0),
  /** Status of last run */
  lastRunStatus: mysqlEnum("lastRunStatus", ["success", "failed", "partial"]),
  /** Error message if last run failed */
  lastRunError: text("lastRunError"),
  /** User who last modified the settings */
  modifiedBy: int("modifiedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationScheduler = typeof notificationScheduler.$inferSelect;
export type InsertNotificationScheduler = typeof notificationScheduler.$inferInsert;

/**
 * Notification Log - سجل الإشعارات
 * Tracks all sent notifications for audit purposes
 */
export const notificationLog = mysqlTable("notification_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of notification */
  notificationType: mysqlEnum("notificationType", ["risk_escalation", "risk_improvement", "scheduled_daily", "manual"]).notNull(),
  /** Related alert ID if applicable */
  alertId: int("alertId"),
  /** Company contract number */
  contNo: varchar("contNo", { length: 50 }),
  /** Company name */
  companyName: varchar("companyName", { length: 255 }),
  /** Notification title */
  title: varchar("title", { length: 500 }).notNull(),
  /** Whether notification was sent successfully */
  success: boolean("success").default(false).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Timestamp when notification was sent */
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type NotificationLog = typeof notificationLog.$inferSelect;
export type InsertNotificationLog = typeof notificationLog.$inferInsert;
