import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { fetchCsvData, FuturePrediction } from "@/lib/csv";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Filter, RefreshCw, Download, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Predictions() {
  const { t, isRTL, language } = useLanguage();
  const [regionFilter, setRegionFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("12");
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const { data: iviScores } = trpc.ivi.scores.list.useQuery();

  // Load predictions from CSV
  useEffect(() => {
    async function loadPredictions() {
      try {
        const predictions = await fetchCsvData<FuturePrediction>('/data/future_predictions.csv');
        setFuturePredictions(predictions);
      } catch (error) {
        console.error("Failed to load predictions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, []);

  // Extract unique regions and sectors
  const regions = useMemo(() => {
    if (!iviScores) return [];
    const uniqueRegions = Array.from(new Set(iviScores.map(s => s.region).filter((r): r is string => Boolean(r))));
    return uniqueRegions.sort();
  }, [iviScores]);

  const sectors = useMemo(() => {
    if (!iviScores) return [];
    const uniqueSectors = Array.from(new Set(iviScores.map(s => s.sector).filter((s): s is string => Boolean(s))));
    return uniqueSectors.sort();
  }, [iviScores]);

  // Filter companies based on region and sector
  const filteredCompanies = useMemo(() => {
    if (!iviScores) return [];
    return iviScores.filter(company => {
      const matchesRegion = regionFilter === "all" || company.region === regionFilter;
      const matchesSector = sectorFilter === "all" || company.sector === sectorFilter;
      return matchesRegion && matchesSector;
    });
  }, [iviScores, regionFilter, sectorFilter]);

  // Generate prediction data for filtered companies
  const predictionData = useMemo(() => {
    const months = parseInt(timeRange);
    const data = [];
    const currentDate = new Date();
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      const monthLabel = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', year: 'numeric' });
      
      // Calculate average scores with growth projection
      const avgIVI = filteredCompanies.reduce((sum, c) => sum + parseFloat(c.iviScore || "0"), 0) / (filteredCompanies.length || 1);
      const avgH = filteredCompanies.reduce((sum, c) => sum + parseFloat(c.hScore || "0"), 0) / (filteredCompanies.length || 1);
      const avgE = filteredCompanies.reduce((sum, c) => sum + parseFloat(c.eScore || "0"), 0) / (filteredCompanies.length || 1);
      const avgU = filteredCompanies.reduce((sum, c) => sum + parseFloat(c.uScore || "0"), 0) / (filteredCompanies.length || 1);
      
      // Apply growth factor (simulated improvement)
      const growthFactor = 1 + (i * 0.008); // 0.8% monthly improvement
      
      data.push({
        month: monthLabel,
        monthIndex: i,
        ivi: Math.min(100, avgIVI * growthFactor),
        health: Math.min(100, avgH * growthFactor),
        experience: Math.min(100, avgE * growthFactor),
        utilization: Math.min(100, avgU * growthFactor),
        projected: i > 0,
      });
    }
    
    return data;
  }, [filteredCompanies, timeRange, language]);

  // Risk category predictions
  const riskPredictions = useMemo(() => {
    const currentHigh = filteredCompanies.filter(c => c.riskCategory === "High").length;
    const currentMedium = filteredCompanies.filter(c => c.riskCategory === "Medium").length;
    const currentLow = filteredCompanies.filter(c => c.riskCategory === "Low").length;
    
    // Simulate improvement over time
    const months = parseInt(timeRange);
    const improvementRate = 0.05; // 5% monthly improvement in risk distribution
    
    const projectedHigh = Math.max(0, Math.round(currentHigh * (1 - improvementRate * months)));
    const projectedLow = Math.min(filteredCompanies.length, Math.round(currentLow + (currentHigh - projectedHigh) * 0.7));
    const projectedMedium = filteredCompanies.length - projectedHigh - projectedLow;
    
    return {
      current: { high: currentHigh, medium: currentMedium, low: currentLow },
      projected: { high: projectedHigh, medium: projectedMedium, low: projectedLow },
    };
  }, [filteredCompanies, timeRange]);

  // Companies at risk of category change
  const atRiskCompanies = useMemo(() => {
    return filteredCompanies
      .filter(c => {
        const score = parseFloat(c.iviScore || "0");
        // Companies near threshold boundaries
        return (score >= 45 && score <= 55) || (score >= 65 && score <= 75);
      })
      .map(c => ({
        ...c,
        trend: parseFloat(c.iviScore || "0") > 50 ? "improving" : "declining",
        projectedCategory: parseFloat(c.iviScore || "0") > 60 ? "Low" : 
                          parseFloat(c.iviScore || "0") > 45 ? "Medium" : "High",
      }));
  }, [filteredCompanies]);

  const clearFilters = () => {
    setRegionFilter("all");
    setSectorFilter("all");
    setTimeRange("12");
  };

  // Export predictions to PDF
  const exportPredictionsPDF = () => {
    const isArabic = language === 'ar';
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <title>${isArabic ? 'تقرير التنبؤات' : 'Predictions Report'}</title>
        <style>
          body { font-family: ${isArabic ? 'Arial, Tahoma, sans-serif' : 'Arial, sans-serif'}; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .summary-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: ${isArabic ? 'right' : 'left'}; }
          th { background-color: #f5f5f5; }
          .improving { color: #16a34a; }
          .declining { color: #dc2626; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${isArabic ? 'تقرير التنبؤات - مؤشر القيمة الذكي (IVI)' : 'Predictions Report - Intelligent Value Index (IVI)'}</h1>
        <p>${isArabic ? 'تم الإنشاء في:' : 'Generated on:'} ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>${isArabic ? 'الفترة الزمنية:' : 'Time Period:'} ${timeRange} ${isArabic ? 'شهر' : 'months'}</p>
        
        <h2>${isArabic ? 'ملخص التنبؤات' : 'Prediction Summary'}</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">${filteredCompanies.length}</div>
            <div class="summary-label">${isArabic ? 'الشركات المحللة' : 'Companies Analyzed'}</div>
          </div>
          <div class="summary-card">
            <div class="summary-value improving">+${(parseFloat(timeRange) * 0.8).toFixed(1)}%</div>
            <div class="summary-label">${isArabic ? 'التحسن المتوقع' : 'Expected Improvement'}</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${atRiskCompanies.length}</div>
            <div class="summary-label">${isArabic ? 'شركات قرب الحد' : 'Near Threshold'}</div>
          </div>
          <div class="summary-card">
            <div class="summary-value declining">${riskPredictions.projected.high}</div>
            <div class="summary-label">${isArabic ? 'عالية المخاطر (متوقع)' : 'High Risk (Projected)'}</div>
          </div>
        </div>
        
        <h2>${isArabic ? 'تحولات فئات المخاطر' : 'Risk Category Transitions'}</h2>
        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'الفئة' : 'Category'}</th>
              <th>${isArabic ? 'الحالي' : 'Current'}</th>
              <th>${isArabic ? 'المتوقع' : 'Projected'}</th>
              <th>${isArabic ? 'التغيير' : 'Change'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${isArabic ? 'مخاطر عالية' : 'High Risk'}</td>
              <td>${riskPredictions.current.high}</td>
              <td>${riskPredictions.projected.high}</td>
              <td class="${riskPredictions.projected.high < riskPredictions.current.high ? 'improving' : 'declining'}">${riskPredictions.projected.high - riskPredictions.current.high}</td>
            </tr>
            <tr>
              <td>${isArabic ? 'مخاطر متوسطة' : 'Medium Risk'}</td>
              <td>${riskPredictions.current.medium}</td>
              <td>${riskPredictions.projected.medium}</td>
              <td>${riskPredictions.projected.medium - riskPredictions.current.medium}</td>
            </tr>
            <tr>
              <td>${isArabic ? 'مخاطر منخفضة' : 'Low Risk'}</td>
              <td>${riskPredictions.current.low}</td>
              <td>${riskPredictions.projected.low}</td>
              <td class="${riskPredictions.projected.low > riskPredictions.current.low ? 'improving' : 'declining'}">${riskPredictions.projected.low - riskPredictions.current.low}</td>
            </tr>
          </tbody>
        </table>
        
        <h2>${isArabic ? 'شركات قرب حدود التصنيف' : 'Companies Near Classification Threshold'}</h2>
        <table>
          <thead>
            <tr>
              <th>${isArabic ? 'الشركة' : 'Company'}</th>
              <th>${isArabic ? 'نقاط IVI' : 'IVI Score'}</th>
              <th>${isArabic ? 'الاتجاه' : 'Trend'}</th>
              <th>${isArabic ? 'الفئة المتوقعة' : 'Projected Category'}</th>
            </tr>
          </thead>
          <tbody>
            ${atRiskCompanies.slice(0, 15).map(company => `
              <tr>
                <td>${company.companyName}</td>
                <td>${parseFloat(company.iviScore || "0").toFixed(1)}</td>
                <td class="${company.trend === 'improving' ? 'improving' : 'declining'}">${company.trend === 'improving' ? (isArabic ? 'تحسن' : 'Improving') : (isArabic ? 'تراجع' : 'Declining')}</td>
                <td>${company.projectedCategory === 'Low' ? (isArabic ? 'منخفض' : 'Low') : company.projectedCategory === 'Medium' ? (isArabic ? 'متوسط' : 'Medium') : (isArabic ? 'عالي' : 'High')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={isRTL ? "text-right" : ""}>
            <h1 className="text-3xl font-bold tracking-tight">{t('predictions.title')}</h1>
            <p className="text-muted-foreground">{t('predictions.subtitle')}</p>
          </div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={exportPredictionsPDF} className="gap-2">
              <Download className="h-4 w-4" />
              {t('common.pdf')}
            </Button>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {language === 'ar' ? 'آخر تحديث:' : 'Last update:'} {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
              <Filter className="h-5 w-5" />
              {language === 'ar' ? 'فلاتر التنبؤات' : 'Prediction Filters'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.region')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allRegions')}</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region || "unknown"}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.sector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allSectors')}</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector || "unknown"}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('predictions.timePeriod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">{t('predictions.next3Months')}</SelectItem>
                  <SelectItem value="6">{t('predictions.next6Months')}</SelectItem>
                  <SelectItem value="12">{t('predictions.next12Months')}</SelectItem>
                  <SelectItem value="24">{language === 'ar' ? '24 شهر القادمة' : 'Next 24 Months'}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الشركات المحللة' : 'Companies Analyzed'}</p>
                  <p className="text-2xl font-bold">{filteredCompanies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-sm text-muted-foreground">{t('predictions.expectedChange')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{(parseFloat(timeRange) * 0.8).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'شركات قرب الحد' : 'Near Threshold'}</p>
                  <p className="text-2xl font-bold text-yellow-600">{atRiskCompanies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'عالية المخاطر (متوقع)' : 'High Risk (Projected)'}</p>
                  <p className="text-2xl font-bold text-red-600">{riskPredictions.projected.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Prediction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('predictions.iviTrendForecast')}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? `التنبؤ بتطور المؤشرات خلال الـ ${timeRange} شهر القادمة`
                : `Forecasting indicator trends over the next ${timeRange} months`
              }
              {regionFilter !== "all" && ` - ${regionFilter}`}
              {sectorFilter !== "all" && ` - ${sectorFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorIvi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1), '']}
                    labelFormatter={(label) => `${language === 'ar' ? 'الشهر:' : 'Month:'} ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ivi"
                    name="IVI Score"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorIvi)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="health"
                    name={language === 'ar' ? 'الصحة (H)' : 'Health (H)'}
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="experience"
                    name={language === 'ar' ? 'التجربة (E)' : 'Experience (E)'}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    name={language === 'ar' ? 'الكفاءة (U)' : 'Utilization (U)'}
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Category Projection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('predictions.riskTransitions')}</CardTitle>
              <CardDescription>{language === 'ar' ? 'المقارنة بين الحالي والمتوقع' : 'Comparison between current and projected'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: language === 'ar' ? 'عالي' : 'High', current: riskPredictions.current.high, projected: riskPredictions.projected.high },
                      { name: language === 'ar' ? 'متوسط' : 'Medium', current: riskPredictions.current.medium, projected: riskPredictions.projected.medium },
                      { name: language === 'ar' ? 'منخفض' : 'Low', current: riskPredictions.current.low, projected: riskPredictions.projected.low },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" name={language === 'ar' ? 'الحالي' : 'Current'} fill="#94a3b8" />
                    <Bar dataKey="projected" name={language === 'ar' ? 'المتوقع' : 'Projected'} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'شركات قرب حدود التصنيف' : 'Companies Near Classification Threshold'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'شركات قد تتغير فئتها خلال الفترة المتوقعة' : 'Companies that may change category during the projected period'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {atRiskCompanies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد شركات قرب حدود التصنيف' : 'No companies near classification threshold'}
                  </p>
                ) : (
                  atRiskCompanies.slice(0, 10).map((company) => (
                    <div
                      key={company.id}
                      className={cn("flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors", isRTL && "flex-row-reverse")}
                    >
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="font-medium">{company.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          IVI: {parseFloat(company.iviScore || "0").toFixed(1)}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {company.trend === "improving" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Badge
                          variant={
                            company.projectedCategory === "Low"
                              ? "secondary"
                              : company.projectedCategory === "Medium"
                              ? "outline"
                              : "destructive"
                          }
                          className={
                            company.projectedCategory === "Low"
                              ? "bg-green-100 text-green-800"
                              : company.projectedCategory === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                        >
                          → {company.projectedCategory === "Low" ? (language === 'ar' ? 'منخفض' : 'Low') : 
                             company.projectedCategory === "Medium" ? (language === 'ar' ? 'متوسط' : 'Medium') : (language === 'ar' ? 'عالي' : 'High')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'التوصيات التنبؤية' : 'Predictive Recommendations'}</CardTitle>
            <CardDescription>{language === 'ar' ? 'إجراءات مقترحة لتحسين الأداء المستقبلي' : 'Suggested actions to improve future performance'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">{language === 'ar' ? 'تحسين النتائج الصحية' : 'Improve Health Outcomes'}</h4>
                <ul className={cn("text-sm text-green-700 space-y-1", isRTL && "text-right")}>
                  <li>{language === 'ar' ? '• تعزيز برامج الرعاية الوقائية' : '• Enhance preventive care programs'}</li>
                  <li>{language === 'ar' ? '• متابعة الحالات المزمنة بشكل دوري' : '• Regular chronic condition follow-up'}</li>
                  <li>{language === 'ar' ? '• تحسين معدلات الموافقة على العلاجات' : '• Improve treatment approval rates'}</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">{language === 'ar' ? 'تحسين جودة التجربة' : 'Improve Experience Quality'}</h4>
                <ul className={cn("text-sm text-blue-700 space-y-1", isRTL && "text-right")}>
                  <li>{language === 'ar' ? '• تقليل وقت معالجة المطالبات' : '• Reduce claims processing time'}</li>
                  <li>{language === 'ar' ? '• تحسين خدمة العملاء' : '• Enhance customer service'}</li>
                  <li>{language === 'ar' ? '• توفير قنوات تواصل متعددة' : '• Provide multiple communication channels'}</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">{language === 'ar' ? 'تحسين كفاءة الاستخدام' : 'Improve Utilization Efficiency'}</h4>
                <ul className={cn("text-sm text-purple-700 space-y-1", isRTL && "text-right")}>
                  <li>{language === 'ar' ? '• مراجعة سياسات الموافقة المسبقة' : '• Review pre-authorization policies'}</li>
                  <li>{language === 'ar' ? '• تحسين نسبة الخسارة' : '• Improve loss ratio'}</li>
                  <li>{language === 'ar' ? '• تقليل معدل الرفض غير المبرر' : '• Reduce unjustified rejection rate'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
