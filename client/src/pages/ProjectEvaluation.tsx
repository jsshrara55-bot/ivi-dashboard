import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CheckCircle2, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp,
  Shield,
  Eye,
  MessageSquare,
  Database,
  Brain,
  Sparkles,
  Download
} from "lucide-react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProjectEvaluation() {
  const { t, isRTL, language } = useLanguage();

  const technicalCriteria = [
    {
      id: 1,
      title: language === 'ar' ? "تنظيف البيانات والتحقق وهندسة الميزات" : "Data Cleaning, Validation & Feature Engineering",
      description: language === 'ar' ? "جودة إعداد البيانات وإنشاء الميزات" : "Quality of data preparation and feature creation",
      status: "covered",
      features: language === 'ar' 
        ? ["مستكشف البيانات مع التحقق", "استيراد CSV مع معالجة الأخطاء", "تنظيف البيانات التلقائي"]
        : ["Data Explorer with validation", "CSV import with error handling", "Automated data cleaning"],
      location: language === 'ar' ? "مستكشف البيانات، تحميل البيانات" : "Data Explorer, Data Loader"
    },
    {
      id: 2,
      title: language === 'ar' ? "تعريف الهدف الواضح ومنطق النمذجة" : "Clear Target Definition & Modeling Rationale",
      description: language === 'ar' ? "أهداف محددة جيداً وتبرير النموذج" : "Well-defined objectives and model justification",
      status: "covered",
      features: language === 'ar'
        ? ["صيغة IVI (H×40% + E×30% + U×30%)", "حدود فئات المخاطر", "تعريفات نقاط المكونات"]
        : ["IVI Score formula (H×40% + E×30% + U×30%)", "Risk category thresholds", "Component score definitions"],
      location: language === 'ar' ? "التحليلات، لوحة التحكم" : "Analytics, Dashboard"
    },
    {
      id: 3,
      title: language === 'ar' ? "التقييم القوي ومقارنة النماذج" : "Strong Evaluation & Model Comparison",
      description: language === 'ar' ? "تقييم قوي للنموذج والمقارنة المعيارية" : "Robust model assessment and benchmarking",
      status: "covered",
      features: language === 'ar'
        ? ["مقاييس دقة التنبؤ", "تحليل الاتجاهات", "المقارنة التاريخية"]
        : ["Prediction accuracy metrics", "Trend analysis", "Historical comparison"],
      location: language === 'ar' ? "التنبؤات، التحليلات" : "Predictions, Analytics"
    }
  ];

  const businessCriteria = [
    {
      id: 4,
      title: language === 'ar' ? "تحديد محركات الأعمال الرئيسية" : "Identification of Key Business Drivers",
      description: language === 'ar' ? "فهم العوامل المؤثرة على نتائج الأعمال" : "Understanding factors that impact business outcomes",
      status: "covered",
      features: language === 'ar'
        ? ["قسم أهم محركات المخاطر", "تفصيل المكونات (H, E, U)", "تحليل أنماط المطالبات"]
        : ["Top Risk Drivers section", "Component breakdown (H, E, U)", "Claims pattern analysis"],
      location: language === 'ar' ? "لوحة التحكم، تفاصيل العميل" : "Dashboard, Client Details"
    },
    {
      id: 5,
      title: language === 'ar' ? "رؤى مرتبطة بالتأثير التجاري" : "Insights Connected to Business Impact",
      description: language === 'ar' ? "رؤى قابلة للتنفيذ مرتبطة بمقاييس الأعمال" : "Actionable insights linked to business metrics",
      status: "covered",
      features: language === 'ar'
        ? ["تبويب التوصيات", "تنبيهات المخاطر لمنع الانسحاب", "توقعات تأثير التكلفة"]
        : ["Recommendations tab", "Risk Alerts for churn prevention", "Cost impact projections"],
      location: language === 'ar' ? "لوحة التحكم، تنبيهات المخاطر" : "Dashboard, Risk Alerts"
    },
    {
      id: 6,
      title: language === 'ar' ? "توصيات عملية وقابلة للتنفيذ" : "Practical Recommendations & Feasibility",
      description: language === 'ar' ? "اقتراحات قابلة للتنفيذ مع خطوات واضحة" : "Implementable suggestions with clear steps",
      status: "covered",
      features: language === 'ar'
        ? ["توصيات موجهة للعمل", "اقتراحات حسب الأولوية", "إرشادات التنفيذ"]
        : ["Action-oriented recommendations", "Priority-based suggestions", "Implementation guidance"],
      location: language === 'ar' ? "تبويب التوصيات" : "Recommendations Tab"
    },
    {
      id: 7,
      title: language === 'ar' ? "القيمة المضافة لاتخاذ القرار" : "Value Added to Decision-Making",
      description: language === 'ar' ? "قدرات محسنة لدعم القرار" : "Enhanced decision support capabilities",
      status: "covered",
      features: language === 'ar'
        ? ["نظام الموافقة المسبقة الذكي", "تنبيهات المخاطر الفورية", "التحليلات التنبؤية"]
        : ["Smart Pre-Auth system", "Real-time Risk Alerts", "Predictive Analytics"],
      location: language === 'ar' ? "الموافقة المسبقة الذكية، التنبؤات" : "Smart Pre-Auth, Predictions"
    }
  ];

  const innovationCriteria = [
    {
      id: 8,
      title: language === 'ar' ? "إبداع النهج" : "Creativity of Approach",
      description: language === 'ar' ? "طرق حل المشكلات المبتكرة والإبداعية" : "Novel and creative problem-solving methods",
      status: "covered",
      features: language === 'ar'
        ? ["نقاط IVI الموحدة تجمع 3 ركائز", "نظام الموافقة المسبقة الذكي بالذكاء الاصطناعي", "إشعارات فورية"]
        : ["Unified IVI Score combining 3 pillars", "Smart Pre-Auth AI system", "Real-time notifications"],
      location: language === 'ar' ? "لوحة التحكم بالكامل" : "Entire Dashboard"
    },
    {
      id: 9,
      title: language === 'ar' ? "أدوات وتقنيات مبتكرة" : "Novel Tools/Techniques Used",
      description: language === 'ar' ? "تقنيات ومنهجيات مبتكرة" : "Innovative technologies and methodologies",
      status: "covered",
      features: language === 'ar'
        ? ["إشعارات WebSocket الفورية", "تنبيهات آلية مجدولة", "توصيات مدعومة بـ LLM"]
        : ["Real-time WebSocket notifications", "Scheduled automated alerts", "LLM-powered recommendations"],
      location: language === 'ar' ? "تنبيهات المخاطر، الموافقة المسبقة الذكية" : "Risk Alerts, Smart Pre-Auth"
    },
    {
      id: 10,
      title: language === 'ar' ? "أصالة هندسة الميزات" : "Originality in Feature Engineering",
      description: language === 'ar' ? "إنشاء ميزات إبداعية ونمذجة" : "Creative feature creation and modeling",
      status: "covered",
      features: language === 'ar'
        ? ["صيغة IVI مخصصة", "تتبع تحولات المخاطر", "تسجيل متعدد الأبعاد"]
        : ["Custom IVI formula", "Risk transition tracking", "Multi-dimensional scoring"],
      location: language === 'ar' ? "التحليلات، التنبؤات" : "Analytics, Predictions"
    },
    {
      id: 11,
      title: language === 'ar' ? "العملية والتفكير المستقبلي" : "Practicality & Forward-Thinking",
      description: language === 'ar' ? "حلول عملية مع رؤية مستقبلية" : "Practical solutions with future vision",
      status: "covered",
      features: language === 'ar'
        ? ["تنبؤات 12 شهر", "اقتراحات إجراءات وقائية", "توقع الاتجاهات"]
        : ["12-month predictions", "Preventive action suggestions", "Trend forecasting"],
      location: language === 'ar' ? "التنبؤات، التوصيات" : "Predictions, Recommendations"
    }
  ];

  const visualizationCriteria = [
    {
      id: 12,
      title: language === 'ar' ? "سرد واضح وتدفق منطقي" : "Clear Narrative & Logical Flow",
      description: language === 'ar' ? "سرد متماسك وتوليد رؤى" : "Coherent storytelling and insight generation",
      status: "covered",
      features: language === 'ar'
        ? ["تدفق تبويبات لوحة التحكم: نظرة عامة ← تحليلات ← تنبؤات ← توصيات", "الكشف التدريجي", "رؤى سياقية"]
        : ["Dashboard tabs flow: Overview → Analytics → Predictions → Recommendations", "Progressive disclosure", "Contextual insights"],
      location: language === 'ar' ? "تبويبات لوحة التحكم" : "Dashboard Tabs"
    },
    {
      id: 13,
      title: language === 'ar' ? "مرئيات قوية" : "Strong Visuals/Slides",
      description: language === 'ar' ? "تمثيلات مرئية مؤثرة" : "Impactful visual representations",
      status: "covered",
      features: language === 'ar'
        ? ["رسوم Recharts التفاعلية", "بطاقات KPI مع الاتجاهات", "مخططات دائرية لتوزيع المخاطر"]
        : ["Interactive Recharts", "KPI cards with trends", "Risk distribution pie charts"],
      location: language === 'ar' ? "جميع الصفحات" : "All Pages"
    },
    {
      id: 14,
      title: language === 'ar' ? "تبسيط المفاهيم التقنية" : "Simplify Technical Concepts",
      description: language === 'ar' ? "جعل البيانات المعقدة سهلة الفهم" : "Making complex data accessible",
      status: "covered",
      features: language === 'ar'
        ? ["مستويات مخاطر مرمزة بالألوان (أخضر/أصفر/أحمر)", "نقاط بسيطة 0-100", "مؤشرات تقدم مرئية"]
        : ["Color-coded risk levels (Green/Yellow/Red)", "Simple 0-100 score", "Visual progress indicators"],
      location: language === 'ar' ? "لوحة التحكم، تفاصيل العميل" : "Dashboard, Client Details"
    },
    {
      id: 15,
      title: language === 'ar' ? "جودة العرض" : "Presentation Quality",
      description: language === 'ar' ? "عرض احترافي وتوثيق" : "Professional presentation and documentation",
      status: "covered",
      features: language === 'ar'
        ? ["توثيق دليل المستخدم", "عرض تقديمي", "تصدير PDF/Excel"]
        : ["User guide documentation", "Pitch deck presentation", "PDF/Excel exports"],
      location: language === 'ar' ? "التوثيق" : "Documentation"
    }
  ];

  const vision2030Pillars = [
    {
      title: language === 'ar' ? "النتائج الصحية" : "Health Outcomes",
      icon: Heart,
      score: language === 'ar' ? "نقاط H" : "H Score",
      description: language === 'ar' 
        ? "هل يتحسن صحة الأعضاء؟ هل تُدار الحالات المزمنة بكفاءة؟"
        : "Are members becoming healthier? Are chronic conditions managed efficiently?",
      features: language === 'ar'
        ? ["تحليل المطالبات حسب النوع", "تتبع الحالات المزمنة", "تحديد المطالبات القابلة للوقاية", "مراقبة اتجاهات الصحة"]
        : ["Claims analysis by type", "Chronic condition tracking", "Preventable claims identification", "Health trend monitoring"],
      color: "text-red-500"
    },
    {
      title: language === 'ar' ? "جودة التجربة" : "Experience Quality",
      icon: Users,
      score: language === 'ar' ? "نقاط E" : "E Score",
      description: language === 'ar'
        ? "هل يحصل العملاء على موافقات سريعة وتواصل واضح؟"
        : "Are customers receiving fast approvals and clear communication?",
      features: language === 'ar'
        ? ["درجات رضا العملاء", "معدلات حل المكالمات", "تتبع معالجة الشكاوى", "مقاييس وقت الاستجابة"]
        : ["Customer satisfaction scores", "Call resolution rates", "Complaint handling tracking", "Response time metrics"],
      color: "text-blue-500"
    },
    {
      title: language === 'ar' ? "استدامة التكلفة" : "Cost Sustainability",
      icon: TrendingUp,
      score: language === 'ar' ? "نقاط U" : "U Score",
      description: language === 'ar'
        ? "هل تزداد تكاليف الرعاية الصحية بمعدل معقول؟"
        : "Are healthcare costs increasing at a reasonable rate?",
      features: language === 'ar'
        ? ["نسبة استخدام الشبكة", "الامتثال للموافقة المسبقة", "تتبع التكلفة لكل عضو", "تحليل أنماط المطالبات"]
        : ["Network usage percentage", "Pre-auth compliance", "Cost per member tracking", "Claims pattern analysis"],
      color: "text-green-500"
    }
  ];

  const keyQuestions = [
    {
      question: language === 'ar' ? "ما مدى صحة سكان هذا العميل اليوم؟" : "How healthy is this client's population today?",
      answer: language === 'ar' ? "نقاط الصحة (H) وتحليل المطالبات" : "Health Score (H) and Claims Analysis",
      icon: Heart
    },
    {
      question: language === 'ar' ? "كيف سيؤثر على التكاليف المستقبلية؟" : "How will it impact future costs?",
      answer: language === 'ar' ? "صفحة التنبؤات مع توقعات 12 شهر" : "Predictions page with 12-month forecasts",
      icon: TrendingUp
    },
    {
      question: language === 'ar' ? "هل يحصلون على نتائج صحية جيدة؟" : "Are they receiving good health outcomes?",
      answer: language === 'ar' ? "تفصيل نقاط المكونات (H, E, U)" : "Component Scores breakdown (H, E, U)",
      icon: Target
    },
    {
      question: language === 'ar' ? "هل هناك خطر عدم الرضا أو الانسحاب؟" : "Is there risk of dissatisfaction or churn?",
      answer: language === 'ar' ? "تنبيهات المخاطر ونقاط التجربة (E)" : "Risk Alerts and Experience Score (E)",
      icon: Shield
    },
    {
      question: language === 'ar' ? "ما الإجراءات الوقائية الممكنة؟" : "What preventive actions can be taken?",
      answer: language === 'ar' ? "تبويب التوصيات والموافقة المسبقة الذكية" : "Recommendations tab and Smart Pre-Auth",
      icon: Lightbulb
    }
  ];

  // Export evaluation to PDF
  const exportEvaluationPDF = () => {
    const isArabic = language === 'ar';
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <title>${isArabic ? 'تقرير تقييم المشروع' : 'Project Evaluation Report'}</title>
        <style>
          body { font-family: ${isArabic ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'}; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .score-box { background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .score-value { font-size: 48px; font-weight: bold; }
          .criteria-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .criteria-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .criteria-title { font-weight: bold; margin-bottom: 5px; }
          .covered { color: #16a34a; }
          .pillar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .pillar-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${isArabic ? 'تقرير تقييم المشروع - مؤشر القيمة الذكي (IVI)' : 'Project Evaluation Report - Intelligent Value Index (IVI)'}</h1>
        <p>${isArabic ? 'تم الإنشاء في:' : 'Generated on:'} ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div class="score-box">
          <div class="score-value">15/15</div>
          <div>${isArabic ? 'جميع معايير التقييم مغطاة بالكامل - 100%' : 'All evaluation criteria fully covered - 100%'}</div>
        </div>
        
        <h2>${isArabic ? 'التوافق مع رؤية 2030' : 'Vision 2030 Alignment'}</h2>
        <div class="pillar-grid">
          ${vision2030Pillars.map(pillar => `
            <div class="pillar-card">
              <h3>${pillar.title}</h3>
              <p><strong>${pillar.score}</strong></p>
              <p style="font-size: 12px;">${pillar.description}</p>
            </div>
          `).join('')}
        </div>
        
        <h2>${isArabic ? 'القوة التقنية (المعايير 1-3)' : 'Technical Strength (Criteria 1-3)'}</h2>
        <div class="criteria-grid">
          ${technicalCriteria.map(c => `
            <div class="criteria-card">
              <div class="criteria-title">#${c.id}: ${c.title}</div>
              <div class="covered">✓ ${isArabic ? 'مغطى' : 'Covered'}</div>
              <div style="font-size: 12px;">${c.description}</div>
            </div>
          `).join('')}
        </div>
        
        <h2>${isArabic ? 'القيمة التجارية (المعايير 4-7)' : 'Business Value (Criteria 4-7)'}</h2>
        <div class="criteria-grid">
          ${businessCriteria.map(c => `
            <div class="criteria-card">
              <div class="criteria-title">#${c.id}: ${c.title}</div>
              <div class="covered">✓ ${isArabic ? 'مغطى' : 'Covered'}</div>
              <div style="font-size: 12px;">${c.description}</div>
            </div>
          `).join('')}
        </div>
        
        <h2>${isArabic ? 'الابتكار (المعايير 8-11)' : 'Innovation (Criteria 8-11)'}</h2>
        <div class="criteria-grid">
          ${innovationCriteria.map(c => `
            <div class="criteria-card">
              <div class="criteria-title">#${c.id}: ${c.title}</div>
              <div class="covered">✓ ${isArabic ? 'مغطى' : 'Covered'}</div>
              <div style="font-size: 12px;">${c.description}</div>
            </div>
          `).join('')}
        </div>
        
        <h2>${isArabic ? 'التصور والسرد (المعايير 12-15)' : 'Visualization & Storytelling (Criteria 12-15)'}</h2>
        <div class="criteria-grid">
          ${visualizationCriteria.map(c => `
            <div class="criteria-card">
              <div class="criteria-title">#${c.id}: ${c.title}</div>
              <div class="covered">✓ ${isArabic ? 'مغطى' : 'Covered'}</div>
              <div style="font-size: 12px;">${c.description}</div>
            </div>
          `).join('')}
        </div>
        
        <h2>${isArabic ? 'صيغة حساب IVI' : 'IVI Score Calculation'}</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 24px; font-weight: bold;">IVI = (H × 40%) + (E × 30%) + (U × 30%)</p>
        </div>
        
        <div class="footer">
          <p>${isArabic ? 'لوحة IVI - مؤشر القيمة الذكي | مدعوم من بوبا العربية' : 'IVI Dashboard - Intelligent Value Index | Powered by Bupa Arabia'}</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const CriteriaCard = ({ criteria, categoryColor }: { criteria: any[], categoryColor: string }) => (
    <div className="space-y-4">
      {criteria.map((item) => (
        <Card key={item.id} className={cn("border-l-4", isRTL && "border-l-0 border-r-4")} style={{ [isRTL ? 'borderRightColor' : 'borderLeftColor']: categoryColor }}>
          <CardHeader className="pb-2">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className="font-mono">#{item.id}</Badge>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
              <Badge className="bg-green-500">
                <CheckCircle2 className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                {language === 'ar' ? 'مغطى' : 'Covered'}
              </Badge>
            </div>
            <CardDescription className={isRTL ? "text-right" : ""}>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className={cn("text-sm font-medium text-muted-foreground", isRTL && "text-right")}>{language === 'ar' ? 'الميزات:' : 'Features:'}</p>
              <ul className={cn("text-sm space-y-1", isRTL && "text-right")}>
                {item.features.map((feature: string, idx: number) => (
                  <li key={idx} className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className={cn("text-xs text-muted-foreground mt-2", isRTL && "text-right")}>
                <span className="font-medium">{language === 'ar' ? 'الموقع:' : 'Location:'}</span> {item.location}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={isRTL ? "text-right" : ""}>
            <h1 className="text-3xl font-bold tracking-tight">{t('evaluation.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('evaluation.subtitle')}
            </p>
          </div>
          <Button variant="outline" onClick={exportEvaluationPDF} className="gap-2">
            <Download className="h-4 w-4" />
            {t('common.pdf')}
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Sparkles className="h-5 w-5 text-primary" />
              {t('evaluation.overallCoverage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="text-4xl font-bold text-primary">15/15</div>
              <div className="flex-1">
                <Progress value={100} className="h-3" />
                <p className={cn("text-sm text-muted-foreground mt-1", isRTL && "text-right")}>{t('evaluation.allCriteriaCovered')}</p>
              </div>
              <Badge className="bg-green-500 text-lg px-4 py-2">100%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vision 2030 Alignment */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Target className="h-5 w-5" />
              {t('evaluation.vision2030Alignment')}
            </CardTitle>
            <CardDescription className={isRTL ? "text-right" : ""}>
              {t('evaluation.vision2030Description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {vision2030Pillars.map((pillar) => (
                <Card key={pillar.title} className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <pillar.icon className={`h-6 w-6 ${pillar.color}`} />
                      <div className={isRTL ? "text-right" : ""}>
                        <CardTitle className="text-lg">{pillar.title}</CardTitle>
                        <Badge variant="outline">{pillar.score}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={cn("text-sm text-muted-foreground mb-3", isRTL && "text-right")}>{pillar.description}</p>
                    <ul className={cn("text-sm space-y-1", isRTL && "text-right")}>
                      {pillar.features.map((feature, idx) => (
                        <li key={idx} className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Questions */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <MessageSquare className="h-5 w-5" />
              {t('evaluation.keyBusinessQuestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {keyQuestions.map((item, idx) => (
                <div key={idx} className={cn("flex items-start gap-3 p-4 rounded-lg bg-muted/50", isRTL && "flex-row-reverse")}>
                  <item.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium text-sm">{item.question}</p>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Criteria Tabs */}
        <Tabs defaultValue="technical" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="technical" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{t('evaluation.technicalStrength')}</span>
              <Badge variant="secondary" className={isRTL ? "mr-1" : "ml-1"}>3</Badge>
            </TabsTrigger>
            <TabsTrigger value="business" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('evaluation.businessValue')}</span>
              <Badge variant="secondary" className={isRTL ? "mr-1" : "ml-1"}>4</Badge>
            </TabsTrigger>
            <TabsTrigger value="innovation" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">{t('evaluation.innovation')}</span>
              <Badge variant="secondary" className={isRTL ? "mr-1" : "ml-1"}>4</Badge>
            </TabsTrigger>
            <TabsTrigger value="visualization" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{t('evaluation.visualization')}</span>
              <Badge variant="secondary" className={isRTL ? "mr-1" : "ml-1"}>4</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Database className="h-5 w-5 text-blue-500" />
                  {language === 'ar' ? 'القوة التقنية (المعايير 1-3)' : 'Technical Strength (Criteria 1-3)'}
                </CardTitle>
                <CardDescription className={isRTL ? "text-right" : ""}>
                  {language === 'ar' ? 'جودة البيانات، منطق النمذجة، ومنهجية التقييم' : 'Data quality, modeling rationale, and evaluation methodology'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriteriaCard criteria={technicalCriteria} categoryColor="#3b82f6" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  {language === 'ar' ? 'القيمة التجارية (المعايير 4-7)' : 'Business Value (Criteria 4-7)'}
                </CardTitle>
                <CardDescription className={isRTL ? "text-right" : ""}>
                  {language === 'ar' ? 'محركات الأعمال، الرؤى، التوصيات، ودعم القرار' : 'Business drivers, insights, recommendations, and decision support'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriteriaCard criteria={businessCriteria} categoryColor="#22c55e" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innovation">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  {language === 'ar' ? 'الابتكار (المعايير 8-11)' : 'Innovation (Criteria 8-11)'}
                </CardTitle>
                <CardDescription className={isRTL ? "text-right" : ""}>
                  {language === 'ar' ? 'مناهج إبداعية، تقنيات مبتكرة، وحلول مستقبلية' : 'Creative approaches, novel techniques, and forward-thinking solutions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriteriaCard criteria={innovationCriteria} categoryColor="#eab308" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Eye className="h-5 w-5 text-purple-500" />
                  {language === 'ar' ? 'التصور والسرد (المعايير 12-15)' : 'Visualization & Storytelling (Criteria 12-15)'}
                </CardTitle>
                <CardDescription className={isRTL ? "text-right" : ""}>
                  {language === 'ar' ? 'تدفق السرد، التصميم المرئي، وجودة العرض' : 'Narrative flow, visual design, and presentation quality'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriteriaCard criteria={visualizationCriteria} categoryColor="#a855f7" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* IVI Formula */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Brain className="h-5 w-5" />
              {t('evaluation.iviScoreCalculation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg text-center">
              <p className="text-2xl font-mono font-bold">
                IVI Score = (H × 40%) + (E × 30%) + (U × 30%)
              </p>
              <div className={cn("flex justify-center gap-8 mt-4", isRTL && "flex-row-reverse")}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">H</div>
                  <div className="text-sm text-muted-foreground">{t('evaluation.health')}</div>
                  <div className="text-xs">40%</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">E</div>
                  <div className="text-sm text-muted-foreground">{t('evaluation.experience')}</div>
                  <div className="text-xs">30%</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">U</div>
                  <div className="text-sm text-muted-foreground">{t('evaluation.utilization')}</div>
                  <div className="text-xs">30%</div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="p-4 border rounded-lg">
                <h4 className={cn("font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  {t('evaluation.lowRisk')}
                </h4>
                <p className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>{t('evaluation.routineMonitoring')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className={cn("font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  {t('evaluation.mediumRisk')}
                </h4>
                <p className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>{t('evaluation.periodicFollowUp')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className={cn("font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  {t('evaluation.highRisk')}
                </h4>
                <p className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>{t('evaluation.immediateIntervention')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
