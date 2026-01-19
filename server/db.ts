import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  medicationCategories, 
  requirements, 
  preAuthRequests, 
  requestDocuments, 
  requestChecklistItems,
  InsertMedicationCategory,
  InsertRequirement,
  InsertPreAuthRequest,
  InsertRequestDocument,
  InsertRequestChecklistItem,
  riskChangeAlerts,
  InsertRiskChangeAlert,
  notificationScheduler,
  InsertNotificationScheduler,
  notificationLog,
  InsertNotificationLog,
  userSettings,
  InsertUserSettings,
  iviScenarios,
  InsertIviScenario
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Medication Categories ====================

export async function getAllMedicationCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(medicationCategories).where(eq(medicationCategories.isActive, true));
}

export async function getMedicationCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(medicationCategories).where(eq(medicationCategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMedicationCategory(category: InsertMedicationCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(medicationCategories).values(category);
  return result[0].insertId;
}

export async function updateMedicationCategory(id: number, updates: Partial<InsertMedicationCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(medicationCategories).set(updates).where(eq(medicationCategories.id, id));
}

export async function deleteMedicationCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(medicationCategories).set({ isActive: false }).where(eq(medicationCategories.id, id));
}

// ==================== Requirements ====================

export async function getRequirementsByCategoryId(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(requirements)
    .where(and(eq(requirements.categoryId, categoryId), eq(requirements.isActive, true)))
    .orderBy(requirements.sortOrder);
}

export async function createRequirement(requirement: InsertRequirement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(requirements).values(requirement);
  return result[0].insertId;
}

export async function updateRequirement(id: number, updates: Partial<InsertRequirement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(requirements).set(updates).where(eq(requirements.id, id));
}

export async function deleteRequirement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(requirements).set({ isActive: false }).where(eq(requirements.id, id));
}

// ==================== Pre-Auth Requests ====================

export async function createPreAuthRequest(request: InsertPreAuthRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(preAuthRequests).values(request);
  return result[0].insertId;
}

export async function getPreAuthRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(preAuthRequests)
    .where(eq(preAuthRequests.userId, userId))
    .orderBy(desc(preAuthRequests.createdAt));
}

export async function getPreAuthRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(preAuthRequests).where(eq(preAuthRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePreAuthRequest(id: number, updates: Partial<InsertPreAuthRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(preAuthRequests).set(updates).where(eq(preAuthRequests.id, id));
}

export async function getAllPreAuthRequests() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(preAuthRequests).orderBy(desc(preAuthRequests.createdAt));
}

// ==================== Request Documents ====================

export async function createRequestDocument(doc: InsertRequestDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(requestDocuments).values(doc);
  return result[0].insertId;
}

export async function getDocumentsByRequestId(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(requestDocuments).where(eq(requestDocuments.requestId, requestId));
}

// ==================== Request Checklist Items ====================

export async function createChecklistItem(item: InsertRequestChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(requestChecklistItems).values(item);
  return result[0].insertId;
}

export async function getChecklistItemsByRequestId(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(requestChecklistItems).where(eq(requestChecklistItems.requestId, requestId));
}

export async function updateChecklistItem(id: number, updates: Partial<InsertRequestChecklistItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(requestChecklistItems).set(updates).where(eq(requestChecklistItems.id, id));
}

// ==================== Seed Initial Data ====================

export async function seedInitialData() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed data: database not available");
    return;
  }

  // Check if data already exists
  const existingCategories = await db.select().from(medicationCategories).limit(1);
  if (existingCategories.length > 0) {
    console.log("[Database] Initial data already exists, skipping seed");
    return;
  }

  console.log("[Database] Seeding initial medication categories and requirements...");

  // Seed Medication Categories
  const categories = [
    { code: 'obesity', nameEn: 'Obesity / Weight Loss', nameAr: 'أدوية السمنة', descriptionEn: 'Medications for weight management (e.g., Saxenda, Wegovy)', descriptionAr: 'أدوية لإدارة الوزن مثل ساكسندا وويجوفي' },
    { code: 'biologics', nameEn: 'Biologics', nameAr: 'الأدوية البيولوجية', descriptionEn: 'Biologic medications for autoimmune conditions (e.g., Humira, Enbrel)', descriptionAr: 'أدوية بيولوجية لأمراض المناعة الذاتية' },
    { code: 'growth_hormone', nameEn: 'Growth Hormone', nameAr: 'هرمون النمو', descriptionEn: 'Growth hormone therapy for children with growth deficiency', descriptionAr: 'علاج هرمون النمو للأطفال' },
    { code: 'baby_formula', nameEn: 'Specialized Baby Formula', nameAr: 'حليب الأطفال المتخصص', descriptionEn: 'Specialized formulas for infants with allergies or metabolic conditions', descriptionAr: 'حليب متخصص للرضع ذوي الحساسية' },
  ];

  for (const cat of categories) {
    await db.insert(medicationCategories).values(cat);
  }

  // Get inserted category IDs
  const insertedCategories = await db.select().from(medicationCategories);
  const categoryMap = new Map(insertedCategories.map(c => [c.code, c.id]));

  // Seed Requirements for each category
  const requirementsData = [
    // Obesity
    { categoryCode: 'obesity', code: 'bmi', labelEn: 'BMI Report > 30 (or > 27 with comorbidities)', labelAr: 'تقرير BMI أعلى من 30', descriptionEn: 'Recent BMI measurement within last 3 months', descriptionAr: 'قياس BMI حديث خلال آخر 3 أشهر', isRequired: true, requiresDocument: true, sortOrder: 1 },
    { categoryCode: 'obesity', code: 'diet', labelEn: 'Failed Diet/Exercise Plan', labelAr: 'فشل خطة الحمية والتمارين', descriptionEn: 'Documented failure of 6-month lifestyle intervention', descriptionAr: 'توثيق فشل برنامج نمط الحياة لمدة 6 أشهر', isRequired: true, requiresDocument: true, sortOrder: 2 },
    { categoryCode: 'obesity', code: 'thyroid', labelEn: 'Thyroid Function Test', labelAr: 'فحص وظائف الغدة الدرقية', descriptionEn: 'Normal TSH levels to rule out hypothyroidism', descriptionAr: 'مستويات TSH طبيعية لاستبعاد قصور الغدة', isRequired: true, requiresDocument: true, sortOrder: 3 },
    { categoryCode: 'obesity', code: 'contra', labelEn: 'No Contraindications', labelAr: 'لا توجد موانع استخدام', descriptionEn: 'Patient does not have history of medullary thyroid carcinoma', descriptionAr: 'المريض ليس لديه تاريخ سرطان الغدة الدرقية النخاعي', isRequired: true, requiresDocument: false, sortOrder: 4 },
    
    // Biologics
    { categoryCode: 'biologics', code: 'diagnosis', labelEn: 'Confirmed Diagnosis', labelAr: 'تشخيص مؤكد', descriptionEn: 'Pathology report confirming autoimmune condition', descriptionAr: 'تقرير مرضي يؤكد حالة المناعة الذاتية', isRequired: true, requiresDocument: true, sortOrder: 1 },
    { categoryCode: 'biologics', code: 'prior_therapy', labelEn: 'Failure of First-Line Therapy', labelAr: 'فشل العلاج الأولي', descriptionEn: 'Documented lack of response to conventional DMARDs', descriptionAr: 'توثيق عدم الاستجابة للأدوية التقليدية', isRequired: true, requiresDocument: true, sortOrder: 2 },
    { categoryCode: 'biologics', code: 'tb_test', labelEn: 'Negative TB Screening', labelAr: 'فحص سلبي للسل', descriptionEn: 'Recent chest X-ray or Quantiferon test', descriptionAr: 'أشعة صدر حديثة أو فحص كوانتيفيرون', isRequired: true, requiresDocument: true, sortOrder: 3 },
    { categoryCode: 'biologics', code: 'hepatitis', labelEn: 'Hepatitis Screening', labelAr: 'فحص التهاب الكبد', descriptionEn: 'Negative Hepatitis B and C panel', descriptionAr: 'فحص سلبي لالتهاب الكبد B و C', isRequired: true, requiresDocument: true, sortOrder: 4 },
    
    // Growth Hormone
    { categoryCode: 'growth_hormone', code: 'stimulation', labelEn: 'GH Stimulation Test', labelAr: 'فحص تحفيز هرمون النمو', descriptionEn: 'Two failed provocation tests (peak GH < 10 ng/mL)', descriptionAr: 'فحصان فاشلان للتحفيز', isRequired: true, requiresDocument: true, sortOrder: 1 },
    { categoryCode: 'growth_hormone', code: 'bone_age', labelEn: 'Bone Age X-Ray', labelAr: 'أشعة عمر العظام', descriptionEn: 'Delayed bone age report', descriptionAr: 'تقرير تأخر عمر العظام', isRequired: true, requiresDocument: true, sortOrder: 2 },
    { categoryCode: 'growth_hormone', code: 'igf1', labelEn: 'Low IGF-1 Levels', labelAr: 'مستويات IGF-1 منخفضة', descriptionEn: 'Serum IGF-1 below normal range for age/sex', descriptionAr: 'مستوى IGF-1 أقل من الطبيعي للعمر والجنس', isRequired: true, requiresDocument: true, sortOrder: 3 },
    { categoryCode: 'growth_hormone', code: 'mri', labelEn: 'Pituitary MRI', labelAr: 'رنين مغناطيسي للغدة النخامية', descriptionEn: 'To rule out intracranial lesions', descriptionAr: 'لاستبعاد الآفات داخل الجمجمة', isRequired: true, requiresDocument: true, sortOrder: 4 },
    
    // Baby Formula
    { categoryCode: 'baby_formula', code: 'allergy', labelEn: 'Allergy Confirmation', labelAr: 'تأكيد الحساسية', descriptionEn: "Proven cow's milk protein allergy (CMPA)", descriptionAr: 'حساسية مثبتة من بروتين حليب البقر', isRequired: true, requiresDocument: true, sortOrder: 1 },
    { categoryCode: 'baby_formula', code: 'growth', labelEn: 'Growth Chart', labelAr: 'مخطط النمو', descriptionEn: 'Evidence of failure to thrive or weight loss', descriptionAr: 'دليل على فشل النمو أو فقدان الوزن', isRequired: true, requiresDocument: true, sortOrder: 2 },
    { categoryCode: 'baby_formula', code: 'dermatology', labelEn: 'Dermatologist Report', labelAr: 'تقرير طبيب الجلدية', descriptionEn: 'For severe eczema cases', descriptionAr: 'لحالات الإكزيما الشديدة', isRequired: false, requiresDocument: true, sortOrder: 3 },
  ];

  for (const req of requirementsData) {
    const categoryId = categoryMap.get(req.categoryCode);
    if (categoryId) {
      await db.insert(requirements).values({
        categoryId,
        code: req.code,
        labelEn: req.labelEn,
        labelAr: req.labelAr,
        descriptionEn: req.descriptionEn,
        descriptionAr: req.descriptionAr,
        isRequired: req.isRequired,
        requiresDocument: req.requiresDocument,
        sortOrder: req.sortOrder,
      });
    }
  }

  console.log("[Database] Initial data seeded successfully!");
}


// ============================================================
// IVI DATA QUERIES - Based on Data Dictionary
// ============================================================

import { 
  corporateClients, 
  members, 
  providers, 
  claims, 
  insurancePreAuths, 
  callCenterCalls, 
  iviScores,
  InsertCorporateClient,
  InsertMember,
  InsertProvider,
  InsertClaim,
  InsertInsurancePreAuth,
  InsertCallCenterCall,
  InsertIviScore
} from "../drizzle/schema";
import { sql, count, sum, avg } from "drizzle-orm";

// ==================== Corporate Clients ====================

export async function getAllCorporateClients() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(corporateClients).where(eq(corporateClients.isActive, true));
}

export async function getCorporateClientByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(corporateClients).where(eq(corporateClients.contNo, contNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCorporateClient(client: InsertCorporateClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(corporateClients).values(client);
  return result[0].insertId;
}

export async function bulkInsertCorporateClients(clients: InsertCorporateClient[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (clients.length === 0) return;
  await db.insert(corporateClients).values(clients);
}

// ==================== Members ====================

export async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(members);
}

export async function getMembersByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(members).where(eq(members.contNo, contNo));
}

export async function getMemberByMbrNo(mbrNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(members).where(eq(members.mbrNo, mbrNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function bulkInsertMembers(membersList: InsertMember[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (membersList.length === 0) return;
  // Insert in batches of 500 to avoid query size limits
  const batchSize = 500;
  for (let i = 0; i < membersList.length; i += batchSize) {
    const batch = membersList.slice(i, i + batchSize);
    await db.insert(members).values(batch);
  }
}

// ==================== Providers ====================

export async function getAllProviders() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(providers).where(eq(providers.isActive, true));
}

export async function getProviderByCode(provCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(providers).where(eq(providers.provCode, provCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function bulkInsertProviders(providersList: InsertProvider[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (providersList.length === 0) return;
  const batchSize = 500;
  for (let i = 0; i < providersList.length; i += batchSize) {
    const batch = providersList.slice(i, i + batchSize);
    await db.insert(providers).values(batch);
  }
}

export async function getProviderStats() {
  const db = await getDb();
  if (!db) return { total: 0, byRegion: [], byPractice: [], byNetwork: [] };
  
  const total = await db.select({ count: count() }).from(providers);
  
  const byRegion = await db.select({
    region: providers.providerRegion,
    count: count()
  }).from(providers).groupBy(providers.providerRegion);
  
  const byPractice = await db.select({
    practice: providers.providerPractice,
    count: count()
  }).from(providers).groupBy(providers.providerPractice);
  
  const byNetwork = await db.select({
    network: providers.providerNetwork,
    count: count()
  }).from(providers).groupBy(providers.providerNetwork);
  
  return {
    total: total[0]?.count || 0,
    byRegion,
    byPractice,
    byNetwork
  };
}

// ==================== Claims ====================

export async function getAllClaims() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(claims).orderBy(desc(claims.claimDate)).limit(1000);
}

export async function getClaimsByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(claims).where(eq(claims.contNo, contNo)).orderBy(desc(claims.claimDate));
}

export async function getClaimsByMbrNo(mbrNo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(claims).where(eq(claims.mbrNo, mbrNo)).orderBy(desc(claims.claimDate));
}

export async function bulkInsertClaims(claimsList: InsertClaim[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (claimsList.length === 0) return;
  const batchSize = 500;
  for (let i = 0; i < claimsList.length; i += batchSize) {
    const batch = claimsList.slice(i, i + batchSize);
    await db.insert(claims).values(batch);
  }
}

export async function getClaimsStats() {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db.select({
    totalClaims: count(),
    totalClaimed: sum(claims.claimedAmount),
    totalApproved: sum(claims.approvedAmount),
    avgProcessingDays: avg(claims.processingDays)
  }).from(claims);
  
  const byStatus = await db.select({
    status: claims.status,
    count: count(),
    amount: sum(claims.claimedAmount)
  }).from(claims).groupBy(claims.status);
  
  const byBenefit = await db.select({
    benefit: claims.benefitCode,
    count: count(),
    amount: sum(claims.claimedAmount)
  }).from(claims).groupBy(claims.benefitCode);
  
  return {
    ...stats[0],
    byStatus,
    byBenefit
  };
}

// ==================== Insurance Pre-Authorizations ====================

export async function getAllInsurancePreAuths() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(insurancePreAuths).orderBy(desc(insurancePreAuths.requestDate)).limit(500);
}

export async function getInsurancePreAuthsByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(insurancePreAuths).where(eq(insurancePreAuths.contNo, contNo));
}

export async function bulkInsertInsurancePreAuths(preAuthsList: InsertInsurancePreAuth[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (preAuthsList.length === 0) return;
  const batchSize = 500;
  for (let i = 0; i < preAuthsList.length; i += batchSize) {
    const batch = preAuthsList.slice(i, i + batchSize);
    await db.insert(insurancePreAuths).values(batch);
  }
}

export async function getPreAuthStats() {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db.select({
    total: count(),
    totalCost: sum(insurancePreAuths.estimatedCost)
  }).from(insurancePreAuths);
  
  const byStatus = await db.select({
    status: insurancePreAuths.status,
    count: count()
  }).from(insurancePreAuths).groupBy(insurancePreAuths.status);
  
  const byCategory = await db.select({
    category: insurancePreAuths.medicationCategory,
    count: count(),
    cost: sum(insurancePreAuths.estimatedCost)
  }).from(insurancePreAuths).groupBy(insurancePreAuths.medicationCategory);
  
  return {
    ...stats[0],
    byStatus,
    byCategory
  };
}

// ==================== Call Center ====================

export async function getAllCalls() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(callCenterCalls).orderBy(desc(callCenterCalls.crtDate)).limit(1000);
}

export async function getCallsByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(callCenterCalls).where(eq(callCenterCalls.contNo, contNo));
}

export async function bulkInsertCalls(callsList: InsertCallCenterCall[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (callsList.length === 0) return;
  const batchSize = 500;
  for (let i = 0; i < callsList.length; i += batchSize) {
    const batch = callsList.slice(i, i + batchSize);
    await db.insert(callCenterCalls).values(batch);
  }
}

export async function getCallStats() {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db.select({
    total: count(),
    avgResolutionTime: avg(callCenterCalls.resolutionTimeHours),
    avgSatisfaction: avg(callCenterCalls.satisfactionScore)
  }).from(callCenterCalls);
  
  const byStatus = await db.select({
    status: callCenterCalls.status,
    count: count()
  }).from(callCenterCalls).groupBy(callCenterCalls.status);
  
  const byType = await db.select({
    type: callCenterCalls.callType,
    count: count()
  }).from(callCenterCalls).groupBy(callCenterCalls.callType);
  
  return {
    ...stats[0],
    byStatus,
    byType
  };
}

// ==================== IVI Scores ====================

export async function getAllIviScores() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(iviScores).orderBy(desc(iviScores.iviScore));
}

export async function getIviScoreByContNo(contNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(iviScores).where(eq(iviScores.contNo, contNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function bulkInsertIviScores(scoresList: InsertIviScore[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (scoresList.length === 0) return;
  await db.insert(iviScores).values(scoresList);
}

export async function getIviSummary() {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db.select({
    totalCompanies: count(),
    avgIviScore: avg(iviScores.iviScore),
    avgHScore: avg(iviScores.hScore),
    avgEScore: avg(iviScores.eScore),
    avgUScore: avg(iviScores.uScore),
    totalClaimed: sum(iviScores.totalClaimed),
    totalApproved: sum(iviScores.totalApproved)
  }).from(iviScores);
  
  const byRisk = await db.select({
    risk: iviScores.riskCategory,
    count: count()
  }).from(iviScores).groupBy(iviScores.riskCategory);
  
  const bySector = await db.select({
    sector: iviScores.sector,
    count: count(),
    avgScore: avg(iviScores.iviScore)
  }).from(iviScores).groupBy(iviScores.sector);
  
  return {
    ...stats[0],
    byRisk,
    bySector
  };
}

// ==================== Data Import ====================

export async function checkDataExists() {
  const db = await getDb();
  if (!db) return { hasData: false, counts: { corporateClients: 0, members: 0, claims: 0, providers: 0, iviScores: 0 } };
  
  const [clientsCount] = await db.select({ count: count() }).from(corporateClients);
  const [membersCount] = await db.select({ count: count() }).from(members);
  const [claimsCount] = await db.select({ count: count() }).from(claims);
  const [providersCount] = await db.select({ count: count() }).from(providers);
  const [iviCount] = await db.select({ count: count() }).from(iviScores);
  
  const counts = {
    corporateClients: clientsCount?.count || 0,
    members: membersCount?.count || 0,
    claims: claimsCount?.count || 0,
    providers: providersCount?.count || 0,
    iviScores: iviCount?.count || 0,
  };
  
  return {
    hasData: (iviCount?.count || 0) > 0,
    counts,
  };
}

export async function clearAllIviData() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear in reverse order of dependencies
  await db.delete(iviScores);
  await db.delete(callCenterCalls);
  await db.delete(insurancePreAuths);
  await db.delete(claims);
  await db.delete(members);
  await db.delete(providers);
  await db.delete(corporateClients);
}


// ==================== Risk Change Alerts ====================

export async function createRiskChangeAlert(alert: InsertRiskChangeAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(riskChangeAlerts).values(alert);
  return result[0].insertId;
}

export async function getRiskChangeAlerts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(riskChangeAlerts).orderBy(desc(riskChangeAlerts.createdAt)).limit(limit);
}

export async function getUnsentRiskAlerts() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(riskChangeAlerts).where(eq(riskChangeAlerts.notificationSent, false));
}

export async function markAlertAsSent(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(riskChangeAlerts)
    .set({ notificationSent: true, notificationSentAt: new Date() })
    .where(eq(riskChangeAlerts.id, alertId));
}

export async function checkAndCreateRiskAlerts(newScores: { contNo: string; companyName?: string | null; iviScore?: string | null; riskCategory?: "Low" | "Medium" | "High" | null }[]) {
  const db = await getDb();
  if (!db) return [];
  
  const alerts: InsertRiskChangeAlert[] = [];
  
  // Get current scores for comparison
  const currentScores = await db.select().from(iviScores);
  const currentScoresMap = new Map(currentScores.map(s => [s.contNo, s]));
  
  for (const newScore of newScores) {
    const current = currentScoresMap.get(newScore.contNo);
    if (!current) continue;
    
    const currentRisk = current.riskCategory;
    const newRisk = newScore.riskCategory;
    
    // Check if risk changed from Medium to High (escalation)
    if (currentRisk === "Medium" && newRisk === "High") {
      alerts.push({
        contNo: newScore.contNo,
        companyName: newScore.companyName || current.companyName,
        previousRisk: "Medium",
        newRisk: "High",
        previousScore: current.iviScore,
        newScore: newScore.iviScore,
        notificationSent: false,
      });
    }
    // Also track High to Medium (improvement) for reporting
    else if (currentRisk === "High" && newRisk === "Medium") {
      alerts.push({
        contNo: newScore.contNo,
        companyName: newScore.companyName || current.companyName,
        previousRisk: "High",
        newRisk: "Medium",
        previousScore: current.iviScore,
        newScore: newScore.iviScore,
        notificationSent: false,
      });
    }
  }
  
  // Insert all alerts
  for (const alert of alerts) {
    await createRiskChangeAlert(alert);
  }
  
  return alerts;
}


// ==================== Notification Scheduler ====================

export async function getSchedulerSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const settings = await db.select().from(notificationScheduler).limit(1);
  return settings[0] || null;
}

export async function createOrUpdateSchedulerSettings(settings: Partial<InsertNotificationScheduler>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSchedulerSettings();
  
  if (existing) {
    await db.update(notificationScheduler)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(notificationScheduler.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(notificationScheduler).values({
      isEnabled: settings.isEnabled ?? false,
      scheduledTime: settings.scheduledTime ?? "09:00",
      daysOfWeek: settings.daysOfWeek ?? "1,2,3,4,5",
      ...settings
    });
    return result[0].insertId;
  }
}

export async function updateSchedulerLastRun(status: "success" | "failed" | "partial", count: number, error?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSchedulerSettings();
  if (!existing) return;
  
  await db.update(notificationScheduler)
    .set({
      lastRunAt: new Date(),
      lastRunCount: count,
      lastRunStatus: status,
      lastRunError: error || null,
      updatedAt: new Date()
    })
    .where(eq(notificationScheduler.id, existing.id));
}

export async function updateSchedulerNextRun(nextRunAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSchedulerSettings();
  if (!existing) return;
  
  await db.update(notificationScheduler)
    .set({ nextRunAt, updatedAt: new Date() })
    .where(eq(notificationScheduler.id, existing.id));
}

// ==================== Notification Log ====================

export async function createNotificationLog(log: InsertNotificationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notificationLog).values(log);
  return result[0].insertId;
}

export async function getNotificationLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(notificationLog).orderBy(desc(notificationLog.sentAt)).limit(limit);
}

export async function getNotificationLogsByType(type: "risk_escalation" | "risk_improvement" | "scheduled_daily" | "manual", limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(notificationLog)
    .where(eq(notificationLog.notificationType, type))
    .orderBy(desc(notificationLog.sentAt))
    .limit(limit);
}


// ==================== User Settings ====================

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return settings[0] || null;
}

export async function createOrUpdateUserSettings(userId: number, settings: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserSettings(userId);
  
  if (existing) {
    await db.update(userSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));
    return existing.id;
  } else {
    const result = await db.insert(userSettings).values({
      userId,
      language: settings.language ?? "en",
      theme: settings.theme ?? "system",
      displayDensity: settings.displayDensity ?? "comfortable",
      emailNotifications: settings.emailNotifications ?? true,
      riskAlertNotifications: settings.riskAlertNotifications ?? true,
      dailySummaryNotifications: settings.dailySummaryNotifications ?? false,
      notificationSound: settings.notificationSound ?? true,
      defaultDashboardView: settings.defaultDashboardView ?? "overview",
      itemsPerPage: settings.itemsPerPage ?? 10,
      showTooltips: settings.showTooltips ?? true,
      ...settings
    });
    return result[0].insertId;
  }
}

export async function deleteUserSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(userSettings).where(eq(userSettings.userId, userId));
}


// ==================== IVI Scenarios ====================

export async function createScenario(scenario: InsertIviScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(iviScenarios).values(scenario);
  return result[0].insertId;
}

export async function getScenarioById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const scenarios = await db.select().from(iviScenarios).where(eq(iviScenarios.id, id)).limit(1);
  return scenarios[0] || null;
}

export async function getScenariosByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(iviScenarios)
    .where(eq(iviScenarios.userId, userId))
    .orderBy(desc(iviScenarios.createdAt))
    .limit(limit);
}

export async function getAllScenarios(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(iviScenarios)
    .orderBy(desc(iviScenarios.createdAt))
    .limit(limit);
}

export async function getSharedScenarios(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(iviScenarios)
    .where(eq(iviScenarios.isShared, true))
    .orderBy(desc(iviScenarios.createdAt))
    .limit(limit);
}

export async function getFavoriteScenarios(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(iviScenarios)
    .where(and(eq(iviScenarios.userId, userId), eq(iviScenarios.isFavorite, true)))
    .orderBy(desc(iviScenarios.createdAt))
    .limit(limit);
}

export async function updateScenario(id: number, updates: Partial<InsertIviScenario>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(iviScenarios)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(iviScenarios.id, id));
}

export async function deleteScenario(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(iviScenarios).where(eq(iviScenarios.id, id));
}

export async function toggleScenarioFavorite(id: number, isFavorite: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(iviScenarios)
    .set({ isFavorite, updatedAt: new Date() })
    .where(eq(iviScenarios.id, id));
}

export async function toggleScenarioShared(id: number, isShared: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(iviScenarios)
    .set({ isShared, updatedAt: new Date() })
    .where(eq(iviScenarios.id, id));
}

// Calculate projected IVI score based on adjustments
export function calculateProjectedIvi(
  baseH: number,
  baseE: number,
  baseU: number,
  hAdjustment: number,
  eAdjustment: number,
  uAdjustment: number
): {
  projectedH: number;
  projectedE: number;
  projectedU: number;
  projectedIvi: number;
  riskCategory: "Low" | "Medium" | "High";
} {
  // Apply adjustments (clamped to 0-100)
  const projectedH = Math.max(0, Math.min(100, baseH * (1 + hAdjustment / 100)));
  const projectedE = Math.max(0, Math.min(100, baseE * (1 + eAdjustment / 100)));
  const projectedU = Math.max(0, Math.min(100, baseU * (1 + uAdjustment / 100)));
  
  // Calculate IVI using weighted formula: IVI = 0.4*H + 0.3*E + 0.3*U
  const projectedIvi = 0.4 * projectedH + 0.3 * projectedE + 0.3 * projectedU;
  
  // Determine risk category
  let riskCategory: "Low" | "Medium" | "High";
  if (projectedIvi >= 70) {
    riskCategory = "Low";
  } else if (projectedIvi >= 35) {
    riskCategory = "Medium";
  } else {
    riskCategory = "High";
  }
  
  return {
    projectedH: Math.round(projectedH * 100) / 100,
    projectedE: Math.round(projectedE * 100) / 100,
    projectedU: Math.round(projectedU * 100) / 100,
    projectedIvi: Math.round(projectedIvi * 100) / 100,
    riskCategory,
  };
}

// Generate monthly projections for a scenario
export function generateMonthlyProjections(
  baseIvi: number,
  targetIvi: number,
  months: number
): { month: number; ivi: number; date: string }[] {
  const projections: { month: number; ivi: number; date: string }[] = [];
  const monthlyChange = (targetIvi - baseIvi) / months;
  
  const now = new Date();
  
  for (let i = 0; i <= months; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + i);
    
    // Add some variance to make it more realistic
    const variance = (Math.random() - 0.5) * 2; // ±1 point variance
    const ivi = Math.round((baseIvi + monthlyChange * i + variance) * 100) / 100;
    
    projections.push({
      month: i,
      ivi: Math.max(0, Math.min(100, ivi)),
      date: date.toISOString().split('T')[0],
    });
  }
  
  return projections;
}
