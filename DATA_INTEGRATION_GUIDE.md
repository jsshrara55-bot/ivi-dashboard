# دليل ربط البيانات الحقيقية | Real Data Integration Guide

## Bupa Arabia - IVI Dashboard

**Team: Ghada | Shahad | Afnan | Yamama | Razan**

---

## نظرة عامة | Overview

هذا الدليل الشامل يشرح كيفية ربط بيانات بوبا الحقيقية مع نظام IVI Dashboard خطوة بخطوة.

This comprehensive guide explains step-by-step how to connect real Bupa data with the IVI Dashboard system.

---

## جدول المحتويات | Table of Contents

1. [متطلبات البيانات](#1-متطلبات-البيانات)
2. [هيكل الجداول](#2-هيكل-الجداول)
3. [مصادر البيانات من بوبا](#3-مصادر-البيانات-من-بوبا)
4. [طرق الاستيراد](#4-طرق-الاستيراد)
5. [حساب درجات IVI](#5-حساب-درجات-ivi)
6. [التحقق من البيانات](#6-التحقق-من-البيانات)
7. [جدولة التحديث](#7-جدولة-التحديث)
8. [أمان البيانات](#8-أمان-البيانات)
9. [استكشاف الأخطاء](#9-استكشاف-الأخطاء)

---

## 1. متطلبات البيانات | Data Requirements

### البيانات الأساسية المطلوبة | Required Core Data

| البيان | المصدر في بوبا | الأهمية |
|--------|----------------|---------|
| بيانات العقود | نظام إدارة العقود | أساسي |
| بيانات الأعضاء | نظام التسجيل | أساسي |
| المطالبات | نظام المطالبات | أساسي |
| الموافقات المسبقة | نظام Pre-Auth | مهم |
| رضا العملاء | استبيانات NPS | مهم |
| بيانات مقدمي الخدمات | نظام الشبكة | اختياري |

### حجم البيانات المتوقع | Expected Data Volume

| الجدول | الحجم التقريبي | تكرار التحديث |
|--------|----------------|---------------|
| الشركات | ~300 سجل | شهري |
| الأعضاء | ~50,000 سجل | أسبوعي |
| المطالبات | ~500,000 سجل/سنة | يومي |
| درجات IVI | ~300 سجل | يومي |

---

## 2. هيكل الجداول | Database Schema

### جدول الشركات العميلة | Corporate Clients Table

```sql
CREATE TABLE corporate_clients (
  cont_no VARCHAR(50) PRIMARY KEY,      -- رقم العقد (من نظام بوبا)
  company_name VARCHAR(255) NOT NULL,   -- اسم الشركة
  company_name_ar VARCHAR(255),         -- اسم الشركة بالعربي
  sector VARCHAR(100),                  -- القطاع (Healthcare, Technology, etc.)
  region VARCHAR(100),                  -- المنطقة (Riyadh, Jeddah, etc.)
  employee_count INT DEFAULT 0,         -- عدد الموظفين المؤمن عليهم
  premium_amount DECIMAL(15,2),         -- مبلغ القسط السنوي (SAR)
  contract_start_date DATE,             -- تاريخ بداية العقد
  contract_end_date DATE,               -- تاريخ نهاية العقد
  account_manager VARCHAR(255),         -- مدير الحساب
  client_type ENUM('SME', 'KeyAccount'), -- نوع العميل
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**مصدر البيانات في بوبا:**
- نظام إدارة العقود (Contract Management System)
- جدول: `CONTRACTS` أو `POLICIES`

### جدول درجات IVI | IVI Scores Table

```sql
CREATE TABLE ivi_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cont_no VARCHAR(50) NOT NULL,         -- رقم العقد (FK)
  
  -- المكونات الفرعية لـ H (Health Outcomes)
  chronic_disease_rate DECIMAL(5,2),    -- نسبة الأمراض المزمنة (%)
  preventive_care_rate DECIMAL(5,2),    -- نسبة الرعاية الوقائية (%)
  loss_ratio DECIMAL(5,2),              -- نسبة الخسارة (%)
  h_score DECIMAL(5,2),                 -- درجة الصحة (0-100)
  
  -- المكونات الفرعية لـ E (Experience Quality)
  satisfaction_score DECIMAL(5,2),      -- درجة رضا العملاء (NPS)
  claims_processing_days DECIMAL(5,2),  -- متوسط أيام معالجة المطالبات
  network_access_score DECIMAL(5,2),    -- درجة الوصول للشبكة
  e_score DECIMAL(5,2),                 -- درجة التجربة (0-100)
  
  -- المكونات الفرعية لـ U (Utilization Efficiency)
  generic_drug_rate DECIMAL(5,2),       -- نسبة استخدام الأدوية البديلة (%)
  preauth_approval_rate DECIMAL(5,2),   -- نسبة الموافقة المسبقة (%)
  cost_per_member DECIMAL(15,2),        -- التكلفة لكل عضو (SAR)
  u_score DECIMAL(5,2),                 -- درجة الاستخدام (0-100)
  
  -- الدرجة الإجمالية
  ivi_score DECIMAL(5,2),               -- درجة IVI الإجمالية
  risk_category ENUM('Low', 'Medium', 'High'),
  
  -- البيانات الوصفية
  calculation_period VARCHAR(20),       -- الفترة (Q1-2025, 2025, etc.)
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cont_no) REFERENCES corporate_clients(cont_no)
);
```

### جدول المطالبات | Claims Table

```sql
CREATE TABLE claims (
  claim_id VARCHAR(50) PRIMARY KEY,     -- رقم المطالبة
  cont_no VARCHAR(50) NOT NULL,         -- رقم العقد
  member_id VARCHAR(50) NOT NULL,       -- رقم العضو
  claim_date DATE NOT NULL,             -- تاريخ المطالبة
  submission_date DATE,                 -- تاريخ تقديم المطالبة
  processing_date DATE,                 -- تاريخ المعالجة
  claim_amount DECIMAL(15,2),           -- مبلغ المطالبة (SAR)
  approved_amount DECIMAL(15,2),        -- المبلغ المعتمد (SAR)
  rejected_amount DECIMAL(15,2),        -- المبلغ المرفوض (SAR)
  status ENUM('Approved', 'Rejected', 'Pending', 'Partial'),
  claim_type VARCHAR(100),              -- نوع المطالبة (Inpatient, Outpatient, etc.)
  diagnosis_code VARCHAR(20),           -- رمز التشخيص (ICD-10)
  provider_id VARCHAR(50),              -- رقم مقدم الخدمة
  provider_name VARCHAR(255),           -- اسم مقدم الخدمة
  is_chronic BOOLEAN DEFAULT FALSE,     -- هل مرتبطة بمرض مزمن
  
  FOREIGN KEY (cont_no) REFERENCES corporate_clients(cont_no)
);
```

**مصدر البيانات في بوبا:**
- نظام المطالبات (Claims Processing System)
- جدول: `CLAIMS` أو `CLAIM_TRANSACTIONS`

### جدول الأعضاء | Members Table

```sql
CREATE TABLE members (
  member_id VARCHAR(50) PRIMARY KEY,    -- رقم العضو
  cont_no VARCHAR(50) NOT NULL,         -- رقم العقد
  member_name VARCHAR(255),             -- اسم العضو
  age INT,                              -- العمر
  gender ENUM('M', 'F'),                -- الجنس
  relationship ENUM('Employee', 'Spouse', 'Child', 'Parent'),
  enrollment_date DATE,                 -- تاريخ التسجيل
  termination_date DATE,                -- تاريخ الإنهاء (إن وجد)
  has_chronic_disease BOOLEAN DEFAULT FALSE,
  chronic_disease_types TEXT,           -- أنواع الأمراض المزمنة (JSON)
  plan_type VARCHAR(100),               -- نوع الخطة
  
  FOREIGN KEY (cont_no) REFERENCES corporate_clients(cont_no)
);
```

### جدول الموافقات المسبقة | Pre-Authorizations Table

```sql
CREATE TABLE pre_authorizations (
  preauth_id VARCHAR(50) PRIMARY KEY,
  cont_no VARCHAR(50) NOT NULL,
  member_id VARCHAR(50) NOT NULL,
  request_date DATE,
  decision_date DATE,
  status ENUM('Approved', 'Rejected', 'Pending', 'Modified'),
  requested_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2),
  service_type VARCHAR(100),
  provider_id VARCHAR(50),
  turnaround_hours INT,                 -- وقت الاستجابة بالساعات
  
  FOREIGN KEY (cont_no) REFERENCES corporate_clients(cont_no)
);
```

---

## 3. مصادر البيانات من بوبا | Bupa Data Sources

### خريطة الربط مع أنظمة بوبا | Bupa System Mapping

| بيان IVI | نظام بوبا | الجدول/API | الحقل |
|----------|-----------|------------|-------|
| `cont_no` | Contract System | CONTRACTS | CONTRACT_NUMBER |
| `company_name` | Contract System | CONTRACTS | COMPANY_NAME |
| `employee_count` | Enrollment | MEMBERS | COUNT(*) |
| `premium_amount` | Finance | PREMIUMS | ANNUAL_PREMIUM |
| `claim_amount` | Claims | CLAIMS | CLAIM_AMOUNT |
| `satisfaction_score` | CRM | SURVEYS | NPS_SCORE |
| `chronic_disease_rate` | Medical | CHRONIC_REGISTRY | RATE |

### استعلامات الاستخراج | Extraction Queries

```sql
-- استخراج بيانات الشركات
SELECT 
  c.CONTRACT_NUMBER as cont_no,
  c.COMPANY_NAME as company_name,
  c.SECTOR as sector,
  c.REGION as region,
  COUNT(m.MEMBER_ID) as employee_count,
  p.ANNUAL_PREMIUM as premium_amount,
  c.START_DATE as contract_start_date,
  c.END_DATE as contract_end_date
FROM BUPA.CONTRACTS c
LEFT JOIN BUPA.MEMBERS m ON c.CONTRACT_NUMBER = m.CONTRACT_NUMBER
LEFT JOIN BUPA.PREMIUMS p ON c.CONTRACT_NUMBER = p.CONTRACT_NUMBER
WHERE c.STATUS = 'ACTIVE'
GROUP BY c.CONTRACT_NUMBER;

-- استخراج بيانات المطالبات
SELECT 
  cl.CLAIM_ID as claim_id,
  cl.CONTRACT_NUMBER as cont_no,
  cl.MEMBER_ID as member_id,
  cl.SERVICE_DATE as claim_date,
  cl.CLAIMED_AMOUNT as claim_amount,
  cl.APPROVED_AMOUNT as approved_amount,
  cl.STATUS as status,
  cl.CLAIM_TYPE as claim_type,
  cl.PROVIDER_ID as provider_id
FROM BUPA.CLAIMS cl
WHERE cl.SERVICE_DATE >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- حساب نسبة الأمراض المزمنة لكل شركة
SELECT 
  m.CONTRACT_NUMBER as cont_no,
  (COUNT(CASE WHEN m.HAS_CHRONIC = 1 THEN 1 END) * 100.0 / COUNT(*)) as chronic_rate
FROM BUPA.MEMBERS m
WHERE m.STATUS = 'ACTIVE'
GROUP BY m.CONTRACT_NUMBER;
```

---

## 4. طرق الاستيراد | Import Methods

### الطريقة 1: استيراد CSV (الأسهل) | CSV Import

#### الخطوات:

1. **تصدير البيانات من بوبا:**
   ```bash
   # تصدير من Oracle/SQL Server إلى CSV
   sqlplus -s user/pass@bupa_db <<EOF
   SET COLSEP ','
   SET PAGESIZE 0
   SET TRIMSPOOL ON
   SET LINESIZE 32767
   SPOOL /tmp/corporate_clients.csv
   SELECT * FROM CONTRACTS WHERE STATUS = 'ACTIVE';
   SPOOL OFF
   EOF
   ```

2. **تحميل الملفات في الداشبورد:**
   - اذهب إلى Settings → Data Import
   - اختر نوع البيانات (Clients, Claims, Members)
   - ارفع ملف CSV
   - راجع المعاينة وأكد الاستيراد

3. **تنسيق ملف CSV المطلوب:**

   **corporate_clients.csv:**
   ```csv
   cont_no,company_name,sector,region,employee_count,premium_amount,contract_start_date,contract_end_date
   C001,شركة الرياض للتقنية,Technology,Riyadh,150,450000,2024-01-01,2025-12-31
   C002,مستشفى المملكة,Healthcare,Jeddah,320,980000,2024-03-15,2025-03-14
   ```

   **claims.csv:**
   ```csv
   claim_id,cont_no,member_id,claim_date,claim_amount,approved_amount,status,claim_type
   CLM001,C001,M001,2025-01-15,5000,4500,Approved,Outpatient
   CLM002,C001,M002,2025-01-16,12000,12000,Approved,Inpatient
   ```

### الطريقة 2: API Integration (للتحديث المستمر)

```typescript
// server/bupa-integration.ts

import axios from 'axios';

interface BupaConfig {
  baseUrl: string;
  apiKey: string;
  clientId: string;
}

export class BupaDataConnector {
  private config: BupaConfig;

  constructor(config: BupaConfig) {
    this.config = config;
  }

  // جلب بيانات الشركات
  async fetchCorporateClients(): Promise<CorporateClient[]> {
    const response = await axios.get(
      `${this.config.baseUrl}/api/v1/contracts`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Client-ID': this.config.clientId
        },
        params: {
          status: 'ACTIVE',
          type: 'CORPORATE'
        }
      }
    );
    return this.transformClients(response.data);
  }

  // جلب المطالبات
  async fetchClaims(fromDate: Date, toDate: Date): Promise<Claim[]> {
    const response = await axios.get(
      `${this.config.baseUrl}/api/v1/claims`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        params: {
          from_date: fromDate.toISOString(),
          to_date: toDate.toISOString()
        }
      }
    );
    return this.transformClaims(response.data);
  }

  // تحويل البيانات للتنسيق المطلوب
  private transformClients(data: any[]): CorporateClient[] {
    return data.map(item => ({
      contNo: item.CONTRACT_NUMBER,
      companyName: item.COMPANY_NAME,
      sector: item.SECTOR,
      region: item.REGION,
      employeeCount: item.MEMBER_COUNT,
      premiumAmount: parseFloat(item.ANNUAL_PREMIUM),
      contractStartDate: new Date(item.START_DATE),
      contractEndDate: new Date(item.END_DATE)
    }));
  }
}

// استخدام الموصل
const connector = new BupaDataConnector({
  baseUrl: process.env.BUPA_API_URL!,
  apiKey: process.env.BUPA_API_KEY!,
  clientId: process.env.BUPA_CLIENT_ID!
});

// جلب وتحديث البيانات
export async function syncBupaData() {
  const clients = await connector.fetchCorporateClients();
  await bulkUpsertClients(clients);
  
  const claims = await connector.fetchClaims(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // آخر 30 يوم
    new Date()
  );
  await bulkInsertClaims(claims);
  
  // إعادة حساب درجات IVI
  await recalculateAllIviScores();
}
```

### الطريقة 3: Database Connection (للوصول المباشر)

```typescript
// server/bupa-db.ts

import mysql from 'mysql2/promise';

// إعداد الاتصال بقاعدة بيانات بوبا
const bupaPool = mysql.createPool({
  host: process.env.BUPA_DB_HOST,
  port: parseInt(process.env.BUPA_DB_PORT || '3306'),
  user: process.env.BUPA_DB_USER,
  password: process.env.BUPA_DB_PASSWORD,
  database: process.env.BUPA_DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

// استعلام مباشر
export async function fetchBupaClients() {
  const [rows] = await bupaPool.query(`
    SELECT 
      CONTRACT_NUMBER as cont_no,
      COMPANY_NAME as company_name,
      SECTOR as sector,
      REGION as region
    FROM CONTRACTS
    WHERE STATUS = 'ACTIVE'
  `);
  return rows;
}

// مزامنة البيانات
export async function syncFromBupa() {
  const clients = await fetchBupaClients();
  
  for (const client of clients) {
    await db.insert(corporateClients)
      .values(client)
      .onDuplicateKeyUpdate({
        set: {
          companyName: client.company_name,
          sector: client.sector,
          region: client.region,
          updatedAt: new Date()
        }
      });
  }
}
```

---

## 5. حساب درجات IVI | IVI Score Calculation

### الصيغة الرئيسية | Main Formula

```
IVI Score = (H × 0.40) + (E × 0.30) + (U × 0.30)
```

### حساب H (Health Outcomes) - 40%

```typescript
function calculateHScore(data: ClientHealthData): number {
  // 1. نسبة الأمراض المزمنة (30% من H)
  // كلما قلت النسبة، كانت الدرجة أفضل
  const chronicScore = 100 - (data.chronicDiseaseRate * 1.5);
  
  // 2. نسبة الرعاية الوقائية (35% من H)
  // كلما زادت النسبة، كانت الدرجة أفضل
  const preventiveScore = data.preventiveCareRate;
  
  // 3. نسبة الخسارة (35% من H)
  // كلما قلت النسبة، كانت الدرجة أفضل
  const lossRatioScore = Math.max(0, 100 - data.lossRatio);
  
  return (chronicScore * 0.30) + (preventiveScore * 0.35) + (lossRatioScore * 0.35);
}
```

### حساب E (Experience Quality) - 30%

```typescript
function calculateEScore(data: ClientExperienceData): number {
  // 1. درجة رضا العملاء NPS (40% من E)
  // تحويل NPS (-100 to 100) إلى (0-100)
  const satisfactionScore = (data.npsScore + 100) / 2;
  
  // 2. سرعة معالجة المطالبات (30% من E)
  // الهدف: أقل من 5 أيام = 100، أكثر من 15 يوم = 0
  const processingScore = Math.max(0, 100 - ((data.avgProcessingDays - 5) * 10));
  
  // 3. الوصول للشبكة (30% من E)
  // نسبة المطالبات داخل الشبكة
  const networkScore = data.inNetworkRate;
  
  return (satisfactionScore * 0.40) + (processingScore * 0.30) + (networkScore * 0.30);
}
```

### حساب U (Utilization Efficiency) - 30%

```typescript
function calculateUScore(data: ClientUtilizationData): number {
  // 1. نسبة الأدوية البديلة (25% من U)
  const genericScore = data.genericDrugRate;
  
  // 2. نسبة الموافقة المسبقة (35% من U)
  const preauthScore = data.preauthApprovalRate;
  
  // 3. كفاءة التكلفة (40% من U)
  // مقارنة بمتوسط الصناعة
  const industryAvgCost = 5000; // SAR per member per year
  const costScore = Math.min(100, (industryAvgCost / data.costPerMember) * 100);
  
  return (genericScore * 0.25) + (preauthScore * 0.35) + (costScore * 0.40);
}
```

### تصنيف المخاطر | Risk Classification

```typescript
function classifyRisk(iviScore: number): 'Low' | 'Medium' | 'High' {
  if (iviScore >= 70) return 'Low';
  if (iviScore >= 35) return 'Medium';
  return 'High';
}
```

---

## 6. التحقق من البيانات | Data Validation

```typescript
// server/validation.ts

import { z } from 'zod';

// مخطط التحقق من بيانات الشركات
const corporateClientSchema = z.object({
  contNo: z.string().min(1, 'رقم العقد مطلوب'),
  companyName: z.string().min(2, 'اسم الشركة مطلوب'),
  sector: z.string().optional(),
  region: z.string().optional(),
  employeeCount: z.number().min(0, 'عدد الموظفين يجب أن يكون 0 أو أكثر'),
  premiumAmount: z.number().min(0, 'مبلغ القسط يجب أن يكون 0 أو أكثر'),
  contractStartDate: z.date(),
  contractEndDate: z.date()
}).refine(data => data.contractEndDate > data.contractStartDate, {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
});

// مخطط التحقق من المطالبات
const claimSchema = z.object({
  claimId: z.string().min(1),
  contNo: z.string().min(1),
  memberId: z.string().min(1),
  claimDate: z.date(),
  claimAmount: z.number().positive('مبلغ المطالبة يجب أن يكون موجباً'),
  approvedAmount: z.number().min(0),
  status: z.enum(['Approved', 'Rejected', 'Pending', 'Partial'])
});

// التحقق من مجموعة بيانات
export function validateImportData(
  dataType: 'clients' | 'claims',
  data: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const schema = dataType === 'clients' ? corporateClientSchema : claimSchema;
  
  data.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (!result.success) {
      result.error.errors.forEach(err => {
        errors.push(`Row ${index + 1}: ${err.path.join('.')} - ${err.message}`);
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 7. جدولة التحديث | Update Scheduling

```typescript
// server/scheduler.ts

import cron from 'node-cron';
import { syncFromBupa, recalculateAllIviScores, detectRiskChanges } from './sync';
import { sendRiskAlerts } from './notifications';

// تحديث يومي في الساعة 2 صباحاً
cron.schedule('0 2 * * *', async () => {
  console.log('[Scheduler] Starting daily data sync...');
  
  try {
    // 1. مزامنة البيانات من بوبا
    await syncFromBupa();
    console.log('[Scheduler] Data sync completed');
    
    // 2. إعادة حساب درجات IVI
    await recalculateAllIviScores();
    console.log('[Scheduler] IVI scores recalculated');
    
    // 3. اكتشاف تغييرات المخاطر
    const changes = await detectRiskChanges();
    console.log(`[Scheduler] Detected ${changes.length} risk changes`);
    
    // 4. إرسال التنبيهات
    if (changes.length > 0) {
      await sendRiskAlerts(changes);
      console.log('[Scheduler] Alerts sent');
    }
    
  } catch (error) {
    console.error('[Scheduler] Error:', error);
  }
});

// تحديث أسبوعي للتقارير الشاملة (الأحد 6 صباحاً)
cron.schedule('0 6 * * 0', async () => {
  console.log('[Scheduler] Generating weekly reports...');
  await generateWeeklyReports();
});
```

---

## 8. أمان البيانات | Data Security

### متطلبات الأمان | Security Requirements

| المتطلب | التنفيذ |
|---------|---------|
| تشفير النقل | TLS 1.3 لجميع الاتصالات |
| تشفير التخزين | AES-256 للبيانات الحساسة |
| المصادقة | OAuth 2.0 + JWT |
| التفويض | RBAC (Role-Based Access Control) |
| سجلات التدقيق | جميع العمليات مسجلة |
| النسخ الاحتياطي | يومي مع الاحتفاظ 30 يوم |

### إعدادات الاتصال الآمن | Secure Connection Settings

```env
# .env - إعدادات الأمان

# تشفير قاعدة البيانات
DATABASE_SSL=true
DATABASE_SSL_CA=/path/to/ca-cert.pem

# API Keys (مشفرة)
BUPA_API_KEY=encrypted:xxxxx
BUPA_CLIENT_SECRET=encrypted:xxxxx

# JWT Settings
JWT_SECRET=your-256-bit-secret
JWT_EXPIRY=24h
```

---

## 9. استكشاف الأخطاء | Troubleshooting

### المشاكل الشائعة | Common Issues

| المشكلة | السبب | الحل |
|---------|-------|------|
| فشل الاتصال | إعدادات الشبكة | تحقق من Firewall وVPN |
| بيانات مفقودة | تنسيق خاطئ | راجع تنسيق CSV |
| درجات غير صحيحة | بيانات ناقصة | تحقق من اكتمال البيانات |
| تأخر التحديث | مشكلة الجدولة | راجع سجلات cron |

### سجلات التشخيص | Diagnostic Logs

```bash
# عرض سجلات المزامنة
tail -f /var/log/ivi-dashboard/sync.log

# عرض أخطاء قاعدة البيانات
tail -f /var/log/ivi-dashboard/db-errors.log

# التحقق من حالة الجدولة
systemctl status ivi-scheduler
```

---

## الدعم | Support

للمساعدة في ربط البيانات:

- **الملفات المرجعية:**
  - `server/db.ts` - استعلامات قاعدة البيانات
  - `drizzle/schema.ts` - هيكل الجداول
  - `server/routers.ts` - نقاط النهاية API

- **فريق الدعم:**
  - Ghada | Shahad | Afnan | Yamama | Razan

---

**© 2026 Bupa Arabia - IVI Dashboard**
