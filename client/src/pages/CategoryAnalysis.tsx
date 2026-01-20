import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Building, TrendingUp, TrendingDown, Activity, Users, DollarSign, Target, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Hospital, Stethoscope, Pill, ThumbsUp, ThumbsDown, Lightbulb, Scale, Heart, Bell, Award, Sliders, Layers, Sparkles, TreePine, Coffee, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

// SME Companies Data
const smeData = {
  totalCompanies: 7,
  totalEmployees: 26651,
  totalPremium: 170798564,
  avgIVI: 45.92,
  avgH: 39.15,
  avgE: 5.29,
  avgU: 100,
  highRisk: 6,
  mediumRisk: 1,
  lowRisk: 0,
  avgChronicRate: 29.93,
  avgLossRatio: 33.29,
  predictedImprovement: 8.5,
  companies: [
    { name: "Saudi Aramco", ivi: 55.14, h: 43.86, e: 27.97, u: 100 },
    { name: "STC", ivi: 41.15, h: 31.84, e: 0, u: 100 },
    { name: "Elm Company", ivi: 44.18, h: 40.52, e: 0, u: 100 },
    { name: "Tasnee", ivi: 41.48, h: 32.79, e: 0, u: 100 },
    { name: "Saudi Electricity", ivi: 46.25, h: 46.44, e: 0, u: 100 },
    { name: "Petro Rabigh", ivi: 48.07, h: 42.59, e: 9.04, u: 100 },
    { name: "Sahara Petrochemical", ivi: 44.18, h: 40.52, e: 0, u: 100 },
  ]
};

// Key Account Companies Data
const keyAccountData = {
  totalCompanies: 18,
  totalEmployees: 195384,
  totalPremium: 477647685,
  avgIVI: 42.48,
  avgH: 36.47,
  avgE: 2.15,
  avgU: 94.90,
  highRisk: 18,
  mediumRisk: 0,
  lowRisk: 0,
  avgChronicRate: 32.18,
  avgLossRatio: 31.47,
  predictedImprovement: 6.2,
  companies: [
    { name: "SABIC", ivi: 13.56, h: 31.75, e: 0, u: 8.16 },
    { name: "Al Rajhi Bank", ivi: 43.9, h: 39.1, e: 0.63, u: 100 },
    { name: "Saudi Airlines", ivi: 41.88, h: 33.96, e: 0, u: 100 },
    { name: "ACWA Power", ivi: 45.21, h: 37.74, e: 5.73, u: 100 },
    { name: "Ma'aden", ivi: 41.44, h: 32.68, e: 0, u: 100 },
    { name: "Almarai", ivi: 40.68, h: 30.5, e: 0, u: 100 },
    { name: "Jarir Bookstore", ivi: 46.23, h: 39.52, e: 6.84, u: 100 },
    { name: "Mobily", ivi: 41.09, h: 31.68, e: 0, u: 100 },
  ]
};

// Comparison data for charts
const comparisonData = [
  { metric: "IVI Score", sme: smeData.avgIVI, keyAccount: keyAccountData.avgIVI },
  { metric: "H Score", sme: smeData.avgH, keyAccount: keyAccountData.avgH },
  { metric: "E Score", sme: smeData.avgE, keyAccount: keyAccountData.avgE },
  { metric: "U Score", sme: smeData.avgU, keyAccount: keyAccountData.avgU },
];

const radarData = [
  { subject: "IVI", sme: smeData.avgIVI, keyAccount: keyAccountData.avgIVI, fullMark: 100 },
  { subject: "Health (H)", sme: smeData.avgH, keyAccount: keyAccountData.avgH, fullMark: 100 },
  { subject: "Experience (E)", sme: smeData.avgE, keyAccount: keyAccountData.avgE, fullMark: 100 },
  { subject: "Utilization (U)", sme: smeData.avgU, keyAccount: keyAccountData.avgU, fullMark: 100 },
];

const forecastData = [
  { month: "Jan", sme: 45.92, keyAccount: 42.48 },
  { month: "Feb", sme: 46.5, keyAccount: 42.9 },
  { month: "Mar", sme: 47.2, keyAccount: 43.4 },
  { month: "Apr", sme: 48.0, keyAccount: 43.9 },
  { month: "May", sme: 48.8, keyAccount: 44.5 },
  { month: "Jun", sme: 49.5, keyAccount: 45.0 },
  { month: "Jul", sme: 50.3, keyAccount: 45.6 },
  { month: "Aug", sme: 51.0, keyAccount: 46.1 },
  { month: "Sep", sme: 51.8, keyAccount: 46.7 },
  { month: "Oct", sme: 52.5, keyAccount: 47.2 },
  { month: "Nov", sme: 53.2, keyAccount: 47.8 },
  { month: "Dec", sme: 54.0, keyAccount: 48.5 },
];

const distributionData = [
  { name: "SME", value: smeData.totalCompanies, color: "#3B82F6" },
  { name: "Key Account", value: keyAccountData.totalCompanies, color: "#8B5CF6" },
];

// Providers Data
const providersData = {
  totalProviders: 156,
  hospitals: 45,
  clinics: 78,
  pharmacies: 33,
  totalPreAuths: 12847,
  approvedRate: 78.5,
  rejectedRate: 21.5,
  avgProcessingTime: 2.3,
  topProviders: [
    { name: "King Faisal Specialist Hospital", type: "Hospital", preAuths: 1245, approvalRate: 82.3 },
    { name: "Saudi German Hospital", type: "Hospital", preAuths: 987, approvalRate: 79.8 },
    { name: "Dr. Sulaiman Al Habib", type: "Hospital", preAuths: 876, approvalRate: 85.2 },
    { name: "Al Mouwasat Hospital", type: "Hospital", preAuths: 654, approvalRate: 77.4 },
    { name: "Dallah Hospital", type: "Hospital", preAuths: 543, approvalRate: 81.1 },
  ],
  byCategory: {
    sme: { preAuths: 4521, approvalRate: 81.2, avgCost: 2450 },
    keyAccount: { preAuths: 8326, approvalRate: 76.8, avgCost: 3120 },
  },
  byType: [
    { type: "Hospital", count: 45, preAuths: 8234, approvalRate: 75.3, color: "#EF4444" },
    { type: "Clinic", count: 78, preAuths: 3456, approvalRate: 84.7, color: "#10B981" },
    { type: "Pharmacy", count: 33, preAuths: 1157, approvalRate: 92.1, color: "#3B82F6" },
  ],
};

// Provider comparison by company category
const providerCategoryComparison = [
  { metric: "Pre-Auths", sme: providersData.byCategory.sme.preAuths, keyAccount: providersData.byCategory.keyAccount.preAuths },
  { metric: "Approval Rate", sme: providersData.byCategory.sme.approvalRate, keyAccount: providersData.byCategory.keyAccount.approvalRate },
  { metric: "Avg Cost (SAR)", sme: providersData.byCategory.sme.avgCost, keyAccount: providersData.byCategory.keyAccount.avgCost },
];

export default function CategoryAnalysis() {
  const { isRTL } = useLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 35) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifference = (sme: number, ka: number) => {
    const diff = sme - ka;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      icon: diff > 0 ? ArrowUpRight : ArrowDownRight,
      color: diff > 0 ? "text-green-600" : "text-red-600"
    };
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        {/* Header with Time Period Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              {isRTL ? "تحليل مقارنة الفئات" : "Category Analysis"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? "مقارنة أداء IVI بين الشركات الصغيرة والمتوسطة (SME) والشركات الكبيرة (Key Account)"
                : "Compare IVI performance between SME and Key Account companies"
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="current">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isRTL ? "اختر الفترة" : "Select Period"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{isRTL ? "الفترة الحالية" : "Current Period"}</SelectItem>
                <SelectItem value="q1">{isRTL ? "الربع الأول Q1" : "Q1 (Jan-Mar)"}</SelectItem>
                <SelectItem value="q2">{isRTL ? "الربع الثاني Q2" : "Q2 (Apr-Jun)"}</SelectItem>
                <SelectItem value="q3">{isRTL ? "الربع الثالث Q3" : "Q3 (Jul-Sep)"}</SelectItem>
                <SelectItem value="q4">{isRTL ? "الربع الرابع Q4" : "Q4 (Oct-Dec)"}</SelectItem>
                <SelectItem value="yearly">{isRTL ? "سنوي (2024)" : "Yearly (2024)"}</SelectItem>
                <SelectItem value="yoy">{isRTL ? "مقارنة سنوية" : "Year-over-Year"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* SME Summary */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {isRTL ? "الشركات الصغيرة والمتوسطة (SME)" : "SME Companies"}
              </CardTitle>
              <CardDescription>
                {isRTL ? `${smeData.totalCompanies} شركة` : `${smeData.totalCompanies} companies`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(smeData.avgIVI)}`}>{smeData.avgIVI.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "متوسط IVI" : "Avg IVI"}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{smeData.totalEmployees.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "الموظفين" : "Employees"}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{smeData.predictedImprovement}%</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "التحسن المتوقع" : "Expected Improvement"}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge className="bg-red-100 text-red-800">{smeData.highRisk} {isRTL ? "عالي" : "High"}</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">{smeData.mediumRisk} {isRTL ? "متوسط" : "Medium"}</Badge>
                <Badge className="bg-green-100 text-green-800">{smeData.lowRisk} {isRTL ? "منخفض" : "Low"}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Key Account Summary */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                {isRTL ? "الشركات الكبيرة (Key Account)" : "Key Account Companies"}
              </CardTitle>
              <CardDescription>
                {isRTL ? `${keyAccountData.totalCompanies} شركة` : `${keyAccountData.totalCompanies} companies`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(keyAccountData.avgIVI)}`}>{keyAccountData.avgIVI.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "متوسط IVI" : "Avg IVI"}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{keyAccountData.totalEmployees.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "الموظفين" : "Employees"}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{keyAccountData.predictedImprovement}%</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? "التحسن المتوقع" : "Expected Improvement"}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge className="bg-red-100 text-red-800">{keyAccountData.highRisk} {isRTL ? "عالي" : "High"}</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">{keyAccountData.mediumRisk} {isRTL ? "متوسط" : "Medium"}</Badge>
                <Badge className="bg-green-100 text-green-800">{keyAccountData.lowRisk} {isRTL ? "منخفض" : "Low"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "مقارنة المؤشرات الرئيسية" : "Key Metrics Comparison"}</CardTitle>
            <CardDescription>
              {isRTL ? "الفرق بين أداء SME و Key Account" : "Performance difference between SME and Key Account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: isRTL ? "متوسط IVI" : "Avg IVI", sme: smeData.avgIVI, ka: keyAccountData.avgIVI },
                { label: isRTL ? "درجة الصحة (H)" : "Health Score (H)", sme: smeData.avgH, ka: keyAccountData.avgH },
                { label: isRTL ? "درجة التجربة (E)" : "Experience Score (E)", sme: smeData.avgE, ka: keyAccountData.avgE },
                { label: isRTL ? "درجة الاستخدام (U)" : "Utilization Score (U)", sme: smeData.avgU, ka: keyAccountData.avgU },
              ].map((item, index) => {
                const diff = getDifference(item.sme, item.ka);
                const DiffIcon = diff.icon;
                return (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">{item.label}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-blue-600">SME</div>
                          <div className={`text-lg font-bold ${getScoreColor(item.sme)}`}>{item.sme.toFixed(1)}</div>
                        </div>
                        <div className={`flex items-center gap-1 ${diff.color}`}>
                          <DiffIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{diff.value}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-600">Key Account</div>
                          <div className={`text-lg font-bold ${getScoreColor(item.ka)}`}>{item.ka.toFixed(1)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="comparison">{isRTL ? "المقارنة" : "Comparison"}</TabsTrigger>
            <TabsTrigger value="forecast">{isRTL ? "التوقعات" : "Forecast"}</TabsTrigger>
            <TabsTrigger value="radar">{isRTL ? "الرادار" : "Radar"}</TabsTrigger>
            <TabsTrigger value="insights">{isRTL ? "الرؤى" : "Insights"}</TabsTrigger>
            <TabsTrigger value="providers">{isRTL ? "مقدمو الخدمات" : "Providers"}</TabsTrigger>
            <TabsTrigger value="philosophy">{isRTL ? "الفلسفة والابتكار" : "Philosophy"}</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مقارنة الدرجات" : "Score Comparison"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="metric" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sme" name="SME" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="keyAccount" name="Key Account" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "توقعات IVI لـ 12 شهر" : "12-Month IVI Forecast"}</CardTitle>
                <CardDescription>
                  {isRTL ? "مسار التحسن المتوقع لكل فئة" : "Expected improvement trajectory for each category"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[40, 60]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sme" name="SME" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="keyAccount" name="Key Account" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radar">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مقارنة الأبعاد" : "Dimension Comparison"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="SME" dataKey="sme" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Key Account" dataKey="keyAccount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-4 md:grid-cols-2">
              {/* SME Insights */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Building2 className="h-5 w-5" />
                    {isRTL ? "رؤى SME" : "SME Insights"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      {isRTL ? "نقاط القوة" : "Strengths"}
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {isRTL ? "متوسط IVI أعلى بـ 3.4 نقطة" : "Higher average IVI by 3.4 points"}</li>
                      <li>• {isRTL ? "درجة صحة (H) أفضل بـ 2.7 نقطة" : "Better Health score (H) by 2.7 points"}</li>
                      <li>• {isRTL ? "درجة تجربة (E) أعلى بـ 3.1 نقطة" : "Higher Experience score (E) by 3.1 points"}</li>
                      <li>• {isRTL ? "توقع تحسن أعلى (+8.5% مقابل +6.2%)" : "Higher improvement forecast (+8.5% vs +6.2%)"}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      {isRTL ? "نقاط الضعف" : "Weaknesses"}
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {isRTL ? "عدد أقل من الشركات (7 مقابل 18)" : "Fewer companies (7 vs 18)"}</li>
                      <li>• {isRTL ? "86% في فئة المخاطر العالية" : "86% in high risk category"}</li>
                      <li>• {isRTL ? "نسبة خسارة أعلى قليلاً (33.3%)" : "Slightly higher loss ratio (33.3%)"}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Key Account Insights */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Building className="h-5 w-5" />
                    {isRTL ? "رؤى Key Account" : "Key Account Insights"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      {isRTL ? "نقاط القوة" : "Strengths"}
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {isRTL ? "قاعدة عملاء أكبر (18 شركة)" : "Larger client base (18 companies)"}</li>
                      <li>• {isRTL ? "إجمالي موظفين أعلى (195K)" : "Higher total employees (195K)"}</li>
                      <li>• {isRTL ? "إجمالي أقساط أعلى (478M SAR)" : "Higher total premium (478M SAR)"}</li>
                      <li>• {isRTL ? "نسبة خسارة أقل (31.5%)" : "Lower loss ratio (31.5%)"}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      {isRTL ? "نقاط الضعف" : "Weaknesses"}
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• {isRTL ? "100% في فئة المخاطر العالية" : "100% in high risk category"}</li>
                      <li>• {isRTL ? "درجة تجربة (E) منخفضة جداً (2.15)" : "Very low Experience score (E) at 2.15"}</li>
                      <li>• {isRTL ? "معدل أمراض مزمنة أعلى (32.2%)" : "Higher chronic rate (32.2%)"}</li>
                      <li>• {isRTL ? "توقع تحسن أقل (+6.2%)" : "Lower improvement forecast (+6.2%)"}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  {isRTL ? "التوصيات الاستراتيجية" : "Strategic Recommendations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">{isRTL ? "لشركات SME" : "For SME Companies"}</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>1. {isRTL ? "الاستفادة من معدل التحسن الأعلى لتسريع النمو" : "Leverage higher improvement rate to accelerate growth"}</li>
                      <li>2. {isRTL ? "التركيز على تحسين درجة التجربة (E) للوصول إلى 50+" : "Focus on improving Experience score (E) to reach 50+"}</li>
                      <li>3. {isRTL ? "تطبيق برامج الرعاية الوقائية لتقليل نسبة الخسارة" : "Implement preventive care programs to reduce loss ratio"}</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">{isRTL ? "لشركات Key Account" : "For Key Account Companies"}</h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>1. {isRTL ? "الأولوية القصوى لتحسين درجة التجربة (E) من 2.15 إلى 30+" : "Top priority: improve Experience score (E) from 2.15 to 30+"}</li>
                      <li>2. {isRTL ? "برامج إدارة الأمراض المزمنة لتقليل المعدل من 32.2%" : "Chronic disease management programs to reduce rate from 32.2%"}</li>
                      <li>3. {isRTL ? "تحسين عمليات الموافقة المسبقة لرفع رضا العملاء" : "Improve pre-authorization processes to increase satisfaction"}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Provider Summary Cards */}
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Hospital className="h-5 w-5" />
                    {isRTL ? "المستشفيات" : "Hospitals"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{providersData.hospitals}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? `${providersData.byType[0].preAuths.toLocaleString()} موافقة مسبقة` : `${providersData.byType[0].preAuths.toLocaleString()} pre-auths`}</div>
                  <div className="text-sm text-green-600">{providersData.byType[0].approvalRate}% {isRTL ? "معدل الموافقة" : "approval rate"}</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Stethoscope className="h-5 w-5" />
                    {isRTL ? "العيادات" : "Clinics"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{providersData.clinics}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? `${providersData.byType[1].preAuths.toLocaleString()} موافقة مسبقة` : `${providersData.byType[1].preAuths.toLocaleString()} pre-auths`}</div>
                  <div className="text-sm text-green-600">{providersData.byType[1].approvalRate}% {isRTL ? "معدل الموافقة" : "approval rate"}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Pill className="h-5 w-5" />
                    {isRTL ? "الصيدليات" : "Pharmacies"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{providersData.pharmacies}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? `${providersData.byType[2].preAuths.toLocaleString()} موافقة مسبقة` : `${providersData.byType[2].preAuths.toLocaleString()} pre-auths`}</div>
                  <div className="text-sm text-green-600">{providersData.byType[2].approvalRate}% {isRTL ? "معدل الموافقة" : "approval rate"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Provider Performance by Category */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{isRTL ? "أداء مقدمي الخدمات حسب فئة الشركات" : "Provider Performance by Company Category"}</CardTitle>
                <CardDescription>
                  {isRTL ? "مقارنة استخدام مقدمي الخدمات بين SME و Key Account" : "Comparing provider utilization between SME and Key Account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      SME
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "الموافقات المسبقة" : "Pre-Authorizations"}</span>
                        <span className="font-bold">{providersData.byCategory.sme.preAuths.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "معدل الموافقة" : "Approval Rate"}</span>
                        <span className="font-bold text-green-600">{providersData.byCategory.sme.approvalRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "متوسط التكلفة" : "Avg Cost"}</span>
                        <span className="font-bold">{providersData.byCategory.sme.avgCost.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Key Account
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "الموافقات المسبقة" : "Pre-Authorizations"}</span>
                        <span className="font-bold">{providersData.byCategory.keyAccount.preAuths.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "معدل الموافقة" : "Approval Rate"}</span>
                        <span className="font-bold text-yellow-600">{providersData.byCategory.keyAccount.approvalRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{isRTL ? "متوسط التكلفة" : "Avg Cost"}</span>
                        <span className="font-bold">{providersData.byCategory.keyAccount.avgCost.toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Providers Table */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{isRTL ? "أفضل مقدمي الخدمات" : "Top Providers"}</CardTitle>
                <CardDescription>
                  {isRTL ? "مقدمو الخدمات الأكثر استخداماً" : "Most utilized healthcare providers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">{isRTL ? "المزود" : "Provider"}</th>
                        <th className="text-left py-2">{isRTL ? "النوع" : "Type"}</th>
                        <th className="text-right py-2">{isRTL ? "الموافقات" : "Pre-Auths"}</th>
                        <th className="text-right py-2">{isRTL ? "معدل الموافقة" : "Approval Rate"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providersData.topProviders.map((provider, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-medium">{provider.name}</td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-xs">
                              <Hospital className="h-3 w-3 mr-1" />
                              {provider.type}
                            </Badge>
                          </td>
                          <td className="py-2 text-right">{provider.preAuths.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            <span className={provider.approvalRate >= 80 ? "text-green-600" : "text-yellow-600"}>
                              {provider.approvalRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Provider Insights */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <ThumbsUp className="h-5 w-5" />
                    {isRTL ? "نقاط القوة" : "Strengths"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {isRTL ? "معدل موافقة عالي للصيدليات (92.1%)" : "High approval rate for pharmacies (92.1%)"}</li>
                    <li>• {isRTL ? "معدل موافقة أعلى لشركات SME (81.2%)" : "Higher approval rate for SME companies (81.2%)"}</li>
                    <li>• {isRTL ? "متوسط تكلفة أقل لشركات SME (2,450 SAR)" : "Lower avg cost for SME companies (2,450 SAR)"}</li>
                    <li>• {isRTL ? "شبكة واسعة من العيادات (78 عيادة)" : "Wide network of clinics (78 clinics)"}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <ThumbsDown className="h-5 w-5" />
                    {isRTL ? "نقاط الضعف" : "Weaknesses"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {isRTL ? "معدل موافقة منخفض للمستشفيات (75.3%)" : "Lower approval rate for hospitals (75.3%)"}</li>
                    <li>• {isRTL ? "معدل موافقة أقل لشركات Key Account (76.8%)" : "Lower approval rate for Key Account (76.8%)"}</li>
                    <li>• {isRTL ? "تكلفة أعلى لشركات Key Account (3,120 SAR)" : "Higher cost for Key Account (3,120 SAR)"}</li>
                    <li>• {isRTL ? "معدل رفض عام 21.5%" : "Overall rejection rate of 21.5%"}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="philosophy">
            {/* Nordic Philosophy Section - Aligned with CCHI Standards */}
            <Card className="mb-4 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Sparkles className="h-6 w-6" />
                  {isRTL ? "الفلسفة الاسكندنافية ومعايير مجلس الضمان الصحي" : "Nordic Philosophy & CCHI Standards Alignment"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "هذه الفلسفة تتماشى مع معايير بوبا ومجلس الضمان الصحي التعاوني (CCHI)"
                    : "This philosophy aligns with Bupa and CCHI (Council of Cooperative Health Insurance) standards"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Lagom - VBHC */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                        <Scale className="h-5 w-5" />
                        Lagom
                      </CardTitle>
                      <CardDescription className="text-blue-600 font-semibold">
                        {isRTL ? "← معيار الرعاية القائمة على القيمة (VBHC)" : "Value-Based Healthcare (VBHC) →"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "في نظام IVI، نطبق 'Lagom' من خلال الاستخدام الأمثل للموارد عبر العيادات الرقمية. يتماشى مع توجه المجلس في الحد من الهدر المالي (Waste)."
                          : "In IVI, we apply 'Lagom' through optimal resource utilization via digital clinics. Aligns with CCHI's focus on reducing financial waste."
                        }
                      </p>
                      <div className="p-2 bg-blue-100 rounded-lg mb-2">
                        <p className="text-xs text-blue-800">
                          {isRTL 
                            ? "العيادات الرقمية تضمن حصول المريض على الخدمة 'المناسبة' في الوقت المناسب، مما يقلل من الزيارات غير الضرورية للطوارئ والفحوصات المكررة."
                            : "Digital clinics ensure patients receive the 'right' service at the right time, reducing unnecessary ER visits and duplicate tests."
                          }
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className="bg-blue-100 text-blue-800">{isRTL ? "الاستدامة المالية" : "Financial Sustainability"}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{isRTL ? "تقليل الهدر" : "Waste Reduction"}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hygge - Patient Experience */}
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-amber-700 text-lg">
                        <Coffee className="h-5 w-5" />
                        Hygge
                      </CardTitle>
                      <CardDescription className="text-amber-600 font-semibold">
                        {isRTL ? "← معيار تجربة المريض (Patient Experience)" : "Patient Experience Standard →"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "'Hygge' في IVI تعني سلاسة الوصول للرعاية (Access to Care) وتوطين الخدمة رقمياً. المجلس يركز على (Patient Journey)."
                          : "'Hygge' in IVI means seamless Access to Care and digital service localization. CCHI focuses on Patient Journey."
                        }
                      </p>
                      <div className="p-2 bg-amber-100 rounded-lg mb-2">
                        <p className="text-xs text-amber-800">
                          {isRTL 
                            ? "العيادات الرقمية للأمراض المزمنة توفر تجربة 'مطمئنة' ومريحة للمريض في منزله، مما يقلل من جهد التنقل وفترات الانتظار."
                            : "Digital clinics for chronic diseases provide a 'reassuring' and comfortable experience at home, reducing travel effort and waiting times."
                          }
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className="bg-amber-100 text-amber-800">{isRTL ? "رحلة المستفيد" : "Patient Journey"}</Badge>
                        <Badge className="bg-amber-100 text-amber-800">{isRTL ? "سهولة الوصول" : "Easy Access"}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Friluftsliv - Population Health Management */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                        <TreePine className="h-5 w-5" />
                        Friluftsliv
                      </CardTitle>
                      <CardDescription className="text-green-600 font-semibold">
                        {isRTL ? "← معيار إدارة صحة السكان (PHM)" : "Population Health Management →"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "نستخدم 'Friluftsliv' كرمز للوقاية الأولية والتمكين الصحي (Patient Empowerment) عبر العيادات الرقمية."
                          : "We use 'Friluftsliv' as a symbol for Primary Prevention and Patient Empowerment through digital clinics."
                        }
                      </p>
                      <div className="p-2 bg-green-100 rounded-lg mb-2">
                        <p className="text-xs text-green-800">
                          {isRTL 
                            ? "من خلال العيادات الرقمية، نقوم بتعزيز إدارة الأمراض المزمنة (السكري والضغط) عبر المتابعة المستمرة والبيانات اللحظية، مما يقلل المضاعفات."
                            : "Through digital clinics, we enhance chronic disease management (diabetes, hypertension) via continuous monitoring and real-time data, reducing complications."
                          }
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge className="bg-green-100 text-green-800">{isRTL ? "برامج Wellness" : "Wellness Programs"}</Badge>
                        <Badge className="bg-green-100 text-green-800">{isRTL ? "التدخلات الوقائية" : "Preventive Interventions"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Innovative Ideas Section */}
            <Card className="mb-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Lightbulb className="h-6 w-6" />
                  {isRTL ? "أفكار مبتكرة لإبهار اللجنة" : "Innovative Ideas"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "أفكار تقنية وإدارية ترفع من قيمة المشروع"
                    : "Technical and managerial ideas that elevate the project's value"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Predictive Nudge */}
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                        <Bell className="h-5 w-5" />
                        {isRTL ? "نظام الإنذار المبكر" : "Predictive Nudge"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "البرمجية ترسل تنبيهاً آلياً لقسم المبيعات عندما يتنبأ النموذج بأن شركة معينة في طريقها للتحول من 'مخاطر منخفضة' إلى 'مخاطر عالية' خلال 6 أشهر."
                          : "The system sends automatic alerts to sales when the model predicts a company is heading from 'low risk' to 'high risk' within 6 months."
                        }
                      </p>
                      <Badge className="bg-red-100 text-red-800">{isRTL ? "مفعل في النظام" : "Active in System"}</Badge>
                    </CardContent>
                  </Card>

                  {/* Health Sustainability Index */}
                  <Card className="border-emerald-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-emerald-700 text-lg">
                        <Award className="h-5 w-5" />
                        {isRTL ? "مؤشر الاستدامة الصحية" : "Health Sustainability Index"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "الشركة التي تحافظ على درجة IVI مرتفعة لمدة 3 سنوات تحصل على 'شهادة استدامة صحية' من بوبا، مما يحسن سمعتها أمام المستثمرين."
                          : "Companies maintaining high IVI for 3 years receive a 'Health Sustainability Certificate' from Bupa, improving their reputation with investors."
                        }
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-800">{isRTL ? "مرتبط بـ ESG" : "ESG Linked"}</Badge>
                    </CardContent>
                  </Card>

                  {/* What-If Simulator */}
                  <Card className="border-violet-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-violet-700 text-lg">
                        <Sliders className="h-5 w-5" />
                        {isRTL ? "محاكي 'ماذا لو؟'" : "What-If Simulator"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "أداة تفاعلية تمكن مدير الموارد البشرية من تجربة سيناريوهات: 'إذا انخفضت السكريات بنسبة 10%، كيف ستتحسن درجة IVI؟'"
                          : "Interactive tool enabling HR managers to test scenarios: 'If diabetes drops 10%, how will my IVI score improve?'"
                        }
                      </p>
                      <Badge className="bg-violet-100 text-violet-800">{isRTL ? "متاح في السيناريوهات" : "Available in Scenarios"}</Badge>
                    </CardContent>
                  </Card>

                  {/* Fair Segmentation */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
                        <Layers className="h-5 w-5" />
                        {isRTL ? "خوارزمية التجزئة العادلة" : "Fair Segmentation"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {isRTL 
                          ? "تصنيف الشركات بناءً على 'قابليتها للتحسن' وليس فقط حجم المطالبات."
                          : "Classifying companies based on their 'improvement potential', not just claims volume."
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800">{isRTL ? "المستقرون" : "The Steady"}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{isRTL ? "القابلون للتطوير" : "The Improvers"}</Badge>
                        <Badge className="bg-red-100 text-red-800">{isRTL ? "تحت المجهر" : "The Critical"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary Quote */}
            <Card className="border-indigo-300 bg-gradient-to-r from-indigo-100 to-purple-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Leaf className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                  <blockquote className="text-lg font-medium text-indigo-800 italic max-w-3xl mx-auto">
                    {isRTL 
                      ? '"رؤيتنا لمؤشر IVI تتجاوز كونه معادلة رياضية؛ لقد استلهمنا من النموذج النوردي مفهوم \'\u0627\u0644\u062b\u0642\u0629 \u0627\u0644\u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\'. هدفنا ليس فقط التنبؤ بمن سيغادر بوبا، بل بناء نظام يجعل العميل \'\u064a\u0631\u063a\u0628\' في البقاء لأن بوبا أصبحت شريكاً في نمو صحة موظفيه وليست مجرد شركة دفع فواتير."'
                      : '"Our vision for IVI goes beyond being a mathematical formula; we drew inspiration from the Nordic model\'s concept of \'data-driven trust\'. Our goal is not just to predict who will leave Bupa, but to build a system that makes clients \'want\' to stay because Bupa has become a partner in their employees\' health growth, not just a bill-paying company."'
                    }
                  </blockquote>
                  <p className="text-sm text-indigo-600 mt-4">
                    {isRTL ? "— الملخص التنفيذي للعرض" : "— Executive Summary for Presentation"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
