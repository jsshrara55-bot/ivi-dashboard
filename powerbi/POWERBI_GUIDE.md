# دليل Power BI | Power BI Guide

## نظرة عامة | Overview

هذا الدليل يشرح كيفية استخدام قالب Power BI مع نظام IVI Dashboard.

---

## 1. متطلبات النظام | System Requirements

- Microsoft Power BI Desktop (أحدث إصدار)
- اتصال بقاعدة بيانات IVI
- صلاحيات الوصول للبيانات

---

## 2. خطوات الإعداد | Setup Steps

### الخطوة 1: تحميل القالب

1. افتح Power BI Desktop
2. اختر File → Import → Power BI template
3. حدد ملف `IVI_Dashboard_Template.pbit.json`

### الخطوة 2: إعداد مصدر البيانات

```
Data Source Settings:
- Server: [YOUR_DATABASE_SERVER]
- Database: ivi_dashboard
- Authentication: Database credentials
```

### الخطوة 3: تحديث البيانات

1. اضغط على "Refresh" لتحميل البيانات
2. تحقق من صحة الاتصال
3. احفظ التقرير

---

## 3. الصفحات المتاحة | Available Pages

### النظرة التنفيذية | Executive Overview
- إجمالي العملاء
- متوسط IVI
- عملاء عالي المخاطر
- إجمالي الأقساط
- توزيع المخاطر
- اتجاه IVI

### مكونات IVI | IVI Components
- مقياس H Score
- مقياس E Score
- مقياس U Score
- رادار IVI
- جدول التفاصيل

### تحليل المخاطر | Risk Analysis
- مصفوفة المخاطر
- المخاطر حسب القطاع
- IVI مقابل الأقساط

### التنبؤات | Predictions
- معدل الاحتفاظ
- توقعات IVI
- العملاء المعرضين للخطر

### تحليل المطالبات | Claims Analysis
- إجمالي المطالبات
- نسبة الموافقة
- المطالبات حسب الحالة
- المطالبات حسب النوع

---

## 4. المقاييس الرئيسية | Key Measures

| المقياس | الوصف | الصيغة |
|---------|-------|--------|
| Average IVI Score | متوسط درجة IVI | `AVERAGE(IVIScores[IVIScore])` |
| High Risk Count | عدد العملاء عالي المخاطر | `COUNTROWS(FILTER(...))` |
| Total Premium | إجمالي الأقساط | `SUM(CorporateClients[PremiumAmount])` |
| Retention Rate | معدل الاحتفاظ | `AVERAGE(Predictions[RetentionProbability])` |
| Approval Rate | نسبة الموافقة | `DIVIDE(Approved, Total)` |

---

## 5. تخصيص التقرير | Customization

### تغيير الألوان
1. اذهب إلى View → Themes
2. اختر "Customize current theme"
3. عدّل الألوان حسب هوية بوبا

### إضافة صفحات جديدة
1. اضغط على "+" لإضافة صفحة
2. اسحب العناصر المرئية من القائمة
3. اربط البيانات بالعناصر

---

## 6. النشر والمشاركة | Publishing

### النشر على Power BI Service
1. File → Publish → Publish to Power BI
2. اختر Workspace المناسب
3. شارك الرابط مع الفريق

### جدولة التحديث التلقائي
1. اذهب إلى Settings → Scheduled refresh
2. حدد التكرار (يومي/أسبوعي)
3. فعّل التحديث التلقائي

---

## 7. استكشاف الأخطاء | Troubleshooting

| المشكلة | الحل |
|---------|------|
| فشل الاتصال | تحقق من إعدادات الشبكة |
| بيانات قديمة | اضغط Refresh |
| أخطاء في المقاييس | راجع صيغ DAX |

---

## الدعم | Support

للمساعدة التقنية، تواصل مع فريق التطوير.

---

**Team: Ghada | Shahad | Afnan | Yamama | Razan**

*Bupa Arabia - IVI Dashboard*
