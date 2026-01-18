import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  GitCompare,
  X,
} from "lucide-react";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const COMPANY_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function Analytics() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);

  const { data: summary, isLoading: summaryLoading } = trpc.ivi.summary.useQuery();
  const { data: claimsStats, isLoading: claimsLoading } = trpc.ivi.claims.stats.useQuery();
  const { data: callStats, isLoading: callsLoading } = trpc.ivi.calls.stats.useQuery();
  const { data: preAuthStats, isLoading: preAuthLoading } = trpc.ivi.insurancePreAuths.stats.useQuery();
  const { data: iviScores } = trpc.ivi.scores.list.useQuery();

  const isLoading = summaryLoading || claimsLoading || callsLoading || preAuthLoading;

  // Prepare risk distribution data
  const riskData = summary?.byRisk?.map((item) => ({
    name: item.risk === "High" ? "عالية" : item.risk === "Medium" ? "متوسطة" : "منخفضة",
    value: item.count,
    color: item.risk === "High" ? "#ef4444" : item.risk === "Medium" ? "#f59e0b" : "#22c55e",
  })) || [];

  // Prepare sector distribution data
  const sectorData = summary?.bySector?.slice(0, 6).map((item: { sector: string | null; count: number; avgScore: string | null }) => ({
    name: item.sector || "غير محدد",
    clients: item.count,
    avgIVI: parseFloat(item.avgScore || "0"),
  })) || [];

  // Claims status data from byStatus
  const approvedClaims = claimsStats?.byStatus?.find((s: { status: string | null }) => s.status === "Approved")?.count || 0;
  const rejectedClaims = claimsStats?.byStatus?.find((s: { status: string | null }) => s.status === "Rejected")?.count || 0;
  const pendingClaims = claimsStats?.byStatus?.find((s: { status: string | null }) => s.status === "Pending")?.count || 0;
  
  const claimsStatusData = [
    { name: "مقبولة", value: approvedClaims, color: "#22c55e" },
    { name: "مرفوضة", value: rejectedClaims, color: "#ef4444" },
    { name: "معلقة", value: pendingClaims, color: "#f59e0b" },
  ];

  // Call types data from byType
  const callTypesData = callStats?.byType?.map((item: { type: string | null; count: number }) => ({
    name: item.type || "أخرى",
    value: item.count,
    color: item.type === "Complaint" ? "#ef4444" : item.type === "Inquiry" ? "#3b82f6" : "#22c55e",
  })) || [];

  // Pre-auth stats
  const approvedPreAuths = preAuthStats?.byStatus?.find((s: { status: string | null }) => s.status === "Approved")?.count || 0;
  const totalPreAuths = preAuthStats?.total || 0;

  // Company comparison data
  const comparisonData = useMemo(() => {
    if (!iviScores || selectedCompanies.length === 0) return [];
    
    return selectedCompanies.map((contNo, index) => {
      const company = iviScores.find(c => c.contNo === contNo);
      if (!company) return null;
      return {
        contNo: company.contNo,
        name: company.companyName || company.contNo,
        iviScore: parseFloat(company.iviScore || "0"),
        hScore: parseFloat(company.hScore || "0"),
        eScore: parseFloat(company.eScore || "0"),
        uScore: parseFloat(company.uScore || "0"),
        riskCategory: company.riskCategory,
        color: COMPANY_COLORS[index % COMPANY_COLORS.length],
      };
    }).filter(Boolean);
  }, [iviScores, selectedCompanies]);

  // Radar chart data for comparison
  const radarData = useMemo(() => {
    if (comparisonData.length === 0) return [];
    
    return [
      { subject: "الصحة (H)", fullMark: 100, ...Object.fromEntries(comparisonData.map(c => [c!.contNo, c!.hScore])) },
      { subject: "التجربة (E)", fullMark: 100, ...Object.fromEntries(comparisonData.map(c => [c!.contNo, c!.eScore])) },
      { subject: "الكفاءة (U)", fullMark: 100, ...Object.fromEntries(comparisonData.map(c => [c!.contNo, c!.uScore])) },
      { subject: "IVI الإجمالي", fullMark: 100, ...Object.fromEntries(comparisonData.map(c => [c!.contNo, c!.iviScore])) },
    ];
  }, [comparisonData]);

  // Bar chart data for comparison
  const barComparisonData = useMemo(() => {
    return comparisonData.map(c => ({
      name: c!.name.length > 15 ? c!.name.substring(0, 15) + "..." : c!.name,
      IVI: c!.iviScore,
      H: c!.hScore,
      E: c!.eScore,
      U: c!.uScore,
      fill: c!.color,
    }));
  }, [comparisonData]);

  const toggleCompany = (contNo: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(contNo)) {
        return prev.filter(c => c !== contNo);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 companies
      }
      return [...prev, contNo];
    });
  };

  const clearSelection = () => {
    setSelectedCompanies([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">التحليلات</h1>
            <p className="text-muted-foreground">
              تحليلات شاملة لأداء المحفظة والمطالبات ومركز الاتصال
            </p>
          </div>
          <Button
            variant={showComparisonPanel ? "default" : "outline"}
            onClick={() => setShowComparisonPanel(!showComparisonPanel)}
            className="gap-2"
          >
            <GitCompare className="h-4 w-4" />
            مقارنة الأداء
            {selectedCompanies.length > 0 && (
              <Badge variant="secondary" className="mr-1">
                {selectedCompanies.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Comparison Panel */}
        {showComparisonPanel && (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5" />
                    مقارنة أداء الشركات
                  </CardTitle>
                  <CardDescription>
                    اختر حتى 5 شركات للمقارنة بينها
                  </CardDescription>
                </div>
                {selectedCompanies.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="h-4 w-4 ml-1" />
                    مسح الاختيار
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Selection */}
                <div>
                  <h4 className="font-medium mb-3">اختر الشركات</h4>
                  <ScrollArea className="h-[300px] border rounded-md p-3">
                    <div className="space-y-2">
                      {iviScores?.map((company) => (
                        <div
                          key={company.contNo}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            selectedCompanies.includes(company.contNo)
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleCompany(company.contNo)}
                        >
                          <Checkbox
                            checked={selectedCompanies.includes(company.contNo)}
                            disabled={!selectedCompanies.includes(company.contNo) && selectedCompanies.length >= 5}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{company.companyName}</p>
                            <p className="text-xs text-muted-foreground">
                              IVI: {parseFloat(company.iviScore || "0").toFixed(1)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              company.riskCategory === "High"
                                ? "destructive"
                                : company.riskCategory === "Medium"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              company.riskCategory === "Low"
                                ? "bg-green-100 text-green-800"
                                : company.riskCategory === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {company.riskCategory === "High" ? "عالي" : company.riskCategory === "Medium" ? "متوسط" : "منخفض"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Radar Comparison */}
                <div>
                  <h4 className="font-medium mb-3">مقارنة المؤشرات</h4>
                  {selectedCompanies.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          {comparisonData.map((company) => (
                            <Radar
                              key={company!.contNo}
                              name={company!.name}
                              dataKey={company!.contNo}
                              stroke={company!.color}
                              fill={company!.color}
                              fillOpacity={0.2}
                            />
                          ))}
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/30">
                      <p className="text-muted-foreground">اختر شركات للمقارنة</p>
                    </div>
                  )}
                </div>

                {/* Bar Comparison */}
                <div>
                  <h4 className="font-medium mb-3">مقارنة الدرجات</h4>
                  {selectedCompanies.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={100} fontSize={11} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="IVI" fill="#3b82f6" name="IVI" />
                          <Bar dataKey="H" fill="#22c55e" name="الصحة" />
                          <Bar dataKey="E" fill="#f59e0b" name="التجربة" />
                          <Bar dataKey="U" fill="#8b5cf6" name="الكفاءة" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/30">
                      <p className="text-muted-foreground">اختر شركات للمقارنة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Companies Summary */}
              {selectedCompanies.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">ملخص المقارنة</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {comparisonData.map((company) => (
                      <div
                        key={company!.contNo}
                        className="p-3 rounded-lg border"
                        style={{ borderColor: company!.color }}
                      >
                        <p className="font-medium text-sm truncate">{company!.name}</p>
                        <p className="text-2xl font-bold" style={{ color: company!.color }}>
                          {company!.iviScore.toFixed(1)}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                          <p>H: {company!.hScore.toFixed(1)}</p>
                          <p>E: {company!.eScore.toFixed(1)}</p>
                          <p>U: {company!.uScore.toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المطالبات</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {claimsStats?.totalClaims?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    بقيمة {parseFloat(claimsStats?.totalClaimed || "0").toLocaleString()} ر.س
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">نسبة القبول</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {claimsStats?.totalClaims
                      ? ((approvedClaims / claimsStats.totalClaims) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {approvedClaims.toLocaleString()} مطالبة مقبولة
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">مكالمات مركز الاتصال</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {callStats?.total?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    متوسط الرضا: {parseFloat(callStats?.avgSatisfaction || "0").toFixed(1)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الموافقات المسبقة</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalPreAuths.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {approvedPreAuths} موافقة ({totalPreAuths ? ((approvedPreAuths / totalPreAuths) * 100).toFixed(1) : 0}%)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    توزيع المخاطر
                  </CardTitle>
                  <CardDescription>توزيع الشركات حسب فئة المخاطر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Claims Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    حالة المطالبات
                  </CardTitle>
                  <CardDescription>توزيع المطالبات حسب الحالة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={claimsStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {claimsStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Sector Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    تحليل القطاعات
                  </CardTitle>
                  <CardDescription>عدد الشركات ومتوسط IVI لكل قطاع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectorData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="clients" fill="#3b82f6" name="عدد الشركات" />
                        <Bar yAxisId="right" dataKey="avgIVI" fill="#22c55e" name="متوسط IVI" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Call Center Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    تحليل مركز الاتصال
                  </CardTitle>
                  <CardDescription>توزيع المكالمات حسب النوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={callTypesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="عدد المكالمات">
                          {callTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  ملخص المحفظة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{summary?.totalCompanies || 0}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الشركات</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{parseFloat(summary?.avgIviScore || "0").toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">متوسط IVI</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{parseFloat(summary?.avgHScore || "0").toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">متوسط H-Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{parseFloat(summary?.avgEScore || "0").toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">متوسط E-Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{parseFloat(summary?.avgUScore || "0").toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">متوسط U-Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
