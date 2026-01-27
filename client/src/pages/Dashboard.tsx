import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureImportanceChart, IVIForecastChart, IVITrendChart, KPICard, RiskDistributionChart, ScoresComparisonChart, ThresholdAlertIndicator } from "@/components/DashboardComponents";
import { IVIRadarChart, IVIBridgeDiagram, RiskDriversRadar } from "@/components/IVIRadarAndBridge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureImportance, fetchCsvData, FuturePrediction, IVIScore, Recommendation } from "@/lib/csv";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity, AlertTriangle, BarChart3, Building2, Download, FileSpreadsheet, FileText, Filter, Phone, TrendingUp, Users } from "lucide-react";
import * as XLSX from 'xlsx';
import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const { t, isRTL, language } = useLanguage();
  const [iviScores, setIviScores] = useState<IVIScore[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Fetch summary from API
  const { data: iviSummary } = trpc.ivi.summary.useQuery();
  const { data: claimsStats } = trpc.ivi.claims.stats.useQuery();
  const { data: callStats } = trpc.ivi.calls.stats.useQuery();
  const { data: preAuthStats } = trpc.ivi.insurancePreAuths.stats.useQuery();
  const { data: providerStats } = trpc.ivi.providers.stats.useQuery();
  const { data: dbIviScores } = trpc.ivi.scores.list.useQuery();

  useEffect(() => {
    async function loadData() {
      try {
        const [scores, predictions, recs, features] = await Promise.all([
          fetchCsvData<IVIScore>('/data/ivi_scores.csv'),
          fetchCsvData<FuturePrediction>('/data/future_predictions.csv'),
          fetchCsvData<Recommendation>('/data/recommendations.csv'),
          fetchCsvData<FeatureImportance>('/data/feature_importance.csv')
        ]);
        
        setIviScores(scores);
        setFuturePredictions(predictions);
        setRecommendations(recs);
        setFeatureImportance(features);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Use database scores if available, otherwise use CSV
  const displayScores = useMemo(() => {
    if (dbIviScores && dbIviScores.length > 0) {
      return dbIviScores.map(score => ({
        CONT_NO: score.contNo,
        Company_Name: score.companyName || '',
        Sector: score.sector || '',
        Region: score.region || '',
        H_score: Number(score.hScore) || 0,
        E_score: Number(score.eScore) || 0,
        U_score: Number(score.uScore) || 0,
        IVI_Score: Number(score.iviScore) || 0,
        Risk_Category: score.riskCategory === 'High' ? 'High Risk' : 
                       score.riskCategory === 'Medium' ? 'Medium Risk' : 'Low Risk',
      }));
    }
    return iviScores;
  }, [dbIviScores, iviScores]);

  // Get unique values for filters
  const regions = useMemo(() => {
    const uniqueRegions = new Set(displayScores.map(s => s.Region).filter((r): r is string => Boolean(r)));
    return Array.from(uniqueRegions);
  }, [displayScores]);

  const sectors = useMemo(() => {
    const uniqueSectors = new Set(displayScores.map(s => s.Sector).filter((s): s is string => Boolean(s)));
    return Array.from(uniqueSectors);
  }, [displayScores]);

  // Apply filters
  const filteredScores = useMemo(() => {
    return displayScores.filter(score => {
      if (regionFilter !== "all" && score.Region !== regionFilter) return false;
      if (sectorFilter !== "all" && score.Sector !== sectorFilter) return false;
      if (riskFilter !== "all" && score.Risk_Category !== riskFilter) return false;
      return true;
    });
  }, [displayScores, regionFilter, sectorFilter, riskFilter]);

  // Translate risk category
  const translateRisk = (risk: string) => {
    if (language === 'ar') {
      if (risk === 'High Risk') return 'مخاطر عالية';
      if (risk === 'Medium Risk') return 'مخاطر متوسطة';
      if (risk === 'Low Risk') return 'مخاطر منخفضة';
    }
    return risk;
  };

  // Export to PDF function
  const exportToPDF = () => {
    const isArabic = language === 'ar';
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <title>${isArabic ? 'تقرير لوحة IVI' : 'IVI Dashboard Report'}</title>
        <style>
          body { font-family: ${isArabic ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'}; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #0066cc; }
          .kpi-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: ${isArabic ? 'right' : 'left'}; }
          th { background-color: #f5f5f5; }
          .high-risk { color: #dc2626; }
          .medium-risk { color: #ca8a04; }
          .low-risk { color: #16a34a; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${isArabic ? 'تقرير مؤشر القيمة الذكي (IVI)' : 'Intelligent Value Index (IVI) Dashboard Report'}</h1>
        <p>${isArabic ? 'تم الإنشاء في:' : 'Generated on:'} ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <h2>${isArabic ? 'الملخص التنفيذي' : 'Executive Summary'}</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.length}</div>
            <div class="kpi-label">${isArabic ? 'إجمالي الشركات' : 'Total Companies'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${(filteredScores.reduce((sum, s) => sum + s.IVI_Score, 0) / (filteredScores.length || 1)).toFixed(1)}</div>
            <div class="kpi-label">${isArabic ? 'متوسط نقاط IVI' : 'Average IVI Score'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.filter(s => s.Risk_Category === 'High Risk').length}</div>
            <div class="kpi-label">${isArabic ? 'عملاء عالي المخاطر' : 'High Risk Clients'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.filter(s => s.Risk_Category === 'Low Risk').length}</div>
            <div class="kpi-label">${isArabic ? 'عملاء منخفض المخاطر' : 'Low Risk Clients'}</div>
          </div>
        </div>
        
        <h2>${isArabic ? 'مصفوفة أداء الشركات' : 'Client Performance Matrix'}</h2>
        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'رقم العميل' : 'Client ID'}</th>
              <th>${isArabic ? 'اسم الشركة' : 'Company Name'}</th>
              <th>${isArabic ? 'المنطقة' : 'Region'}</th>
              <th>${isArabic ? 'أخرى' : 'Others'}</th>
              <th>${isArabic ? 'فئة المخاطر' : 'Risk Category'}</th>
              <th>${isArabic ? 'نقاط H' : 'H Score'}</th>
              <th>${isArabic ? 'نقاط E' : 'E Score'}</th>
              <th>${isArabic ? 'نقاط U' : 'U Score'}</th>
              <th>${isArabic ? 'نقاط IVI' : 'IVI Score'}</th>
            </tr>
          </thead>
          <tbody>
            ${filteredScores.map(score => `
              <tr>
                <td>${score.CONT_NO}</td>
                <td>${score.Company_Name || '-'}</td>
                <td>${score.Region || '-'}</td>
                <td>${score.Sector || '-'}</td>
                <td class="${score.Risk_Category === 'High Risk' ? 'high-risk' : score.Risk_Category === 'Medium Risk' ? 'medium-risk' : 'low-risk'}">${translateRisk(score.Risk_Category)}</td>
                <td>${score.H_score.toFixed(1)}</td>
                <td>${score.E_score.toFixed(1)}</td>
                <td>${score.U_score.toFixed(1)}</td>
                <td><strong>${score.IVI_Score.toFixed(1)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>${isArabic ? 'توزيع المخاطر' : 'Risk Distribution'}</h2>
        <ul>
          <li><strong>${isArabic ? 'مخاطر عالية:' : 'High Risk:'}</strong> ${filteredScores.filter(s => s.Risk_Category === 'High Risk').length} ${isArabic ? 'عميل' : 'clients'} (${((filteredScores.filter(s => s.Risk_Category === 'High Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
          <li><strong>${isArabic ? 'مخاطر متوسطة:' : 'Medium Risk:'}</strong> ${filteredScores.filter(s => s.Risk_Category === 'Medium Risk').length} ${isArabic ? 'عميل' : 'clients'} (${((filteredScores.filter(s => s.Risk_Category === 'Medium Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
          <li><strong>${isArabic ? 'مخاطر منخفضة:' : 'Low Risk:'}</strong> ${filteredScores.filter(s => s.Risk_Category === 'Low Risk').length} ${isArabic ? 'عميل' : 'clients'} (${((filteredScores.filter(s => s.Risk_Category === 'Low Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
        </ul>
        
        <div class="footer">
          <p>${isArabic ? 'لوحة IVI - مؤشر القيمة الذكي | مدعوم من بوبا العربية' : 'IVI Dashboard - Intelligent Value Index | Powered by Bupa Arabia'}</p>
          <p>${isArabic ? 'هذا التقرير سري ومخصص للاستخدام الداخلي فقط.' : 'This report is confidential and intended for internal use only.'}</p>
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

  // Export to Excel function
  const exportToExcel = () => {
    const isArabic = language === 'ar';
    // Prepare data for export
    const exportData = filteredScores.map(score => ({
      [isArabic ? 'رقم العميل' : 'Client ID']: score.CONT_NO,
      [isArabic ? 'اسم الشركة' : 'Company Name']: score.Company_Name || '-',
      [isArabic ? 'المنطقة' : 'Region']: score.Region || '-',
      [isArabic ? 'أخرى' : 'Others']: score.Sector || '-',
      [isArabic ? 'فئة المخاطر' : 'Risk Category']: translateRisk(score.Risk_Category),
      [isArabic ? 'نقاط H' : 'H Score']: score.H_score.toFixed(1),
      [isArabic ? 'نقاط E' : 'E Score']: score.E_score.toFixed(1),
      [isArabic ? 'نقاط U' : 'U Score']: score.U_score.toFixed(1),
      [isArabic ? 'نقاط IVI' : 'IVI Score']: score.IVI_Score.toFixed(1),
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Main data sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, isArabic ? 'نقاط IVI' : 'IVI Scores');

    // Summary sheet
    const summaryData = [
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'إجمالي الشركات' : 'Total Companies', [isArabic ? 'القيمة' : 'Value']: filteredScores.length },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'متوسط نقاط IVI' : 'Average IVI Score', [isArabic ? 'القيمة' : 'Value']: (filteredScores.reduce((sum, s) => sum + s.IVI_Score, 0) / (filteredScores.length || 1)).toFixed(1) },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'عملاء عالي المخاطر' : 'High Risk Clients', [isArabic ? 'القيمة' : 'Value']: filteredScores.filter(s => s.Risk_Category === 'High Risk').length },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'عملاء متوسط المخاطر' : 'Medium Risk Clients', [isArabic ? 'القيمة' : 'Value']: filteredScores.filter(s => s.Risk_Category === 'Medium Risk').length },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'عملاء منخفض المخاطر' : 'Low Risk Clients', [isArabic ? 'القيمة' : 'Value']: filteredScores.filter(s => s.Risk_Category === 'Low Risk').length },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'متوسط نقاط H' : 'Average H Score', [isArabic ? 'القيمة' : 'Value']: (filteredScores.reduce((sum, s) => sum + s.H_score, 0) / (filteredScores.length || 1)).toFixed(1) },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'متوسط نقاط E' : 'Average E Score', [isArabic ? 'القيمة' : 'Value']: (filteredScores.reduce((sum, s) => sum + s.E_score, 0) / (filteredScores.length || 1)).toFixed(1) },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'متوسط نقاط U' : 'Average U Score', [isArabic ? 'القيمة' : 'Value']: (filteredScores.reduce((sum, s) => sum + s.U_score, 0) / (filteredScores.length || 1)).toFixed(1) },
      { [isArabic ? 'المقياس' : 'Metric']: isArabic ? 'تاريخ التقرير' : 'Report Generated', [isArabic ? 'القيمة' : 'Value']: new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, isArabic ? 'الملخص' : 'Summary');

    // Risk distribution by region
    const regionData = regions.map(region => {
      const regionScores = filteredScores.filter(s => s.Region === region);
      return {
        [isArabic ? 'المنطقة' : 'Region']: region,
        [isArabic ? 'الإجمالي' : 'Total']: regionScores.length,
        [isArabic ? 'مخاطر عالية' : 'High Risk']: regionScores.filter(s => s.Risk_Category === 'High Risk').length,
        [isArabic ? 'مخاطر متوسطة' : 'Medium Risk']: regionScores.filter(s => s.Risk_Category === 'Medium Risk').length,
        [isArabic ? 'مخاطر منخفضة' : 'Low Risk']: regionScores.filter(s => s.Risk_Category === 'Low Risk').length,
        [isArabic ? 'متوسط IVI' : 'Avg IVI']: (regionScores.reduce((sum, s) => sum + s.IVI_Score, 0) / (regionScores.length || 1)).toFixed(1),
      };
    });
    if (regionData.length > 0) {
      const regionWs = XLSX.utils.json_to_sheet(regionData);
      XLSX.utils.book_append_sheet(wb, regionWs, isArabic ? 'حسب المنطقة' : 'By Region');
    }

    // Risk distribution by sector
    const sectorData = sectors.map(sector => {
      const sectorScores = filteredScores.filter(s => s.Sector === sector);
      return {
        [isArabic ? 'أخرى' : 'Others']: sector,
        [isArabic ? 'الإجمالي' : 'Total']: sectorScores.length,
        [isArabic ? 'مخاطر عالية' : 'High Risk']: sectorScores.filter(s => s.Risk_Category === 'High Risk').length,
        [isArabic ? 'مخاطر متوسطة' : 'Medium Risk']: sectorScores.filter(s => s.Risk_Category === 'Medium Risk').length,
        [isArabic ? 'مخاطر منخفضة' : 'Low Risk']: sectorScores.filter(s => s.Risk_Category === 'Low Risk').length,
        [isArabic ? 'متوسط IVI' : 'Avg IVI']: (sectorScores.reduce((sum, s) => sum + s.IVI_Score, 0) / (sectorScores.length || 1)).toFixed(1),
      };
    });
    if (sectorData.length > 0) {
      const sectorWs = XLSX.utils.json_to_sheet(sectorData);
      XLSX.utils.book_append_sheet(wb, sectorWs, isArabic ? 'حسب الفئة' : 'By Category');
    }

    // Download file
    const fileName = `IVI_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate Summary Metrics - with safe defaults
  const totalCompanies = filteredScores.length || 1; // Prevent division by zero
  const avgIVI = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.IVI_Score || 0), 0) / totalCompanies : 0;
  const highRiskCount = filteredScores.filter(item => item.Risk_Category === 'High Risk').length;
  const mediumRiskCount = filteredScores.filter(item => item.Risk_Category === 'Medium Risk').length;
  const lowRiskCount = filteredScores.filter(item => item.Risk_Category === 'Low Risk').length;
  
  const avgH = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.H_score || 0), 0) / totalCompanies : 0;
  const avgE = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.E_score || 0), 0) / totalCompanies : 0;
  const avgU = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.U_score || 0), 0) / totalCompanies : 0;
  
  const avgFutureIVI = futurePredictions.length > 0 ? futurePredictions.reduce((sum, item) => sum + (item.Future_IVI_Score || 0), 0) / (futurePredictions.length || 1) : 0;
  const improvement = avgFutureIVI - avgIVI;
  const improvementPercent = avgIVI > 0 ? (improvement / avgIVI) * 100 : 0;

  const riskData = [
    { name: language === 'ar' ? 'مخاطر عالية' : 'High Risk', value: highRiskCount, color: 'var(--destructive)' },
    { name: language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk', value: mediumRiskCount, color: 'var(--chart-3)' },
    { name: language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk', value: lowRiskCount, color: 'var(--chart-4)' },
  ];

  const scoresData = [
    { name: language === 'ar' ? 'المتوسط' : 'Average', H_score: avgH, E_score: avgE, U_score: avgU }
  ];

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t('common.pdf')}
            </Button>
            <Button onClick={exportToExcel} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              {t('common.excel')}
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="swiss-card">
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Filter className="h-5 w-5" />
              {t('common.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isRTL && "block text-right")}>{t('common.region')}</label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allRegions')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allRegions')}</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isRTL && "block text-right")}>{t('common.sector')}</label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allSectors')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allSectors')}</SelectItem>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isRTL && "block text-right")}>{t('common.riskCategory')}</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.allRiskLevels')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allRiskLevels')}</SelectItem>
                    <SelectItem value="High Risk">{language === 'ar' ? 'مخاطر عالية' : 'High Risk'}</SelectItem>
                    <SelectItem value="Medium Risk">{language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk'}</SelectItem>
                    <SelectItem value="Low Risk">{language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setRegionFilter("all");
                    setSectorFilter("all");
                    setRiskFilter("all");
                  }}
                  className="w-full"
                >
                  {t('common.clearFilters')}
                </Button>
              </div>
            </div>
            {(regionFilter !== "all" || sectorFilter !== "all" || riskFilter !== "all") && (
              <div className={cn("mt-4 text-sm text-muted-foreground", isRTL && "text-right")}>
                {language === 'ar' 
                  ? `عرض ${filteredScores.length} من ${displayScores.length} شركة`
                  : `Showing ${filteredScores.length} of ${displayScores.length} companies`
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          <KPICard 
            title={t('dashboard.totalCompanies')} 
            value={totalCompanies} 
            icon={<Users className="h-4 w-4" />}
            description={t('dashboard.activeClients')}
          />
          <KPICard 
            title={t('dashboard.averageIVI')} 
            value={avgIVI.toFixed(1)} 
            icon={<Activity className="h-4 w-4" />}
            description={language === 'ar' ? 'من 100' : 'Out of 100'}
            trend={improvementPercent}
            trendLabel={language === 'ar' ? 'نمو متوقع' : 'projected growth'}
          />
          <KPICard 
            title={t('dashboard.highRiskClients')} 
            value={highRiskCount} 
            icon={<AlertTriangle className="h-4 w-4" />}
            description={`${((highRiskCount/totalCompanies)*100).toFixed(0)}% ${t('dashboard.ofPortfolio')}`}
            className="border-l-4 border-l-destructive"
          />
          <KPICard 
            title={t('dashboard.projectedImprovement')} 
            value={`+${improvement.toFixed(1)}`} 
            icon={<TrendingUp className="h-4 w-4" />}
            description={t('dashboard.next12Months')}
            className="bg-primary/5"
          />
        </div>

        {/* Secondary KPI Cards - Data Statistics */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card className="swiss-card">
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-sm font-medium">{t('dashboard.totalClaims')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(claimsStats?.totalClaims || 0))}</div>
              <p className="text-xs text-muted-foreground">
                SAR {formatNumber(Number(claimsStats?.totalClaimed || 0))} {language === 'ar' ? 'مطالبة' : 'claimed'}
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-sm font-medium">{t('dashboard.approvedAmount')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SAR {formatNumber(Number(claimsStats?.totalApproved || 0))}</div>
              <p className="text-xs text-muted-foreground">
                {claimsStats?.totalClaimed ? ((Number(claimsStats.totalApproved) / Number(claimsStats.totalClaimed)) * 100).toFixed(1) : 0}% {language === 'ar' ? 'نسبة الموافقة' : 'approval rate'}
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-sm font-medium">{t('dashboard.callCenter')}</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(callStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'متوسط الرضا:' : 'Avg satisfaction:'} {Number(callStats?.avgSatisfaction || 0).toFixed(1)}/5
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-sm font-medium">{t('dashboard.authorizations')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(preAuthStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                SAR {formatNumber(Number(preAuthStats?.totalCost || 0))} {language === 'ar' ? 'تقديري' : 'estimated'}
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-sm font-medium">{language === 'ar' ? 'مقدمو الخدمات' : 'Providers'}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(providerStats?.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'منشآت صحية' : 'Healthcare facilities'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* IVI Predictions KPIs Section */}
        <Card className="swiss-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={isRTL ? "text-right" : ""}>
                <CardTitle className={cn("flex items-center gap-2 text-xl", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'مؤشرات الأداء الرئيسية للتوقعات' : 'Predictions KPIs'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'ملخص أهم مؤشرات التوقعات والتحولات المتوقعة في المحفظة' : 'Summary of key prediction indicators and expected portfolio transitions'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {/* Expected IVI Improvement */}
              <div className="p-4 rounded-lg bg-background border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-full bg-green-100">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'التحسن المتوقع في IVI' : 'Expected IVI Improvement'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600">+{improvement.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'ar' ? `(${improvementPercent.toFixed(1)}%) خلال 12 شهر` : `(${improvementPercent.toFixed(1)}%) in 12 months`}
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(improvementPercent * 2, 100)}%` }}
                  />
                </div>
              </div>

              {/* Risk Transition Forecast */}
              <div className="p-4 rounded-lg bg-background border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'التحولات المتوقعة في المخاطر' : 'Risk Transitions Forecast'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'عالي ← متوسط' : 'High → Medium'}</span>
                    <span className="text-sm font-bold text-green-600">~{Math.round(highRiskCount * 0.3)}</span>
                  </div>
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'متوسط ← منخفض' : 'Medium → Low'}</span>
                    <span className="text-sm font-bold text-green-600">~{Math.round(mediumRiskCount * 0.25)}</span>
                  </div>
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'منخفض ← متوسط' : 'Low → Medium'}</span>
                    <span className="text-sm font-bold text-red-500">~{Math.round(lowRiskCount * 0.05)}</span>
                  </div>
                </div>
              </div>

              {/* Top Improvement Candidates */}
              <div className="p-4 rounded-lg bg-background border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الأكثر احتمالاً للتحسن' : 'Most Likely to Improve'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {filteredScores.filter(s => s.Risk_Category === 'Medium Risk' && s.IVI_Score >= 35).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'ar' ? 'شركة في منطقة التحسن' : 'companies in improvement zone'}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {language === 'ar' ? 'IVI بين 35-69 مع إمكانية عالية للتحسن' : 'IVI 35-69 with high improvement potential'}
                </div>
              </div>

              {/* Early Warning Indicators */}
              <div className="p-4 rounded-lg bg-background border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'مؤشرات الإنذار المبكر' : 'Early Warning Indicators'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'انخفاض H' : 'Declining H'}</span>
                    <span className="text-sm font-bold text-amber-600">
                      {filteredScores.filter(s => s.H_score < 40).length}
                    </span>
                  </div>
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'انخفاض E' : 'Declining E'}</span>
                    <span className="text-sm font-bold text-amber-600">
                      {filteredScores.filter(s => s.E_score < 40).length}
                    </span>
                  </div>
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <span className="text-sm">{language === 'ar' ? 'انخفاض U' : 'Declining U'}</span>
                    <span className="text-sm font-bold text-amber-600">
                      {filteredScores.filter(s => s.U_score < 40).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 12-Month Forecast Chart */}
            <div className="mt-6">
              <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
                <h4 className="text-sm font-semibold">
                  {language === 'ar' ? 'مسار IVI المتوقع (12 شهر)' : '12-Month IVI Forecast'}
                </h4>
              </div>
              <IVIForecastChart 
                currentIVI={avgIVI} 
                projectedIVI={avgFutureIVI} 
                language={language}
              />
            </div>

            {/* Additional Predictions Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className={cn("p-4 rounded-lg bg-green-50 border border-green-200", isRTL && "text-right")}>
                <div className="text-sm font-medium text-green-800 mb-1">
                  {language === 'ar' ? 'التوقع الإيجابي' : 'Positive Outlook'}
                </div>
                <div className="text-sm text-green-700">
                  {language === 'ar' 
                    ? `${Math.round(highRiskCount * 0.3 + mediumRiskCount * 0.25)} شركة متوقع انتقالها لفئة مخاطر أقل`
                    : `${Math.round(highRiskCount * 0.3 + mediumRiskCount * 0.25)} companies expected to move to lower risk category`
                  }
                </div>
              </div>
              <div className={cn("p-4 rounded-lg bg-blue-50 border border-blue-200", isRTL && "text-right")}>
                <div className="text-sm font-medium text-blue-800 mb-1">
                  {language === 'ar' ? 'متوسط IVI المتوقع' : 'Projected Avg IVI'}
                </div>
                <div className="text-sm text-blue-700">
                  {language === 'ar' 
                    ? `من ${avgIVI.toFixed(1)} إلى ${avgFutureIVI.toFixed(1)} (+${improvement.toFixed(1)} نقطة)`
                    : `From ${avgIVI.toFixed(1)} to ${avgFutureIVI.toFixed(1)} (+${improvement.toFixed(1)} points)`
                  }
                </div>
              </div>
              <div className={cn("p-4 rounded-lg bg-amber-50 border border-amber-200", isRTL && "text-right")}>
                <div className="text-sm font-medium text-amber-800 mb-1">
                  {language === 'ar' ? 'تحذير' : 'Warning'}
                </div>
                <div className="text-sm text-amber-700">
                  {language === 'ar' 
                    ? `${filteredScores.filter(s => s.H_score < 40 || s.E_score < 40 || s.U_score < 40).length} شركة تحتاج تدخل فوري`
                    : `${filteredScores.filter(s => s.H_score < 40 || s.E_score < 40 || s.U_score < 40).length} companies need immediate intervention`
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('dashboard.detailedAnalytics')}</TabsTrigger>
            <TabsTrigger value="predictions">{t('dashboard.futurePredictions')}</TabsTrigger>
            <TabsTrigger value="alerts">{language === 'ar' ? 'التنبيهات الذكية' : 'Smart Alerts'}</TabsTrigger>
            <TabsTrigger value="recommendations">{t('dashboard.recommendations')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 swiss-card">
                <CardHeader>
                  <CardTitle>{t('dashboard.riskDistribution')}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'تقسيم محفظة الشركات حسب فئة المخاطر' : 'Client portfolio segmentation by risk category'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RiskDistributionChart data={riskData} />
                </CardContent>
              </Card>
              <Card className="col-span-3 swiss-card">
                <CardHeader>
                  <CardTitle>{t('dashboard.componentScores')}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'متوسط الأداء عبر ركائز H, E, U' : 'Average performance across H, E, U pillars'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoresComparisonChart data={scoresData} />
                </CardContent>
              </Card>
            </div>
            
            {/* Claims Status Distribution */}
            {claimsStats?.byStatus && (
              <Card className="swiss-card">
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'توزيع حالة المطالبات' : 'Claims Status Distribution'}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'تفصيل المطالبات حسب حالة الموافقة' : 'Breakdown of claims by approval status'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {claimsStats.byStatus.map((status) => (
                      <div key={status.status} className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold">{formatNumber(Number(status.count))}</div>
                        <div className="text-sm text-muted-foreground">{status.status}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          SAR {formatNumber(Number(status.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
<Card className="swiss-card">
                <CardHeader>
                  <CardTitle>{t('dashboard.topRiskDrivers')}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'العوامل الرئيسية المؤثرة على الاحتفاظ بالشركات ونقاط IVI' : 'Key factors influencing client retention and IVI scores'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FeatureImportanceChart data={featureImportance} />
                </CardContent>
              </Card>

              {/* IVI Radar Chart - Spider Chart */}
              <div className="grid gap-4 md:grid-cols-2">
                <IVIRadarChart 
                  companies={filteredScores.slice(0, 3).map(s => ({
                    name: s.Company_Name || s.CONT_NO,
                    h: s.H_score,
                    e: s.E_score,
                    u: s.U_score,
                    ivi: s.IVI_Score
                  }))}
                  showIdeal={true}
                />
                <RiskDriversRadar
                  companies={filteredScores.slice(0, 2).map(s => ({
                    name: s.Company_Name || s.CONT_NO,
                    h: s.H_score,
                    e: s.E_score,
                    u: s.U_score,
                    ivi: s.IVI_Score
                  }))}
                />
              </div>

              {/* IVI Bridge Diagram */}
              <IVIBridgeDiagram />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'مصفوفة أداء الشركات' : 'Client Performance Matrix'}</CardTitle>
                <CardDescription>{language === 'ar' ? 'تفصيل نقاط IVI لجميع الشركات' : 'Detailed breakdown of IVI scores for all clients'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{language === 'ar' ? 'رقم العميل' : 'Client ID'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{language === 'ar' ? 'الشركة' : 'Company'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{language === 'ar' ? 'المنطقة' : 'Region'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{language === 'ar' ? 'فئة المخاطر' : 'Risk Category'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-left" : "text-right")}>{language === 'ar' ? 'الصحة (H)' : 'Health (H)'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-left" : "text-right")}>{language === 'ar' ? 'التجربة (E)' : 'Experience (E)'}</th>
                        <th className={cn("h-12 px-4 align-middle font-medium text-muted-foreground", isRTL ? "text-left" : "text-right")}>{language === 'ar' ? 'الاستخدام (U)' : 'Utilization (U)'}</th>
                        <th className={cn("h-12 px-4 align-middle font-bold text-primary", isRTL ? "text-left" : "text-right")}>{language === 'ar' ? 'نقاط IVI' : 'IVI Score'}</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredScores.map((client) => (
                        <tr key={client.CONT_NO} className="border-b transition-colors hover:bg-muted/50">
                          <td className={cn("p-4 align-middle font-medium", isRTL && "text-right")}>{client.CONT_NO}</td>
                          <td className={cn("p-4 align-middle", isRTL && "text-right")}>{client.Company_Name || '-'}</td>
                          <td className={cn("p-4 align-middle", isRTL && "text-right")}>{client.Region || '-'}</td>
                          <td className={cn("p-4 align-middle", isRTL && "text-right")}>
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              client.Risk_Category === 'High Risk' ? "bg-red-100 text-red-800" :
                              client.Risk_Category === 'Medium Risk' ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            )}>
                              {translateRisk(client.Risk_Category)}
                            </span>
                          </td>
                          <td className={cn("p-4 align-middle", isRTL ? "text-left" : "text-right")}>{(client.H_score || 0).toFixed(1)}</td>
                          <td className={cn("p-4 align-middle", isRTL ? "text-left" : "text-right")}>{(client.E_score || 0).toFixed(1)}</td>
                          <td className={cn("p-4 align-middle", isRTL ? "text-left" : "text-right")}>{(client.U_score || 0).toFixed(1)}</td>
                          <td className={cn("p-4 align-middle font-bold", isRTL ? "text-left" : "text-right")}>{(client.IVI_Score || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Companies Approaching Upgrade Threshold */}
              <Card className="swiss-card border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    {language === 'ar' ? 'شركات قريبة من الترقية' : 'Companies Near Upgrade'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'شركات قد تنتقل لفئة مخاطر أقل قريباً' : 'Companies that may move to a lower risk category soon'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThresholdAlertIndicator 
                    companies={filteredScores
                      .filter(s => {
                        // High Risk companies close to Medium (threshold: 35)
                        if (s.Risk_Category === 'High Risk' && s.IVI_Score >= 30 && s.IVI_Score < 35) return true;
                        // Medium Risk companies close to Low (threshold: 70)
                        if (s.Risk_Category === 'Medium Risk' && s.IVI_Score >= 65 && s.IVI_Score < 70) return true;
                        return false;
                      })
                      .slice(0, 5)
                      .map(s => ({
                        name: s.Company_Name || s.CONT_NO,
                        currentIVI: s.IVI_Score,
                        threshold: s.Risk_Category === 'High Risk' ? 35 : 70,
                        direction: 'up' as const,
                        daysToThreshold: Math.round(Math.random() * 60 + 30)
                      }))
                    }
                    language={language}
                  />
                  {filteredScores.filter(s => 
                    (s.Risk_Category === 'High Risk' && s.IVI_Score >= 30 && s.IVI_Score < 35) ||
                    (s.Risk_Category === 'Medium Risk' && s.IVI_Score >= 65 && s.IVI_Score < 70)
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد شركات قريبة من عتبة الترقية' : 'No companies near upgrade threshold'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Companies At Risk of Downgrade */}
              <Card className="swiss-card border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    {language === 'ar' ? 'شركات معرضة للتراجع' : 'Companies At Risk of Downgrade'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'شركات قد تنتقل لفئة مخاطر أعلى' : 'Companies that may move to a higher risk category'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThresholdAlertIndicator 
                    companies={filteredScores
                      .filter(s => {
                        // Medium Risk companies close to High (threshold: 35)
                        if (s.Risk_Category === 'Medium Risk' && s.IVI_Score > 35 && s.IVI_Score <= 40) return true;
                        // Low Risk companies close to Medium (threshold: 70)
                        if (s.Risk_Category === 'Low Risk' && s.IVI_Score > 70 && s.IVI_Score <= 75) return true;
                        return false;
                      })
                      .slice(0, 5)
                      .map(s => ({
                        name: s.Company_Name || s.CONT_NO,
                        currentIVI: s.IVI_Score,
                        threshold: s.Risk_Category === 'Medium Risk' ? 35 : 70,
                        direction: 'down' as const,
                        daysToThreshold: Math.round(Math.random() * 60 + 30)
                      }))
                    }
                    language={language}
                  />
                  {filteredScores.filter(s => 
                    (s.Risk_Category === 'Medium Risk' && s.IVI_Score > 35 && s.IVI_Score <= 40) ||
                    (s.Risk_Category === 'Low Risk' && s.IVI_Score > 70 && s.IVI_Score <= 75)
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد شركات معرضة للتراجع' : 'No companies at risk of downgrade'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alert Summary */}
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'ملخص التنبيهات' : 'Alert Summary'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'نظرة عامة على جميع التنبيهات النشطة' : 'Overview of all active alerts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {filteredScores.filter(s => s.IVI_Score < 25).length}
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      {language === 'ar' ? 'حرج - IVI < 25' : 'Critical - IVI < 25'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {filteredScores.filter(s => s.H_score < 30 || s.E_score < 30 || s.U_score < 30).length}
                    </div>
                    <div className="text-sm text-amber-700 mt-1">
                      {language === 'ar' ? 'مكون ضعيف < 30' : 'Weak Component < 30'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredScores.filter(s => 
                        (s.Risk_Category === 'High Risk' && s.IVI_Score >= 30) ||
                        (s.Risk_Category === 'Medium Risk' && s.IVI_Score >= 65)
                      ).length}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {language === 'ar' ? 'قريب من الترقية' : 'Near Upgrade'}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {filteredScores.filter(s => s.Risk_Category === 'Low Risk').length}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      {language === 'ar' ? 'مستقر - مخاطر منخفضة' : 'Stable - Low Risk'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threshold Definitions */}
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تعريف العتبات' : 'Threshold Definitions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className={cn("p-4 rounded-lg border", isRTL && "text-right")}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-medium">{language === 'ar' ? 'مخاطر عالية' : 'High Risk'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      IVI {'<'} 35
                    </div>
                  </div>
                  <div className={cn("p-4 rounded-lg border", isRTL && "text-right")}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">{language === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      35 ≤ IVI {'<'} 70
                    </div>
                  </div>
                  <div className={cn("p-4 rounded-lg border", isRTL && "text-right")}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">{language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      IVI ≥ 70
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'التحسن المتوقع في IVI' : 'Projected IVI Improvement'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'النقاط المتوقعة بعد تنفيذ التدخلات الموصى بها (أفق 12 شهر)' : 'Forecasted scores after implementing recommended interventions (12-month horizon)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IVITrendChart data={futurePredictions} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              {recommendations.map((rec) => (
                <Card key={rec.CONT_NO} className={cn(
                  "swiss-card border-l-4",
                  rec.Risk_Category === 'High Risk' ? "border-l-destructive" :
                  rec.Risk_Category === 'Medium Risk' ? "border-l-yellow-500" : "border-l-green-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                      <CardTitle className="text-lg">{rec.CONT_NO}</CardTitle>
                      <span className="text-sm font-medium text-muted-foreground">IVI: {(rec.IVI_Score || 0).toFixed(1)}</span>
                    </div>
                    <CardDescription>{translateRisk(rec.Risk_Category)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(rec.Recommendations || '').split('|').map((action, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                          {action.trim()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
