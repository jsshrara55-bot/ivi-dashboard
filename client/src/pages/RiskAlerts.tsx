import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  RefreshCw,
  Send,
  BarChart3,
  LineChart as LineChartIcon
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function RiskAlerts() {
  const [sending, setSending] = useState<number | null>(null);
  
  const { data: alerts, isLoading, refetch } = trpc.ivi.riskAlerts.list.useQuery();
  const { data: unsentAlerts } = trpc.ivi.riskAlerts.getUnsent.useQuery();
  
  const sendNotification = trpc.ivi.riskAlerts.sendNotification.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الإشعار بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("فشل إرسال الإشعار: " + error.message);
    },
    onSettled: () => {
      setSending(null);
    }
  });

  const sendAllNotifications = trpc.ivi.riskAlerts.sendAllUnsent.useMutation({
    onSuccess: (result) => {
      if (result.sent > 0) {
        toast.success(`تم إرسال ${result.sent} إشعار بنجاح`);
      }
      if (result.skipped > 0) {
        toast.info(`تم تخطي ${result.skipped} تنبيه (لا يتطلب إشعار)`);
      }
      if (result.sent === 0 && result.skipped === 0) {
        toast.info("لا توجد تنبيهات للإرسال");
      }
      refetch();
    },
    onError: () => {
      toast.error("فشل إرسال الإشعارات");
    }
  });

  const handleSendNotification = async (alertId: number) => {
    setSending(alertId);
    await sendNotification.mutateAsync({ alertId });
  };

  const handleSendAllNotifications = async () => {
    await sendAllNotifications.mutateAsync();
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "High":
        return "عالية";
      case "Medium":
        return "متوسطة";
      case "Low":
        return "منخفضة";
      default:
        return risk;
    }
  };

  const isEscalation = (previousRisk: string, newRisk: string) => {
    const riskOrder = { Low: 0, Medium: 1, High: 2 };
    return (riskOrder[newRisk as keyof typeof riskOrder] || 0) > (riskOrder[previousRisk as keyof typeof riskOrder] || 0);
  };

  const unsentCount = unsentAlerts?.length || 0;
  const totalAlerts = alerts?.length || 0;
  const escalationAlerts = alerts?.filter(a => isEscalation(a.previousRisk, a.newRisk)).length || 0;
  const improvementAlerts = totalAlerts - escalationAlerts;

  // Prepare chart data - Risk trend over time
  const trendData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];
    
    // Group alerts by date
    const groupedByDate = alerts.reduce((acc, alert) => {
      const date = alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("ar-SA", { month: 'short', day: 'numeric' }) : 'غير محدد';
      if (!acc[date]) {
        acc[date] = { date, escalations: 0, improvements: 0, total: 0 };
      }
      if (isEscalation(alert.previousRisk, alert.newRisk)) {
        acc[date].escalations++;
      } else {
        acc[date].improvements++;
      }
      acc[date].total++;
      return acc;
    }, {} as Record<string, { date: string; escalations: number; improvements: number; total: number }>);
    
    return Object.values(groupedByDate).reverse();
  }, [alerts]);

  // Risk distribution data for pie chart
  const riskDistributionData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];
    
    const distribution = {
      'Low → Medium': 0,
      'Medium → High': 0,
      'High → Medium': 0,
      'Medium → Low': 0,
    };
    
    alerts.forEach(alert => {
      const key = `${alert.previousRisk} → ${alert.newRisk}`;
      if (key in distribution) {
        distribution[key as keyof typeof distribution]++;
      }
    });
    
    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [alerts]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];
    
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyData: Record<string, { month: string; escalations: number; improvements: number }> = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyData[monthKey] = {
        month: months[d.getMonth()],
        escalations: 0,
        improvements: 0,
      };
    }
    
    alerts.forEach(alert => {
      if (alert.createdAt) {
        const d = new Date(alert.createdAt);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthlyData[monthKey]) {
          if (isEscalation(alert.previousRisk, alert.newRisk)) {
            monthlyData[monthKey].escalations++;
          } else {
            monthlyData[monthKey].improvements++;
          }
        }
      }
    });
    
    return Object.values(monthlyData);
  }, [alerts]);

  const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تنبيهات المخاطر</h1>
            <p className="text-gray-500 mt-1">
              إدارة ومتابعة تنبيهات تغيير فئة المخاطر للشركات
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            {unsentCount > 0 && (
              <Button 
                onClick={handleSendAllNotifications}
                disabled={sendAllNotifications.isPending}
              >
                <Send className="h-4 w-4 ml-2" />
                إرسال الكل ({unsentCount})
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي التنبيهات</p>
                  <p className="text-2xl font-bold">{totalAlerts}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">بانتظار الإرسال</p>
                  <p className="text-2xl font-bold text-orange-600">{unsentCount}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <BellOff className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">تصعيد المخاطر</p>
                  <p className="text-2xl font-bold text-red-600">{escalationAlerts}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">تحسن المخاطر</p>
                  <p className="text-2xl font-bold text-green-600">{improvementAlerts}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-blue-500" />
                اتجاه التنبيهات الشهري
              </CardTitle>
              <CardDescription>
                مقارنة بين تصعيد وتحسن المخاطر خلال الأشهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="escalations" 
                      name="تصعيد المخاطر" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="improvements" 
                      name="تحسن المخاطر" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <LineChartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد بيانات كافية لعرض الرسم البياني</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                توزيع تغييرات المخاطر
              </CardTitle>
              <CardDescription>
                أنواع التغييرات في فئات المخاطر
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد بيانات كافية لعرض الرسم البياني</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity Bar Chart */}
        {trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                النشاط اليومي للتنبيهات
              </CardTitle>
              <CardDescription>
                عدد التنبيهات حسب اليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                  />
                  <Legend />
                  <Bar dataKey="escalations" name="تصعيد" fill="#ef4444" />
                  <Bar dataKey="improvements" name="تحسن" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              سجل التنبيهات
            </CardTitle>
            <CardDescription>
              جميع تنبيهات تغيير فئة المخاطر مرتبة حسب التاريخ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="mr-2 text-gray-500">جاري التحميل...</span>
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">رقم العقد</TableHead>
                      <TableHead className="text-right">التغيير</TableHead>
                      <TableHead className="text-right">الدرجة السابقة</TableHead>
                      <TableHead className="text-right">الدرجة الجديدة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {alert.companyName || "غير محدد"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {alert.contNo}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskBadgeColor(alert.previousRisk)}>
                              {getRiskLabel(alert.previousRisk)}
                            </Badge>
                            {isEscalation(alert.previousRisk, alert.newRisk) ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                            <Badge className={getRiskBadgeColor(alert.newRisk)}>
                              {getRiskLabel(alert.newRisk)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {alert.previousScore ? Number(alert.previousScore).toFixed(1) : "-"}
                        </TableCell>
                        <TableCell>
                          {alert.newScore ? Number(alert.newScore).toFixed(1) : "-"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("ar-SA") : "-"}
                        </TableCell>
                        <TableCell>
                          {alert.notificationSent ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 ml-1" />
                              تم الإرسال
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <BellOff className="h-3 w-3 ml-1" />
                              بانتظار الإرسال
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!alert.notificationSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendNotification(alert.id)}
                              disabled={sending === alert.id}
                            >
                              {sending === alert.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 ml-1" />
                                  إرسال
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد تنبيهات حالياً</p>
                <p className="text-sm mt-1">
                  ستظهر التنبيهات هنا عند تغيير فئة المخاطر لأي شركة
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
