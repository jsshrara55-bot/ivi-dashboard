import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Database, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DataLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const checkDataMutation = trpc.ivi.data.checkExists.useQuery();
  const clearDataMutation = trpc.ivi.data.clearAll.useMutation();
  const bulkInsertMutation = trpc.ivi.data.importFromJson.useMutation();

  const loadData = async () => {
    setLoading(true);
    setProgress(0);
    setCompleted(false);

    try {
      // Fetch seed data from JSON file
      setStatus("جاري تحميل البيانات من الملف...");
      setProgress(10);
      
      const response = await fetch("/data/seed_data.json");
      if (!response.ok) {
        throw new Error("فشل في تحميل ملف البيانات");
      }
      const seedData = await response.json();
      
      // Clear existing data first
      setStatus("جاري مسح البيانات القديمة...");
      setProgress(20);
      await clearDataMutation.mutateAsync();
      
      // Insert corporate clients
      setStatus("جاري إدراج بيانات الشركات...");
      setProgress(30);
      await bulkInsertMutation.mutateAsync({
        corporateClients: seedData.corporateClients,
      });
      
      // Insert members
      setStatus("جاري إدراج بيانات الأعضاء...");
      setProgress(40);
      await bulkInsertMutation.mutateAsync({
        members: seedData.members,
      });
      
      // Insert providers
      setStatus("جاري إدراج بيانات مقدمي الخدمات...");
      setProgress(50);
      await bulkInsertMutation.mutateAsync({
        providers: seedData.providers,
      });
      
      // Insert claims in batches
      setStatus("جاري إدراج بيانات المطالبات...");
      setProgress(60);
      const claimsBatchSize = 500;
      for (let i = 0; i < seedData.claims.length; i += claimsBatchSize) {
        const batch = seedData.claims.slice(i, i + claimsBatchSize);
        await bulkInsertMutation.mutateAsync({
          claims: batch,
        });
        setProgress(60 + (i / seedData.claims.length) * 15);
      }
      
      // Insert insurance pre-auths
      setStatus("جاري إدراج بيانات الموافقات المسبقة...");
      setProgress(75);
      await bulkInsertMutation.mutateAsync({
        insurancePreAuths: seedData.insurancePreAuths,
      });
      
      // Insert calls
      setStatus("جاري إدراج بيانات المكالمات...");
      setProgress(85);
      await bulkInsertMutation.mutateAsync({
        calls: seedData.calls,
      });
      
      // Insert IVI scores
      setStatus("جاري إدراج درجات IVI...");
      setProgress(95);
      await bulkInsertMutation.mutateAsync({
        iviScores: seedData.iviScores,
      });
      
      setProgress(100);
      setStatus("تم تحميل جميع البيانات بنجاح!");
      setCompleted(true);
      toast.success("تم تحميل البيانات بنجاح!");
      
      // Refresh data check
      checkDataMutation.refetch();
      
    } catch (error) {
      console.error("Error loading data:", error);
      setStatus(`خطأ: ${error instanceof Error ? error.message : "فشل في تحميل البيانات"}`);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">تحميل البيانات</h1>
          <p className="text-gray-600 mt-2">
            قم بتحميل البيانات التجريبية إلى قاعدة البيانات لعرضها في لوحة التحكم
          </p>
        </div>

        <div className="grid gap-6">
          {/* Data Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                حالة البيانات
              </CardTitle>
              <CardDescription>
                التحقق من وجود البيانات في قاعدة البيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkDataMutation.isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحقق...
                </div>
              ) : checkDataMutation.data?.hasData ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>البيانات موجودة في قاعدة البيانات</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>لا توجد بيانات - يرجى تحميل البيانات</span>
                </div>
              )}
              
              {checkDataMutation.data && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {checkDataMutation.data.counts?.corporateClients || 0}
                    </div>
                    <div className="text-sm text-gray-600">شركات</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {checkDataMutation.data.counts?.members || 0}
                    </div>
                    <div className="text-sm text-gray-600">أعضاء</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {checkDataMutation.data.counts?.claims || 0}
                    </div>
                    <div className="text-sm text-gray-600">مطالبات</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {checkDataMutation.data.counts?.providers || 0}
                    </div>
                    <div className="text-sm text-gray-600">مقدمي خدمات</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Load Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                تحميل البيانات التجريبية
              </CardTitle>
              <CardDescription>
                سيتم تحميل بيانات تجريبية تشمل: 25 شركة، 1000 عضو، 100 مقدم خدمة، 1451 مطالبة، 413 مكالمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{status}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {completed && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>تم تحميل جميع البيانات بنجاح! يمكنك الآن عرض لوحة التحكم.</span>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={loadData} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      تحميل البيانات
                    </>
                  )}
                </Button>
                
                {completed && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/"}
                  >
                    الذهاب إلى لوحة التحكم
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>وصف البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900">الشركات (Corporate Clients)</h4>
                  <p>بيانات الشركات العميلة مع معلومات القطاع والمنطقة وعدد الموظفين</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">الأعضاء (Members)</h4>
                  <p>بيانات الموظفين المؤمن عليهم وعائلاتهم</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">المطالبات (Claims)</h4>
                  <p>سجلات المطالبات الطبية مع حالة الموافقة والمبالغ</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">مقدمي الخدمات (Providers)</h4>
                  <p>المستشفيات والعيادات والصيدليات في الشبكة</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">درجات IVI</h4>
                  <p>مؤشر القيمة الذكي لكل شركة (H, E, U scores)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
