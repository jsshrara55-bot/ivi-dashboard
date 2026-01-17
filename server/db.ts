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
  InsertRequestChecklistItem
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
