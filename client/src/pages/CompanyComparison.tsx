import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCsvData, FuturePrediction, IVIScore } from "@/lib/csv";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity, AlertTriangle, ArrowRight, BarChart3, Building2, GitCompare, Heart, Smile, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CompanyComparison() {
  const { t, isRTL, language } = useLanguage();
  const [iviScores, setIviScores] = useState<IVIScore[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [company1, setCompany1] = useState<string>("");
  const [company2, setCompany2] = useState<string>("");

  const { data: dbIviScores } = trpc.ivi.scores.list.useQuery();

  useEffect(() => {
    async function loadData() {
      try {
        const [scores, predictions] = await Promise.all([
          fetchCsvData<IVIScore>('/data/ivi_scores.csv'),
          fetchCsvData<FuturePrediction>('/data/future_predictions.csv')
        ]);
        setIviScores(scores);
        setFuturePredictions(predictions);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Use database scores if available
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

  // Get company data
  const company1Data = useMemo(() => {
    return displayScores.find(s => s.CONT_NO === company1);
  }, [displayScores, company1]);

  const company2Data = useMemo(() => {
    return displayScores.find(s => s.CONT_NO === company2);
  }, [displayScores, company2]);

  // Get future predictions
  const company1Future = useMemo(() => {
    return futurePredictions.find(p => p.CONT_NO === company1);
  }, [futurePredictions, company1]);

  const company2Future = useMemo(() => {
    return futurePredictions.find(p => p.CONT_NO === company2);
  }, [futurePredictions, company2]);

  // Translate risk category
  const translateRisk = (risk: string) => {
    if (language === 'ar') {
      if (risk === 'High Risk') return 'مخاطر عالية';
      if (risk === 'Medium Risk') return 'مخاطر متوسطة';
      if (risk === 'Low Risk') return 'مخاطر منخفضة';
    }
    return risk;
  };

  // Comparison data for charts
  const comparisonData = useMemo(() => {
    if (!company1Data || !company2Data) return [];
    return [
      {
        metric: language === 'ar' ? 'الصحة (H)' : 'Health (H)',
        [company1Data.Company_Name || company1Data.CONT_NO]: company1Data.H_score,
        [company2Data.Company_Name || company2Data.CONT_NO]: company2Data.H_score,
      },
      {
        metric: language === 'ar' ? 'التجربة (E)' : 'Experience (E)',
        [company1Data.Company_Name || company1Data.CONT_NO]: company1Data.E_score,
        [company2Data.Company_Name || company2Data.CONT_NO]: company2Data.E_score,
      },
      {
        metric: language === 'ar' ? 'الاستخدام (U)' : 'Utilization (U)',
        [company1Data.Company_Name || company1Data.CONT_NO]: company1Data.U_score,
        [company2Data.Company_Name || company2Data.CONT_NO]: company2Data.U_score,
      },
      {
        metric: language === 'ar' ? 'IVI الإجمالي' : 'Total IVI',
        [company1Data.Company_Name || company1Data.CONT_NO]: company1Data.IVI_Score,
        [company2Data.Company_Name || company2Data.CONT_NO]: company2Data.IVI_Score,
      },
    ];
  }, [company1Data, company2Data, language]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!company1Data || !company2Data) return [];
    return [
      {
        subject: language === 'ar' ? 'الصحة' : 'Health',
        A: company1Data.H_score,
        B: company2Data.H_score,
        fullMark: 100,
      },
      {
        subject: language === 'ar' ? 'التجربة' : 'Experience',
        A: company1Data.E_score,
        B: company2Data.E_score,
        fullMark: 100,
      },
      {
        subject: language === 'ar' ? 'الاستخدام' : 'Utilization',
        A: company1Data.U_score,
        B: company2Data.U_score,
        fullMark: 100,
      },
    ];
  }, [company1Data, company2Data, language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GitCompare className="h-8 w-8" />
              {language === 'ar' ? 'مقارنة الشركات' : 'Company Comparison'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'قارن بين شركتين جنباً إلى جنب مع جميع مؤشرات الأداء' : 'Compare two companies side by side with all performance indicators'}
            </p>
          </div>
        </div>

        {/* Company Selection */}
        <Card className="swiss-card">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'اختر الشركات للمقارنة' : 'Select Companies to Compare'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 items-end">
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isRTL && "block text-right")}>
                  {language === 'ar' ? 'الشركة الأولى' : 'Company 1'}
                </label>
                <Select value={company1} onValueChange={setCompany1}>
                  <SelectTrigger className="bg-blue-50 border-blue-200">
                    <SelectValue placeholder={language === 'ar' ? 'اختر الشركة الأولى' : 'Select first company'} />
                  </SelectTrigger>
                  <SelectContent>
                    {displayScores.map(score => (
                      <SelectItem key={score.CONT_NO} value={score.CONT_NO} disabled={score.CONT_NO === company2}>
                        {score.Company_Name || score.CONT_NO} ({score.IVI_Score.toFixed(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-muted">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isRTL && "block text-right")}>
                  {language === 'ar' ? 'الشركة الثانية' : 'Company 2'}
                </label>
                <Select value={company2} onValueChange={setCompany2}>
                  <SelectTrigger className="bg-green-50 border-green-200">
                    <SelectValue placeholder={language === 'ar' ? 'اختر الشركة الثانية' : 'Select second company'} />
                  </SelectTrigger>
                  <SelectContent>
                    {displayScores.map(score => (
                      <SelectItem key={score.CONT_NO} value={score.CONT_NO} disabled={score.CONT_NO === company1}>
                        {score.Company_Name || score.CONT_NO} ({score.IVI_Score.toFixed(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {company1Data && company2Data ? (
          <>
            {/* Side by Side KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Company 1 Card */}
              <Card className="swiss-card border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    {company1Data.Company_Name || company1Data.CONT_NO}
                  </CardTitle>
                  <CardDescription>{company1Data.Sector} • {company1Data.Region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="text-center p-4 rounded-lg bg-blue-50">
                      <div className="text-3xl font-bold text-blue-600">{company1Data.IVI_Score.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{language === 'ar' ? 'نقاط IVI' : 'IVI Score'}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                        company1Data.Risk_Category === 'High Risk' ? "bg-red-100 text-red-800" :
                        company1Data.Risk_Category === 'Medium Risk' ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      )}>
                        {translateRisk(company1Data.Risk_Category)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{language === 'ar' ? 'الصحة' : 'Health'}</span>
                      </div>
                      <div className="text-xl font-bold">{company1Data.H_score.toFixed(1)}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Smile className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{language === 'ar' ? 'التجربة' : 'Experience'}</span>
                      </div>
                      <div className="text-xl font-bold">{company1Data.E_score.toFixed(1)}</div>
                    </div>
                    <div className="p-3 rounded-lg border col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{language === 'ar' ? 'الاستخدام' : 'Utilization'}</span>
                      </div>
                      <div className="text-xl font-bold">{company1Data.U_score.toFixed(1)}</div>
                    </div>
                    {company1Future && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'ar' ? 'IVI المتوقع' : 'Projected IVI'}</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {company1Future.Future_IVI_Score.toFixed(1)}
                          <span className="text-sm font-normal ml-2">
                            (+{(company1Future.Future_IVI_Score - company1Data.IVI_Score).toFixed(1)})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company 2 Card */}
              <Card className="swiss-card border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-500" />
                    {company2Data.Company_Name || company2Data.CONT_NO}
                  </CardTitle>
                  <CardDescription>{company2Data.Sector} • {company2Data.Region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="text-center p-4 rounded-lg bg-green-50">
                      <div className="text-3xl font-bold text-green-600">{company2Data.IVI_Score.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{language === 'ar' ? 'نقاط IVI' : 'IVI Score'}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                        company2Data.Risk_Category === 'High Risk' ? "bg-red-100 text-red-800" :
                        company2Data.Risk_Category === 'Medium Risk' ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      )}>
                        {translateRisk(company2Data.Risk_Category)}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{language === 'ar' ? 'الصحة' : 'Health'}</span>
                      </div>
                      <div className="text-xl font-bold">{company2Data.H_score.toFixed(1)}</div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Smile className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{language === 'ar' ? 'التجربة' : 'Experience'}</span>
                      </div>
                      <div className="text-xl font-bold">{company2Data.E_score.toFixed(1)}</div>
                    </div>
                    <div className="p-3 rounded-lg border col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{language === 'ar' ? 'الاستخدام' : 'Utilization'}</span>
                      </div>
                      <div className="text-xl font-bold">{company2Data.U_score.toFixed(1)}</div>
                    </div>
                    {company2Future && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{language === 'ar' ? 'IVI المتوقع' : 'Projected IVI'}</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {company2Future.Future_IVI_Score.toFixed(1)}
                          <span className="text-sm font-normal ml-2">
                            (+{(company2Future.Future_IVI_Score - company2Data.IVI_Score).toFixed(1)})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bar Chart Comparison */}
              <Card className="swiss-card">
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'مقارنة المؤشرات' : 'Metrics Comparison'}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'مقارنة جميع مؤشرات الأداء' : 'Compare all performance metrics'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey={company1Data.Company_Name || company1Data.CONT_NO} 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey={company2Data.Company_Name || company2Data.CONT_NO} 
                        fill="#22c55e" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="swiss-card">
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'مقارنة الركائز' : 'Pillars Comparison'}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'مقارنة H, E, U بشكل بصري' : 'Visual comparison of H, E, U pillars'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar 
                        name={company1Data.Company_Name || company1Data.CONT_NO} 
                        dataKey="A" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3} 
                      />
                      <Radar 
                        name={company2Data.Company_Name || company2Data.CONT_NO} 
                        dataKey="B" 
                        stroke="#22c55e" 
                        fill="#22c55e" 
                        fillOpacity={0.3} 
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Difference Analysis */}
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تحليل الفروقات' : 'Difference Analysis'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'الفرق بين الشركتين في كل مؤشر' : 'Difference between companies in each metric'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { 
                      label: language === 'ar' ? 'نقاط IVI' : 'IVI Score', 
                      diff: company1Data.IVI_Score - company2Data.IVI_Score,
                      icon: <BarChart3 className="h-5 w-5" />
                    },
                    { 
                      label: language === 'ar' ? 'الصحة (H)' : 'Health (H)', 
                      diff: company1Data.H_score - company2Data.H_score,
                      icon: <Heart className="h-5 w-5" />
                    },
                    { 
                      label: language === 'ar' ? 'التجربة (E)' : 'Experience (E)', 
                      diff: company1Data.E_score - company2Data.E_score,
                      icon: <Smile className="h-5 w-5" />
                    },
                    { 
                      label: language === 'ar' ? 'الاستخدام (U)' : 'Utilization (U)', 
                      diff: company1Data.U_score - company2Data.U_score,
                      icon: <Activity className="h-5 w-5" />
                    },
                  ].map((item, index) => (
                    <div key={index} className="p-4 rounded-lg border text-center">
                      <div className="flex items-center justify-center gap-2 mb-2 text-muted-foreground">
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className={cn(
                        "text-2xl font-bold flex items-center justify-center gap-1",
                        item.diff > 0 ? "text-blue-600" : item.diff < 0 ? "text-green-600" : "text-gray-600"
                      )}>
                        {item.diff > 0 ? <TrendingUp className="h-5 w-5" /> : item.diff < 0 ? <TrendingDown className="h-5 w-5" /> : null}
                        {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.diff > 0 
                          ? (language === 'ar' ? `${company1Data.Company_Name || company1Data.CONT_NO} أعلى` : `${company1Data.Company_Name || company1Data.CONT_NO} higher`)
                          : item.diff < 0 
                          ? (language === 'ar' ? `${company2Data.Company_Name || company2Data.CONT_NO} أعلى` : `${company2Data.Company_Name || company2Data.CONT_NO} higher`)
                          : (language === 'ar' ? 'متساوي' : 'Equal')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'التوصيات' : 'Recommendations'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={cn("p-4 rounded-lg bg-blue-50 border border-blue-200", isRTL && "text-right")}>
                    <div className="font-medium text-blue-800 mb-2">
                      {company1Data.Company_Name || company1Data.CONT_NO}
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {company1Data.H_score < company2Data.H_score && (
                        <li>• {language === 'ar' ? 'تحسين برامج الصحة الوقائية' : 'Improve preventive health programs'}</li>
                      )}
                      {company1Data.E_score < company2Data.E_score && (
                        <li>• {language === 'ar' ? 'تعزيز تجربة العملاء' : 'Enhance customer experience'}</li>
                      )}
                      {company1Data.U_score < company2Data.U_score && (
                        <li>• {language === 'ar' ? 'تحسين كفاءة الاستخدام' : 'Optimize utilization efficiency'}</li>
                      )}
                      {company1Data.IVI_Score >= company2Data.IVI_Score && (
                        <li>• {language === 'ar' ? 'الحفاظ على الأداء الحالي' : 'Maintain current performance'}</li>
                      )}
                    </ul>
                  </div>
                  <div className={cn("p-4 rounded-lg bg-green-50 border border-green-200", isRTL && "text-right")}>
                    <div className="font-medium text-green-800 mb-2">
                      {company2Data.Company_Name || company2Data.CONT_NO}
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      {company2Data.H_score < company1Data.H_score && (
                        <li>• {language === 'ar' ? 'تحسين برامج الصحة الوقائية' : 'Improve preventive health programs'}</li>
                      )}
                      {company2Data.E_score < company1Data.E_score && (
                        <li>• {language === 'ar' ? 'تعزيز تجربة العملاء' : 'Enhance customer experience'}</li>
                      )}
                      {company2Data.U_score < company1Data.U_score && (
                        <li>• {language === 'ar' ? 'تحسين كفاءة الاستخدام' : 'Optimize utilization efficiency'}</li>
                      )}
                      {company2Data.IVI_Score >= company1Data.IVI_Score && (
                        <li>• {language === 'ar' ? 'الحفاظ على الأداء الحالي' : 'Maintain current performance'}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="swiss-card">
            <CardContent className="py-16 text-center">
              <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ar' ? 'اختر شركتين للمقارنة' : 'Select Two Companies to Compare'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'استخدم القوائم المنسدلة أعلاه لاختيار الشركات التي تريد مقارنتها'
                  : 'Use the dropdowns above to select the companies you want to compare'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
