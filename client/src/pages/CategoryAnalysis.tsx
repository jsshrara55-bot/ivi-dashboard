import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Building, TrendingUp, TrendingDown, Activity, Users, DollarSign, Target, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart } from "lucide-react";
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
        {/* Header */}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">{isRTL ? "المقارنة" : "Comparison"}</TabsTrigger>
            <TabsTrigger value="forecast">{isRTL ? "التوقعات" : "Forecast"}</TabsTrigger>
            <TabsTrigger value="radar">{isRTL ? "الرادار" : "Radar"}</TabsTrigger>
            <TabsTrigger value="insights">{isRTL ? "الرؤى" : "Insights"}</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
