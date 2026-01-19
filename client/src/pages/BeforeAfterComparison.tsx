import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, TrendingUp, TrendingDown, Activity, Heart, Users, DollarSign, Scale, Coffee, TreePine, Sparkles, CheckCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// Before/After Data
const beforeData = {
  avgIVI: 41.4,
  avgH: 36.8,
  avgE: 3.2,
  avgU: 96.5,
  highRisk: 24,
  mediumRisk: 1,
  lowRisk: 0,
  chronicRate: 31.5,
  lossRatio: 32.1,
  claimsPerMember: 4.2,
  approvalRate: 78.5,
  avgClaimTime: 5.2,
  customerSatisfaction: 72,
};

const afterData = {
  avgIVI: 58.7,
  avgH: 52.4,
  avgE: 18.6,
  avgU: 98.2,
  highRisk: 8,
  mediumRisk: 12,
  lowRisk: 5,
  chronicRate: 24.3,
  lossRatio: 26.8,
  claimsPerMember: 3.1,
  approvalRate: 89.2,
  avgClaimTime: 2.8,
  customerSatisfaction: 88,
};

const comparisonData = [
  { name: "IVI", before: beforeData.avgIVI, after: afterData.avgIVI },
  { name: "H", before: beforeData.avgH, after: afterData.avgH },
  { name: "E", before: beforeData.avgE, after: afterData.avgE },
  { name: "U", before: beforeData.avgU, after: afterData.avgU },
];

const radarData = [
  { metric: "Health (H)", before: beforeData.avgH, after: afterData.avgH, fullMark: 100 },
  { metric: "Experience (E)", before: beforeData.avgE, after: afterData.avgE, fullMark: 100 },
  { metric: "Utilization (U)", before: beforeData.avgU, after: afterData.avgU, fullMark: 100 },
  { metric: "Satisfaction", before: beforeData.customerSatisfaction, after: afterData.customerSatisfaction, fullMark: 100 },
  { metric: "Approval Rate", before: beforeData.approvalRate, after: afterData.approvalRate, fullMark: 100 },
];

const timelineData = [
  { month: "M0", before: 41.4, after: 41.4 },
  { month: "M3", before: 41.8, after: 45.2 },
  { month: "M6", before: 42.1, after: 49.8 },
  { month: "M9", before: 42.5, after: 54.1 },
  { month: "M12", before: 42.8, after: 58.7 },
];

export default function BeforeAfterComparison() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const calculateChange = (before: number, after: number) => {
    const change = ((after - before) / before) * 100;
    return change.toFixed(1);
  };

  const philosophyImpact = [
    {
      philosophy: "Lagom",
      icon: Scale,
      color: "blue",
      metric: isRTL ? "كفاءة الاستخدام (U)" : "Utilization (U)",
      before: beforeData.avgU,
      after: afterData.avgU,
      impact: isRTL 
        ? "تحول من الاستهلاك العشوائي إلى الاستخدام الذكي - فحوصات وقائية أكثر، عمليات جراحية أقل"
        : "Shift from random consumption to smart usage - more preventive checkups, fewer surgeries",
    },
    {
      philosophy: "Hygge",
      icon: Coffee,
      color: "amber",
      metric: isRTL ? "جودة التجربة (E)" : "Experience (E)",
      before: beforeData.avgE,
      after: afterData.avgE,
      impact: isRTL 
        ? "تقليل خطوات الموافقة من 5 إلى 2، تجربة خالية من التوتر"
        : "Reduced approval steps from 5 to 2, stress-free experience",
    },
    {
      philosophy: "Friluftsliv",
      icon: TreePine,
      color: "green",
      metric: isRTL ? "النتائج الصحية (H)" : "Health (H)",
      before: beforeData.avgH,
      after: afterData.avgH,
      impact: isRTL 
        ? "انخفاض الأمراض المزمنة بنسبة 23% من خلال الرعاية الاستباقية"
        : "23% reduction in chronic diseases through proactive care",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            {isRTL ? "مقارنة قبل/بعد" : "Before/After Comparison"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? "تأثير تطبيق الفلسفة الاسكندنافية على مؤشرات IVI" 
              : "Impact of applying Nordic Philosophy on IVI metrics"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-gray-400">
            <CardHeader className="pb-2">
              <CardDescription>{isRTL ? "IVI قبل" : "IVI Before"}</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{beforeData.avgIVI}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-gray-600">{isRTL ? "الوضع الحالي" : "Current State"}</Badge>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardDescription>{isRTL ? "IVI بعد" : "IVI After"}</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">{afterData.avgIVI}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-indigo-100 text-indigo-800">{isRTL ? "بعد التطبيق" : "After Implementation"}</Badge>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>{isRTL ? "التحسن" : "Improvement"}</CardDescription>
              <CardTitle className="text-3xl text-green-600 flex items-center gap-1">
                +{(afterData.avgIVI - beforeData.avgIVI).toFixed(1)}
                <TrendingUp className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">+{calculateChange(beforeData.avgIVI, afterData.avgIVI)}%</Badge>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardDescription>{isRTL ? "تحول المخاطر" : "Risk Shift"}</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{beforeData.highRisk - afterData.highRisk}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-purple-100 text-purple-800">{isRTL ? "شركات خرجت من الخطر العالي" : "Left High Risk"}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Philosophy Impact Section */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="h-6 w-6" />
              {isRTL ? "تأثير الفلسفة الاسكندنافية" : "Nordic Philosophy Impact"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "كيف أثرت كل فلسفة على المؤشرات" : "How each philosophy impacted the metrics"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {philosophyImpact.map((item, index) => (
                <Card key={index} className={`border-${item.color}-200 bg-${item.color}-50`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center gap-2 text-${item.color}-700 text-lg`}>
                      <item.icon className="h-5 w-5" />
                      {item.philosophy}
                    </CardTitle>
                    <CardDescription className={`text-${item.color}-600`}>
                      {item.metric}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-500">{item.before}</span>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                      <span className={`text-2xl font-bold text-${item.color}-600`}>{item.after}</span>
                      <Badge className={`bg-${item.color}-100 text-${item.color}-800`}>
                        +{calculateChange(item.before, item.after)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.impact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">{isRTL ? "المقارنة" : "Comparison"}</TabsTrigger>
            <TabsTrigger value="timeline">{isRTL ? "الجدول الزمني" : "Timeline"}</TabsTrigger>
            <TabsTrigger value="radar">{isRTL ? "الرادار" : "Radar"}</TabsTrigger>
            <TabsTrigger value="details">{isRTL ? "التفاصيل" : "Details"}</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مقارنة المؤشرات الرئيسية" : "Key Metrics Comparison"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="before" fill="#9CA3AF" name={isRTL ? "قبل" : "Before"} />
                      <Bar dataKey="after" fill="#6366F1" name={isRTL ? "بعد" : "After"} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مسار التحسن خلال 12 شهر" : "12-Month Improvement Path"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[35, 65]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="before" stroke="#9CA3AF" strokeWidth={2} name={isRTL ? "بدون تطبيق" : "Without Implementation"} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="after" stroke="#6366F1" strokeWidth={3} name={isRTL ? "مع التطبيق" : "With Implementation"} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radar">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? "مقارنة شاملة" : "Comprehensive Comparison"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name={isRTL ? "قبل" : "Before"} dataKey="before" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.3} />
                      <Radar name={isRTL ? "بعد" : "After"} dataKey="after" stroke="#6366F1" fill="#6366F1" fillOpacity={0.5} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    {isRTL ? "المؤشرات الصحية" : "Health Metrics"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "معدل الأمراض المزمنة" : "Chronic Disease Rate"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.chronicRate}%</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.chronicRate}%</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{(beforeData.chronicRate - afterData.chronicRate).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "نسبة الخسارة" : "Loss Ratio"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.lossRatio}%</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.lossRatio}%</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{(beforeData.lossRatio - afterData.lossRatio).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "المطالبات لكل عضو" : "Claims per Member"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.claimsPerMember}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.claimsPerMember}</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{(beforeData.claimsPerMember - afterData.claimsPerMember).toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {isRTL ? "مؤشرات التجربة" : "Experience Metrics"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "معدل الموافقة" : "Approval Rate"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.approvalRate}%</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.approvalRate}%</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{(afterData.approvalRate - beforeData.approvalRate).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "متوسط وقت المطالبة (أيام)" : "Avg Claim Time (days)"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.avgClaimTime}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.avgClaimTime}</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{(beforeData.avgClaimTime - afterData.avgClaimTime).toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{isRTL ? "رضا العملاء" : "Customer Satisfaction"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{beforeData.customerSatisfaction}%</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-green-600 font-bold">{afterData.customerSatisfaction}%</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{afterData.customerSatisfaction - beforeData.customerSatisfaction}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Risk Distribution Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "تحول توزيع المخاطر" : "Risk Distribution Shift"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">{isRTL ? "قبل التطبيق" : "Before Implementation"}</h3>
                <div className="flex justify-center gap-4">
                  <div className="p-4 bg-red-100 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{beforeData.highRisk}</div>
                    <div className="text-sm text-red-600">{isRTL ? "مخاطر عالية" : "High Risk"}</div>
                  </div>
                  <div className="p-4 bg-yellow-100 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{beforeData.mediumRisk}</div>
                    <div className="text-sm text-yellow-600">{isRTL ? "مخاطر متوسطة" : "Medium Risk"}</div>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{beforeData.lowRisk}</div>
                    <div className="text-sm text-green-600">{isRTL ? "مخاطر منخفضة" : "Low Risk"}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-indigo-600">{isRTL ? "بعد التطبيق" : "After Implementation"}</h3>
                <div className="flex justify-center gap-4">
                  <div className="p-4 bg-red-100 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{afterData.highRisk}</div>
                    <div className="text-sm text-red-600">{isRTL ? "مخاطر عالية" : "High Risk"}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">-{beforeData.highRisk - afterData.highRisk}</Badge>
                  </div>
                  <div className="p-4 bg-yellow-100 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{afterData.mediumRisk}</div>
                    <div className="text-sm text-yellow-600">{isRTL ? "مخاطر متوسطة" : "Medium Risk"}</div>
                    <Badge className="mt-1 bg-blue-100 text-blue-800">+{afterData.mediumRisk - beforeData.mediumRisk}</Badge>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{afterData.lowRisk}</div>
                    <div className="text-sm text-green-600">{isRTL ? "مخاطر منخفضة" : "Low Risk"}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">+{afterData.lowRisk - beforeData.lowRisk}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              {isRTL ? "النتائج الرئيسية" : "Key Takeaways"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <ArrowUpRight className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{isRTL ? "تحسن IVI بنسبة 42%" : "42% IVI Improvement"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "من 41.4 إلى 58.7 خلال 12 شهر من تطبيق الفلسفة الاسكندنافية"
                      : "From 41.4 to 58.7 over 12 months of Nordic philosophy implementation"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <ArrowUpRight className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{isRTL ? "انخفاض المخاطر العالية بنسبة 67%" : "67% High Risk Reduction"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "16 شركة انتقلت من المخاطر العالية إلى المتوسطة أو المنخفضة"
                      : "16 companies moved from high risk to medium or low risk"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <ArrowUpRight className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{isRTL ? "تحسن تجربة العميل 481%" : "481% Experience Improvement"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "من 3.2 إلى 18.6 بفضل تطبيق مفهوم Hygge"
                      : "From 3.2 to 18.6 thanks to Hygge concept implementation"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <ArrowUpRight className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">{isRTL ? "انخفاض الأمراض المزمنة 23%" : "23% Chronic Disease Reduction"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? "من 31.5% إلى 24.3% بفضل الرعاية الاستباقية (Friluftsliv)"
                      : "From 31.5% to 24.3% thanks to proactive care (Friluftsliv)"
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
