import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Phone,
  FileText,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function ClientDetails() {
  const params = useParams<{ contNo: string }>();
  const contNo = params.contNo || "";

  const { data: clientData, isLoading } = trpc.ivi.clientDetails.useQuery(
    { contNo },
    { enabled: !!contNo }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!clientData?.client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">العميل غير موجود</h2>
          <p className="text-muted-foreground mt-2">لم يتم العثور على بيانات لهذا العميل</p>
          <Link href="/clients">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للقائمة
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { client, members, claims, calls } = clientData;

  // Prepare radar chart data for scores
  const radarData = [
    { subject: "الصحة (H)", value: parseFloat(client.hScore || "0"), fullMark: 100 },
    { subject: "التجربة (E)", value: parseFloat(client.eScore || "0"), fullMark: 100 },
    { subject: "الكفاءة (U)", value: parseFloat(client.uScore || "0"), fullMark: 100 },
  ];

  // Claims by status
  const claimsByStatus = claims?.reduce((acc: Record<string, number>, claim: { status: string | null }) => {
    const status = claim.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const claimsStatusData = Object.entries(claimsByStatus).map(([status, count]) => ({
    name: status === "Approved" ? "مقبولة" : status === "Rejected" ? "مرفوضة" : status === "Pending" ? "معلقة" : status,
    value: count,
    color: status === "Approved" ? "#22c55e" : status === "Rejected" ? "#ef4444" : "#f59e0b",
  }));

  // Calls by type
  const callsByType = calls?.reduce((acc: Record<string, number>, call: { callType: string | null }) => {
    const type = call.callType || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const callsTypeData = Object.entries(callsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
      case "High":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            عالية المخاطر
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
            <TrendingDown className="h-3 w-3" />
            متوسطة المخاطر
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            منخفضة المخاطر
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                {client.companyName || "شركة غير معروفة"}
              </h1>
              <p className="text-muted-foreground">
                رقم العقد: {client.contNo} | القطاع: {client.sector || "غير محدد"} | المنطقة: {client.region || "غير محدد"}
              </p>
            </div>
          </div>
          {getRiskBadge(client.riskCategory)}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">درجة IVI</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {parseFloat(client.iviScore || "0").toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">من 100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد الموظفين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{client.employeeCount || 0}</div>
              <p className="text-xs text-muted-foreground">{members?.length || 0} مسجل</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المطالبات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{claims?.length || 0}</div>
              <p className="text-xs text-muted-foreground">مطالبة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المطالبات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {parseFloat(client.totalClaimed || "0").toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">ر.س</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المكالمات</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{calls?.length || 0}</div>
              <p className="text-xs text-muted-foreground">مكالمة</p>
            </CardContent>
          </Card>
        </div>

        {/* Scores Radar Chart */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المؤشرات الثلاثة</CardTitle>
              <CardDescription>H: الصحة | E: التجربة | U: الكفاءة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="الدرجة"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>توزيع حالة المطالبات</CardTitle>
              <CardDescription>نسبة المطالبات حسب الحالة</CardDescription>
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

        {/* Detailed Tabs */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">الموظفين ({members?.length || 0})</TabsTrigger>
            <TabsTrigger value="claims">المطالبات ({claims?.length || 0})</TabsTrigger>
            <TabsTrigger value="calls">المكالمات ({calls?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>قائمة الموظفين المؤمن عليهم</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>رقم العضو</TableHead>
                      <TableHead>الجنس</TableHead>
                      <TableHead>العمر</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.slice(0, 20).map((member: {
                      id: number;
                      mbrNo: string;
                      gender: string | null;
                      age: number | null;
                      status: string | null;
                      enrollmentDate: Date | string | null;
                    }, index: number) => (
                      <TableRow key={member.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{member.mbrNo}</TableCell>
                        <TableCell>{member.gender === "M" ? "ذكر" : member.gender === "F" ? "أنثى" : "-"}</TableCell>
                        <TableCell>{member.age || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                            {member.status === "Active" ? "نشط" : member.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.enrollmentDate ? new Date(member.enrollmentDate).toLocaleDateString("ar-SA") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {members && members.length > 20 && (
                  <p className="text-center text-muted-foreground mt-4">
                    عرض 20 من {members.length} موظف
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>سجل المطالبات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>رقم المطالبة</TableHead>
                      <TableHead>المبلغ المطالب</TableHead>
                      <TableHead>المبلغ المعتمد</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims?.slice(0, 20).map((claim: {
                      id: number;
                      claimId: string;
                      claimedAmount: string | null;
                      approvedAmount: string | null;
                      status: string | null;
                      claimDate: Date | string | null;
                    }, index: number) => (
                      <TableRow key={claim.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{claim.claimId}</TableCell>
                        <TableCell>{parseFloat(claim.claimedAmount || "0").toLocaleString()} ر.س</TableCell>
                        <TableCell>{parseFloat(claim.approvedAmount || "0").toLocaleString()} ر.س</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              claim.status === "Approved"
                                ? "default"
                                : claim.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {claim.status === "Approved"
                              ? "مقبولة"
                              : claim.status === "Rejected"
                              ? "مرفوضة"
                              : claim.status === "Pending"
                              ? "معلقة"
                              : claim.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {claim.claimDate ? new Date(claim.claimDate).toLocaleDateString("ar-SA") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {claims && claims.length > 20 && (
                  <p className="text-center text-muted-foreground mt-4">
                    عرض 20 من {claims.length} مطالبة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>سجل المكالمات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>رقم المكالمة</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الرضا</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls?.slice(0, 20).map((call: {
                      id: number;
                      callId: string;
                      callType: string | null;
                      status: string | null;
                      satisfactionScore: number | null;
                      crtDate: Date | string | null;
                    }, index: number) => (
                      <TableRow key={call.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{call.callId}</TableCell>
                        <TableCell>{call.callType || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={call.status === "CLOSED" ? "default" : "secondary"}>
                            {call.status === "CLOSED" ? "مغلقة" : call.status === "OPENED" ? "مفتوحة" : call.status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.satisfactionScore ? `${call.satisfactionScore}/5` : "-"}
                        </TableCell>
                        <TableCell>
                          {call.crtDate ? new Date(call.crtDate).toLocaleDateString("ar-SA") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {calls && calls.length > 20 && (
                  <p className="text-center text-muted-foreground mt-4">
                    عرض 20 من {calls.length} مكالمة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
