import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { fetchCsvData, FuturePrediction } from "@/lib/csv";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Filter, RefreshCw } from "lucide-react";
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

export default function Predictions() {
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
      const monthLabel = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
      
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
  }, [filteredCompanies, timeRange]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">التنبؤات</h1>
            <p className="text-muted-foreground">تحليل تنبؤي لمؤشرات الأداء المستقبلية</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              فلاتر التنبؤات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region || "unknown"}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="القطاع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القطاعات</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector || "unknown"}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 أشهر</SelectItem>
                  <SelectItem value="6">6 أشهر</SelectItem>
                  <SelectItem value="12">12 شهر</SelectItem>
                  <SelectItem value="24">24 شهر</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الشركات المحللة</p>
                  <p className="text-2xl font-bold">{filteredCompanies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التحسن المتوقع</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{(parseFloat(timeRange) * 0.8).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">شركات قرب الحد</p>
                  <p className="text-2xl font-bold text-yellow-600">{atRiskCompanies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عالية المخاطر (متوقع)</p>
                  <p className="text-2xl font-bold text-red-600">{riskPredictions.projected.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Prediction Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توقعات مؤشر IVI</CardTitle>
            <CardDescription>
              التنبؤ بتطور المؤشرات خلال الـ {timeRange} شهر القادمة
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
                    labelFormatter={(label) => `الشهر: ${label}`}
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
                    name="الصحة (H)"
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="experience"
                    name="التجربة (E)"
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    name="الكفاءة (U)"
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
              <CardTitle>توزيع فئات المخاطر</CardTitle>
              <CardDescription>المقارنة بين الحالي والمتوقع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "عالي", current: riskPredictions.current.high, projected: riskPredictions.projected.high },
                      { name: "متوسط", current: riskPredictions.current.medium, projected: riskPredictions.projected.medium },
                      { name: "منخفض", current: riskPredictions.current.low, projected: riskPredictions.projected.low },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" name="الحالي" fill="#94a3b8" />
                    <Bar dataKey="projected" name="المتوقع" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>شركات قرب حدود التصنيف</CardTitle>
              <CardDescription>شركات قد تتغير فئتها خلال الفترة المتوقعة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {atRiskCompanies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد شركات قرب حدود التصنيف
                  </p>
                ) : (
                  atRiskCompanies.slice(0, 10).map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{company.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          IVI: {parseFloat(company.iviScore || "0").toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                          → {company.projectedCategory === "Low" ? "منخفض" : 
                             company.projectedCategory === "Medium" ? "متوسط" : "عالي"}
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
            <CardTitle>التوصيات التنبؤية</CardTitle>
            <CardDescription>إجراءات مقترحة لتحسين الأداء المستقبلي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">تحسين النتائج الصحية</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• تعزيز برامج الرعاية الوقائية</li>
                  <li>• متابعة الحالات المزمنة بشكل دوري</li>
                  <li>• تحسين معدلات الموافقة على العلاجات</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">تحسين جودة التجربة</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• تقليل وقت معالجة المطالبات</li>
                  <li>• تحسين خدمة العملاء</li>
                  <li>• توفير قنوات تواصل متعددة</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">تحسين كفاءة الاستخدام</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• مراجعة سياسات الموافقة المسبقة</li>
                  <li>• تحسين نسبة الخسارة</li>
                  <li>• تقليل معدل الرفض غير المبرر</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
