# دليل ربط البيانات الحقيقية | Real Data Integration Guide

## نظرة عامة | Overview

هذا الدليل يشرح كيفية ربط بيانات بوبا الحقيقية مع نظام IVI Dashboard.

This guide explains how to connect real Bupa data with the IVI Dashboard system.

---

## 1. هيكل البيانات المطلوب | Required Data Structure

### جدول الشركات العميلة | Corporate Clients Table

```sql
CREATE TABLE corporate_clients (
  cont_no VARCHAR(50) PRIMARY KEY,      -- رقم العقد
  company_name VARCHAR(255),            -- اسم الشركة
  sector VARCHAR(100),                  -- القطاع
  region VARCHAR(100),                  -- المنطقة
  employee_count INT,                   -- عدد الموظفين
  premium_amount DECIMAL(15,2),         -- مبلغ القسط
  contract_start_date DATE,             -- تاريخ بداية العقد
  contract_end_date DATE                -- تاريخ نهاية العقد
);
```

### جدول درجات IVI | IVI Scores Table

```sql
CREATE TABLE ivi_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cont_no VARCHAR(50),                  -- رقم العقد
  h_score DECIMAL(5,2),                 -- درجة الصحة (0-100)
  e_score DECIMAL(5,2),                 -- درجة التجربة (0-100)
  u_score DECIMAL(5,2),                 -- درجة الاستخدام (0-100)
  ivi_score DECIMAL(5,2),               -- درجة IVI الإجمالية
  risk_category ENUM('Low', 'Medium', 'High'),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول المطالبات | Claims Table

```sql
CREATE TABLE claims (
  claim_id VARCHAR(50) PRIMARY KEY,
  cont_no VARCHAR(50),
  member_id VARCHAR(50),
  claim_date DATE,
  claim_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2),
  status ENUM('Approved', 'Rejected', 'Pending'),
  claim_type VARCHAR(100),
  provider_id VARCHAR(50)
);
```

### جدول الأعضاء | Members Table

```sql
CREATE TABLE members (
  member_id VARCHAR(50) PRIMARY KEY,
  cont_no VARCHAR(50),
  age INT,
  gender ENUM('M', 'F'),
  has_chronic_disease BOOLEAN,
  chronic_disease_type VARCHAR(255)
);
```

---

## 2. طرق استيراد البيانات | Data Import Methods

### الطريقة 1: استيراد CSV | Method 1: CSV Import

1. قم بتصدير البيانات من نظام بوبا بصيغة CSV
2. استخدم صفحة Data Loader في الداشبورد
3. ارفع الملفات وفق الترتيب التالي:
   - Corporate Clients
   - Members
   - Claims
   - IVI Scores

### الطريقة 2: API Integration | Method 2: API Integration

```typescript
// server/routers.ts - إضافة endpoint للاستيراد المباشر

import: adminProcedure
  .input(z.object({
    dataType: z.enum(['clients', 'members', 'claims', 'scores']),
    data: z.array(z.any())
  }))
  .mutation(async ({ input }) => {
    // استيراد البيانات مباشرة من API بوبا
    switch(input.dataType) {
      case 'clients':
        await bulkInsertCorporateClients(input.data);
        break;
      case 'members':
        await bulkInsertMembers(input.data);
        break;
      case 'claims':
        await bulkInsertClaims(input.data);
        break;
      case 'scores':
        await bulkInsertIviScores(input.data);
        break;
    }
    return { success: true };
  })
```

### الطريقة 3: Database Connection | Method 3: Database Connection

```env
# .env - إعدادات الاتصال بقاعدة بيانات بوبا
BUPA_DB_HOST=your-bupa-db-host
BUPA_DB_PORT=3306
BUPA_DB_USER=your-username
BUPA_DB_PASSWORD=your-password
BUPA_DB_NAME=bupa_data
```

---

## 3. حساب درجات IVI | IVI Score Calculation

### الصيغة | Formula

```
IVI Score = (H × 0.40) + (E × 0.30) + (U × 0.30)
```

### حساب H (Health Outcomes)

```sql
H = 100 - (
  (chronic_disease_rate × 30) +
  (loss_ratio × 40) +
  (mortality_rate × 30)
)
```

### حساب E (Experience Quality)

```sql
E = (
  (satisfaction_score × 40) +
  (claims_processing_speed × 30) +
  (network_access_score × 30)
)
```

### حساب U (Utilization Efficiency)

```sql
U = (
  (preventive_care_rate × 35) +
  (generic_drug_usage × 25) +
  (cost_efficiency_score × 40)
)
```

---

## 4. جدولة التحديث التلقائي | Automatic Update Scheduling

```typescript
// server/scheduler.ts - جدولة تحديث البيانات

import cron from 'node-cron';

// تحديث يومي في الساعة 2 صباحاً
cron.schedule('0 2 * * *', async () => {
  console.log('Starting daily IVI score recalculation...');
  await recalculateAllIviScores();
  await detectRiskChanges();
  await sendAlerts();
});
```

---

## 5. التحقق من البيانات | Data Validation

```typescript
// التحقق من صحة البيانات قبل الاستيراد
const validateClientData = (data: any[]) => {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    if (!row.cont_no) errors.push(`Row ${index}: Missing cont_no`);
    if (!row.company_name) errors.push(`Row ${index}: Missing company_name`);
    if (row.employee_count < 0) errors.push(`Row ${index}: Invalid employee_count`);
  });
  
  return errors;
};
```

---

## 6. أمان البيانات | Data Security

- جميع البيانات مشفرة أثناء النقل (TLS/SSL)
- الوصول محمي بنظام المصادقة
- سجلات التدقيق لجميع العمليات
- نسخ احتياطية يومية

---

## الدعم | Support

للمساعدة في ربط البيانات:
- راجع ملف `server/db.ts` للاستعلامات
- راجع ملف `drizzle/schema.ts` لهيكل الجداول

---

**Team: Ghada | Shahad | Afnan | Yamama | Razan**

*Bupa Arabia - IVI Dashboard*
