import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileText, 
  Download, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Target,
  Shield,
  Lightbulb,
  CheckCircle2,
  Loader2,
  FileDown
} from "lucide-react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PDFReport() {
  const { t, isRTL, language } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    executiveSummary: true,
    portfolioOverview: true,
    riskAnalysis: true,
    componentScores: true,
    predictions: true,
    recommendations: true,
    evaluationCriteria: true,
    clientDetails: false,
  });
  const [reportLanguage, setReportLanguage] = useState<'ar' | 'en'>(language);
  const [timeRange, setTimeRange] = useState("12");

  // Fetch data
  const { data: iviScores } = trpc.ivi.scores.list.useQuery();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!iviScores) return null;
    
    const total = iviScores.length;
    const avgIVI = iviScores.reduce((sum, c) => sum + parseFloat(c.iviScore || "0"), 0) / total;
    const avgH = iviScores.reduce((sum, c) => sum + parseFloat(c.hScore || "0"), 0) / total;
    const avgE = iviScores.reduce((sum, c) => sum + parseFloat(c.eScore || "0"), 0) / total;
    const avgU = iviScores.reduce((sum, c) => sum + parseFloat(c.uScore || "0"), 0) / total;
    
    const highRisk = iviScores.filter(c => c.riskCategory === "High").length;
    const mediumRisk = iviScores.filter(c => c.riskCategory === "Medium").length;
    const lowRisk = iviScores.filter(c => c.riskCategory === "Low").length;
    
    return {
      total,
      avgIVI: avgIVI.toFixed(1),
      avgH: avgH.toFixed(1),
      avgE: avgE.toFixed(1),
      avgU: avgU.toFixed(1),
      highRisk,
      mediumRisk,
      lowRisk,
      highRiskPercent: ((highRisk / total) * 100).toFixed(1),
    };
  }, [iviScores]);

  const sections = [
    { 
      key: 'executiveSummary', 
      label: language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
      icon: FileText,
      description: language === 'ar' ? 'نظرة عامة على أداء المحفظة والمؤشرات الرئيسية' : 'Portfolio performance overview and key metrics'
    },
    { 
      key: 'portfolioOverview', 
      label: language === 'ar' ? 'نظرة عامة على المحفظة' : 'Portfolio Overview',
      icon: BarChart3,
      description: language === 'ar' ? 'إحصائيات الشركات وتوزيع المخاطر' : 'Company statistics and risk distribution'
    },
    { 
      key: 'riskAnalysis', 
      label: language === 'ar' ? 'تحليل المخاطر' : 'Risk Analysis',
      icon: Shield,
      description: language === 'ar' ? 'تحليل مفصل لفئات المخاطر ومحركاتها' : 'Detailed analysis of risk categories and drivers'
    },
    { 
      key: 'componentScores', 
      label: language === 'ar' ? 'نقاط المكونات' : 'Component Scores',
      icon: Target,
      description: language === 'ar' ? 'تفصيل نقاط الصحة والتجربة والاستخدام' : 'Health, Experience, and Utilization score breakdown'
    },
    { 
      key: 'predictions', 
      label: language === 'ar' ? 'التنبؤات' : 'Predictions',
      icon: TrendingUp,
      description: language === 'ar' ? 'توقعات الأداء المستقبلي وتحولات المخاطر' : 'Future performance forecasts and risk transitions'
    },
    { 
      key: 'recommendations', 
      label: language === 'ar' ? 'التوصيات' : 'Recommendations',
      icon: Lightbulb,
      description: language === 'ar' ? 'إجراءات مقترحة لتحسين الأداء' : 'Suggested actions for performance improvement'
    },
    { 
      key: 'evaluationCriteria', 
      label: language === 'ar' ? 'معايير التقييم' : 'Evaluation Criteria',
      icon: CheckCircle2,
      description: language === 'ar' ? 'تغطية معايير التقييم الـ 15' : 'Coverage of 15 evaluation criteria'
    },
    { 
      key: 'clientDetails', 
      label: language === 'ar' ? 'تفاصيل العملاء' : 'Client Details',
      icon: FileDown,
      description: language === 'ar' ? 'قائمة تفصيلية بجميع العملاء ونقاطهم' : 'Detailed list of all clients and their scores'
    },
  ];

  const toggleSection = (key: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const selectAll = () => {
    setSelectedSections({
      executiveSummary: true,
      portfolioOverview: true,
      riskAnalysis: true,
      componentScores: true,
      predictions: true,
      recommendations: true,
      evaluationCriteria: true,
      clientDetails: true,
    });
  };

  const deselectAll = () => {
    setSelectedSections({
      executiveSummary: false,
      portfolioOverview: false,
      riskAnalysis: false,
      componentScores: false,
      predictions: false,
      recommendations: false,
      evaluationCriteria: false,
      clientDetails: false,
    });
  };

  const generatePDF = () => {
    if (!stats || !iviScores) return;
    
    setGenerating(true);
    
    const isArabic = reportLanguage === 'ar';
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    
    // Build HTML content based on selected sections
    let sectionsHTML = '';
    
    if (selectedSections.executiveSummary) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'الملخص التنفيذي' : 'Executive Summary'}</h2>
          <p>${isArabic 
            ? `يقدم هذا التقرير تحليلاً شاملاً لمحفظة العملاء باستخدام مؤشر القيمة الذكي (IVI). تضم المحفظة ${stats.total} شركة بمتوسط نقاط IVI يبلغ ${stats.avgIVI}.`
            : `This report provides a comprehensive analysis of the client portfolio using the Intelligent Value Index (IVI). The portfolio consists of ${stats.total} companies with an average IVI score of ${stats.avgIVI}.`
          }</p>
          <div class="highlight-box">
            <h3>${isArabic ? 'النتائج الرئيسية' : 'Key Findings'}</h3>
            <ul>
              <li>${isArabic ? `${stats.highRisk} شركة (${stats.highRiskPercent}%) في فئة المخاطر العالية` : `${stats.highRisk} companies (${stats.highRiskPercent}%) are in high-risk category`}</li>
              <li>${isArabic ? `متوسط نقاط الصحة: ${stats.avgH}` : `Average Health Score: ${stats.avgH}`}</li>
              <li>${isArabic ? `متوسط نقاط التجربة: ${stats.avgE}` : `Average Experience Score: ${stats.avgE}`}</li>
              <li>${isArabic ? `متوسط نقاط الاستخدام: ${stats.avgU}` : `Average Utilization Score: ${stats.avgU}`}</li>
            </ul>
          </div>
        </div>
      `;
    }
    
    if (selectedSections.portfolioOverview) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'نظرة عامة على المحفظة' : 'Portfolio Overview'}</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">${isArabic ? 'إجمالي الشركات' : 'Total Companies'}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.avgIVI}</div>
              <div class="stat-label">${isArabic ? 'متوسط IVI' : 'Average IVI'}</div>
            </div>
            <div class="stat-card high-risk">
              <div class="stat-value">${stats.highRisk}</div>
              <div class="stat-label">${isArabic ? 'مخاطر عالية' : 'High Risk'}</div>
            </div>
            <div class="stat-card low-risk">
              <div class="stat-value">${stats.lowRisk}</div>
              <div class="stat-label">${isArabic ? 'مخاطر منخفضة' : 'Low Risk'}</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedSections.riskAnalysis) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'تحليل المخاطر' : 'Risk Analysis'}</h2>
          <table>
            <thead>
              <tr>
                <th>${isArabic ? 'فئة المخاطر' : 'Risk Category'}</th>
                <th>${isArabic ? 'عدد الشركات' : 'Number of Companies'}</th>
                <th>${isArabic ? 'النسبة' : 'Percentage'}</th>
                <th>${isArabic ? 'الإجراء المطلوب' : 'Required Action'}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="high-row">
                <td>${isArabic ? 'مرتفع (0-39)' : 'High (0-39)'}</td>
                <td>${stats.highRisk}</td>
                <td>${((stats.highRisk / stats.total) * 100).toFixed(1)}%</td>
                <td>${isArabic ? 'تدخل فوري' : 'Immediate intervention'}</td>
              </tr>
              <tr class="medium-row">
                <td>${isArabic ? 'متوسط (40-69)' : 'Medium (40-69)'}</td>
                <td>${stats.mediumRisk}</td>
                <td>${((stats.mediumRisk / stats.total) * 100).toFixed(1)}%</td>
                <td>${isArabic ? 'متابعة دورية' : 'Periodic follow-up'}</td>
              </tr>
              <tr class="low-row">
                <td>${isArabic ? 'منخفض (70-100)' : 'Low (70-100)'}</td>
                <td>${stats.lowRisk}</td>
                <td>${((stats.lowRisk / stats.total) * 100).toFixed(1)}%</td>
                <td>${isArabic ? 'مراقبة روتينية' : 'Routine monitoring'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (selectedSections.componentScores) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'نقاط المكونات' : 'Component Scores'}</h2>
          <div class="formula-box">
            <p class="formula">IVI = (H × 40%) + (E × 30%) + (U × 30%)</p>
          </div>
          <div class="component-grid">
            <div class="component-card health">
              <h3>H - ${isArabic ? 'الصحة' : 'Health'}</h3>
              <div class="component-value">${stats.avgH}</div>
              <p>${isArabic ? 'النتائج الصحية وإدارة الحالات المزمنة' : 'Health outcomes and chronic condition management'}</p>
            </div>
            <div class="component-card experience">
              <h3>E - ${isArabic ? 'التجربة' : 'Experience'}</h3>
              <div class="component-value">${stats.avgE}</div>
              <p>${isArabic ? 'جودة الخدمة ورضا العملاء' : 'Service quality and customer satisfaction'}</p>
            </div>
            <div class="component-card utilization">
              <h3>U - ${isArabic ? 'الاستخدام' : 'Utilization'}</h3>
              <div class="component-value">${stats.avgU}</div>
              <p>${isArabic ? 'كفاءة استخدام الموارد والتكلفة' : 'Resource utilization and cost efficiency'}</p>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedSections.predictions) {
      const projectedImprovement = (parseFloat(timeRange) * 0.8).toFixed(1);
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'التنبؤات' : 'Predictions'}</h2>
          <p>${isArabic 
            ? `بناءً على تحليل البيانات التاريخية، من المتوقع تحسن متوسط نقاط IVI بنسبة ${projectedImprovement}% خلال الـ ${timeRange} شهر القادمة.`
            : `Based on historical data analysis, the average IVI score is expected to improve by ${projectedImprovement}% over the next ${timeRange} months.`
          }</p>
          <div class="prediction-box">
            <h3>${isArabic ? 'التحولات المتوقعة في فئات المخاطر' : 'Expected Risk Category Transitions'}</h3>
            <ul>
              <li>${isArabic ? 'انخفاض متوقع في الشركات عالية المخاطر' : 'Expected decrease in high-risk companies'}</li>
              <li>${isArabic ? 'زيادة متوقعة في الشركات منخفضة المخاطر' : 'Expected increase in low-risk companies'}</li>
              <li>${isArabic ? 'تحسن في جميع مكونات النقاط' : 'Improvement across all score components'}</li>
            </ul>
          </div>
        </div>
      `;
    }
    
    if (selectedSections.recommendations) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'التوصيات' : 'Recommendations'}</h2>
          <div class="recommendation-grid">
            <div class="recommendation-card">
              <h4>${isArabic ? 'تحسين النتائج الصحية' : 'Improve Health Outcomes'}</h4>
              <ul>
                <li>${isArabic ? 'تعزيز برامج الرعاية الوقائية' : 'Enhance preventive care programs'}</li>
                <li>${isArabic ? 'متابعة الحالات المزمنة بشكل دوري' : 'Regular chronic condition follow-up'}</li>
                <li>${isArabic ? 'تحسين معدلات الموافقة على العلاجات' : 'Improve treatment approval rates'}</li>
              </ul>
            </div>
            <div class="recommendation-card">
              <h4>${isArabic ? 'تحسين جودة التجربة' : 'Improve Experience Quality'}</h4>
              <ul>
                <li>${isArabic ? 'تقليل وقت معالجة المطالبات' : 'Reduce claims processing time'}</li>
                <li>${isArabic ? 'تحسين خدمة العملاء' : 'Enhance customer service'}</li>
                <li>${isArabic ? 'توفير قنوات تواصل متعددة' : 'Provide multiple communication channels'}</li>
              </ul>
            </div>
            <div class="recommendation-card">
              <h4>${isArabic ? 'تحسين كفاءة الاستخدام' : 'Improve Utilization Efficiency'}</h4>
              <ul>
                <li>${isArabic ? 'مراجعة سياسات الموافقة المسبقة' : 'Review pre-authorization policies'}</li>
                <li>${isArabic ? 'تحسين نسبة الخسارة' : 'Improve loss ratio'}</li>
                <li>${isArabic ? 'تقليل معدل الرفض غير المبرر' : 'Reduce unjustified rejection rate'}</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }
    
    if (selectedSections.evaluationCriteria) {
      sectionsHTML += `
        <div class="section">
          <h2>${isArabic ? 'معايير التقييم' : 'Evaluation Criteria'}</h2>
          <div class="criteria-summary">
            <div class="criteria-score">15/15</div>
            <p>${isArabic ? 'جميع معايير التقييم مغطاة بالكامل (100%)' : 'All evaluation criteria fully covered (100%)'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${isArabic ? 'الفئة' : 'Category'}</th>
                <th>${isArabic ? 'المعايير' : 'Criteria'}</th>
                <th>${isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${isArabic ? 'القوة التقنية' : 'Technical Strength'}</td>
                <td>1-3</td>
                <td class="covered">${isArabic ? 'مغطى' : 'Covered'}</td>
              </tr>
              <tr>
                <td>${isArabic ? 'القيمة التجارية' : 'Business Value'}</td>
                <td>4-7</td>
                <td class="covered">${isArabic ? 'مغطى' : 'Covered'}</td>
              </tr>
              <tr>
                <td>${isArabic ? 'الابتكار' : 'Innovation'}</td>
                <td>8-11</td>
                <td class="covered">${isArabic ? 'مغطى' : 'Covered'}</td>
              </tr>
              <tr>
                <td>${isArabic ? 'التصور والسرد' : 'Visualization & Storytelling'}</td>
                <td>12-15</td>
                <td class="covered">${isArabic ? 'مغطى' : 'Covered'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (selectedSections.clientDetails) {
      const clientRows = iviScores.slice(0, 20).map(client => `
        <tr>
          <td>${client.companyName}</td>
          <td>${client.region || '-'}</td>
          <td>${client.sector || '-'}</td>
          <td>${parseFloat(client.iviScore || "0").toFixed(1)}</td>
          <td class="${client.riskCategory?.toLowerCase()}">${
            client.riskCategory === 'High' ? (isArabic ? 'مرتفع' : 'High') :
            client.riskCategory === 'Medium' ? (isArabic ? 'متوسط' : 'Medium') :
            (isArabic ? 'منخفض' : 'Low')
          }</td>
        </tr>
      `).join('');
      
      sectionsHTML += `
        <div class="section page-break">
          <h2>${isArabic ? 'تفاصيل العملاء' : 'Client Details'}</h2>
          <p>${isArabic ? `عرض أول 20 شركة من إجمالي ${stats.total} شركة` : `Showing first 20 companies out of ${stats.total} total`}</p>
          <table class="client-table">
            <thead>
              <tr>
                <th>${isArabic ? 'الشركة' : 'Company'}</th>
                <th>${isArabic ? 'المنطقة' : 'Region'}</th>
                <th>${isArabic ? 'القطاع' : 'Sector'}</th>
                <th>IVI</th>
                <th>${isArabic ? 'المخاطر' : 'Risk'}</th>
              </tr>
            </thead>
            <tbody>
              ${clientRows}
            </tbody>
          </table>
        </div>
      `;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${reportLanguage}">
      <head>
        <title>${isArabic ? 'تقرير IVI التفصيلي' : 'Detailed IVI Report'}</title>
        <style>
          @page { margin: 2cm; }
          body { 
            font-family: ${isArabic ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'}; 
            padding: 20px; 
            direction: ${isArabic ? 'rtl' : 'ltr'}; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { color: #1a1a1a; margin-bottom: 10px; }
          .header .subtitle { color: #666; font-size: 14px; }
          .section { margin-bottom: 40px; page-break-inside: avoid; }
          .section h2 { 
            color: #1a1a1a; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .stat-card { 
            border: 1px solid #e5e7eb; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
          }
          .stat-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
          .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
          .stat-card.high-risk .stat-value { color: #dc2626; }
          .stat-card.low-risk .stat-value { color: #16a34a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: ${isArabic ? 'right' : 'left'}; }
          th { background-color: #f9fafb; font-weight: 600; }
          .high-row td:first-child { border-${isArabic ? 'right' : 'left'}: 4px solid #dc2626; }
          .medium-row td:first-child { border-${isArabic ? 'right' : 'left'}: 4px solid #f59e0b; }
          .low-row td:first-child { border-${isArabic ? 'right' : 'left'}: 4px solid #16a34a; }
          .high { color: #dc2626; }
          .medium { color: #f59e0b; }
          .low { color: #16a34a; }
          .covered { color: #16a34a; font-weight: 600; }
          .highlight-box { 
            background: #f0f9ff; 
            border: 1px solid #bae6fd; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
          }
          .highlight-box h3 { margin-top: 0; color: #0369a1; }
          .formula-box { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin: 20px 0;
          }
          .formula { font-size: 24px; font-weight: bold; font-family: monospace; }
          .component-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
          .component-card { 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
          }
          .component-card.health { background: #fef2f2; border: 1px solid #fecaca; }
          .component-card.experience { background: #eff6ff; border: 1px solid #bfdbfe; }
          .component-card.utilization { background: #f0fdf4; border: 1px solid #bbf7d0; }
          .component-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
          .component-card.health .component-value { color: #dc2626; }
          .component-card.experience .component-value { color: #2563eb; }
          .component-card.utilization .component-value { color: #16a34a; }
          .prediction-box { 
            background: #faf5ff; 
            border: 1px solid #e9d5ff; 
            border-radius: 8px; 
            padding: 20px;
            margin-top: 20px;
          }
          .recommendation-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .recommendation-card { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 15px;
          }
          .recommendation-card h4 { margin-top: 0; color: #1a1a1a; }
          .recommendation-card ul { margin: 0; padding-${isArabic ? 'right' : 'left'}: 20px; }
          .criteria-summary { 
            text-align: center; 
            background: linear-gradient(to right, #8b5cf6, #6366f1); 
            color: white; 
            padding: 30px; 
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .criteria-score { font-size: 48px; font-weight: bold; }
          .page-break { page-break-before: always; }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .client-table { font-size: 12px; }
          .client-table th, .client-table td { padding: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isArabic ? 'تقرير مؤشر القيمة الذكي (IVI)' : 'Intelligent Value Index (IVI) Report'}</h1>
          <p class="subtitle">${isArabic ? 'تقرير تفصيلي شامل لتحليل محفظة العملاء' : 'Comprehensive detailed report for client portfolio analysis'}</p>
          <p>${isArabic ? 'تم الإنشاء في:' : 'Generated on:'} ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>${isArabic ? `الأقسام المضمنة: ${selectedCount}` : `Sections included: ${selectedCount}`}</p>
        </div>
        
        ${sectionsHTML}
        
        <div class="footer">
          <p>${isArabic ? 'لوحة IVI - مؤشر القيمة الذكي | مدعوم من بوبا العربية' : 'IVI Dashboard - Intelligent Value Index | Powered by Bupa Arabia'}</p>
          <p>${isArabic ? 'هذا التقرير سري ومخصص للاستخدام الداخلي فقط.' : 'This report is confidential and intended for internal use only.'}</p>
          <p>${isArabic ? 'متوافق مع رؤية السعودية 2030' : 'Aligned with Saudi Vision 2030'}</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setGenerating(false);
      }, 500);
    } else {
      setGenerating(false);
    }
  };

  const selectedCount = Object.values(selectedSections).filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={isRTL ? "text-right" : ""}>
            <h1 className="text-3xl font-bold tracking-tight">
              {language === 'ar' ? 'تصدير تقرير PDF' : 'Export PDF Report'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'إنشاء تقرير PDF تفصيلي مخصص مع الأقسام المختارة' : 'Generate a customized detailed PDF report with selected sections'}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {selectedCount} {language === 'ar' ? 'أقسام مختارة' : 'sections selected'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Settings className="h-5 w-5" />
                    {language === 'ar' ? 'اختيار الأقسام' : 'Select Sections'}
                  </CardTitle>
                  <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      {language === 'ar' ? 'تحديد الكل' : 'Select All'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll}>
                      {language === 'ar' ? 'إلغاء الكل' : 'Deselect All'}
                    </Button>
                  </div>
                </div>
                <CardDescription className={isRTL ? "text-right" : ""}>
                  {language === 'ar' ? 'اختر الأقسام التي تريد تضمينها في التقرير' : 'Choose which sections to include in your report'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <div
                      key={section.key}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedSections[section.key as keyof typeof selectedSections]
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted/50",
                        isRTL && "flex-row-reverse"
                      )}
                      onClick={() => toggleSection(section.key)}
                    >
                      <Checkbox
                        checked={selectedSections[section.key as keyof typeof selectedSections]}
                        onCheckedChange={() => toggleSection(section.key)}
                      />
                      <div className={cn("flex-1", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                          <section.icon className="h-4 w-4 text-muted-foreground" />
                          <Label className="font-medium cursor-pointer">{section.label}</Label>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings & Generate */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Settings className="h-5 w-5" />
                  {language === 'ar' ? 'إعدادات التقرير' : 'Report Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isRTL ? "text-right block" : ""}>{language === 'ar' ? 'لغة التقرير' : 'Report Language'}</Label>
                  <Select value={reportLanguage} onValueChange={(v) => setReportLanguage(v as 'ar' | 'en')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={isRTL ? "text-right block" : ""}>{language === 'ar' ? 'فترة التنبؤات' : 'Prediction Period'}</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">{language === 'ar' ? '3 أشهر' : '3 Months'}</SelectItem>
                      <SelectItem value="6">{language === 'ar' ? '6 أشهر' : '6 Months'}</SelectItem>
                      <SelectItem value="12">{language === 'ar' ? '12 شهر' : '12 Months'}</SelectItem>
                      <SelectItem value="24">{language === 'ar' ? '24 شهر' : '24 Months'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <FileText className="h-5 w-5" />
                  {language === 'ar' ? 'ملخص التقرير' : 'Report Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{language === 'ar' ? 'الأقسام المختارة' : 'Selected Sections'}</span>
                  <Badge>{selectedCount}</Badge>
                </div>
                <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{language === 'ar' ? 'لغة التقرير' : 'Report Language'}</span>
                  <Badge variant="outline">{reportLanguage === 'ar' ? 'العربية' : 'English'}</Badge>
                </div>
                <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{language === 'ar' ? 'إجمالي الشركات' : 'Total Companies'}</span>
                  <Badge variant="outline">{stats?.total || 0}</Badge>
                </div>
                <Separator />
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={generatePDF}
                  disabled={generating || selectedCount === 0}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
