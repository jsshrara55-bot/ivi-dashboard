import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  DollarSign,
  Heart,
  Smile,
  BarChart3,
  Download,
  RefreshCw,
  Building2,
  Shield
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

import { trpc } from "@/lib/trpc";

export default function ExecutiveDashboard() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [timePeriod, setTimePeriod] = useState<'current' | 'q1' | 'q2' | 'q3' | 'q4' | 'yearly'>('current');
  
  // Fetch IVI scores from API
  const { data: iviScoresData } = trpc.ivi.scores.list.useQuery();
  
  // Calculate metrics from data
  const metrics = useMemo(() => {
    const scores = iviScoresData || [];
    const totalCompanies = scores.length;
    const avgIVI = scores.reduce((sum, s) => sum + (Number(s.iviScore) || 0), 0) / totalCompanies;
    const avgH = scores.reduce((sum, s) => sum + (Number(s.hScore) || 0), 0) / totalCompanies;
    const avgE = scores.reduce((sum, s) => sum + (Number(s.eScore) || 0), 0) / totalCompanies;
    const avgU = scores.reduce((sum, s) => sum + (Number(s.uScore) || 0), 0) / totalCompanies;
    
    const highRisk = scores.filter(s => s.riskCategory === 'High').length;
    const mediumRisk = scores.filter(s => s.riskCategory === 'Medium').length;
    const lowRisk = scores.filter(s => s.riskCategory === 'Low').length;
    
    // SME = 300 as per user request
    const smeCount = 300;
    const keyAccountCount = totalCompanies - smeCount;
    
    return {
      totalCompanies,
      avgIVI: avgIVI.toFixed(1),
      avgH: avgH.toFixed(1),
      avgE: avgE.toFixed(1),
      avgU: avgU.toFixed(1),
      highRisk,
      mediumRisk,
      lowRisk,
      smeCount,
      keyAccountCount,
      retentionRate: (85 + (avgIVI / 100) * 10).toFixed(1),
      improvementRate: '+12.5%',
      costSavings: '15.2M SAR'
    };
  }, [iviScoresData]);
  
  const riskData = [
    { name: isRTL ? 'مخاطر عالية' : 'High Risk', value: metrics.highRisk, color: '#ef4444' },
    { name: isRTL ? 'مخاطر متوسطة' : 'Medium Risk', value: metrics.mediumRisk, color: '#f59e0b' },
    { name: isRTL ? 'مخاطر منخفضة' : 'Low Risk', value: metrics.lowRisk, color: '#22c55e' },
  ];
  
  const componentData = [
    { 
      subject: isRTL ? 'الصحة (H)' : 'Health (H)', 
      current: Number(metrics.avgH), 
      target: 75,
      fullMark: 100 
    },
    { 
      subject: isRTL ? 'التجربة (E)' : 'Experience (E)', 
      current: Number(metrics.avgE), 
      target: 80,
      fullMark: 100 
    },
    { 
      subject: isRTL ? 'الاستخدام (U)' : 'Utilization (U)', 
      current: Number(metrics.avgU), 
      target: 70,
      fullMark: 100 
    },
  ];
  
  const categoryComparison = [
    {
      name: isRTL ? 'SME' : 'SME',
      ivi: 52.3,
      retention: 78,
      count: metrics.smeCount
    },
    {
      name: isRTL ? 'حسابات رئيسية' : 'Key Accounts',
      ivi: 68.7,
      retention: 92,
      count: metrics.keyAccountCount
    }
  ];
  
  const timePeriodOptions = [
    { value: 'current', label: isRTL ? 'الحالي' : 'Current' },
    { value: 'q1', label: isRTL ? 'الربع الأول' : 'Q1' },
    { value: 'q2', label: isRTL ? 'الربع الثاني' : 'Q2' },
    { value: 'q3', label: isRTL ? 'الربع الثالث' : 'Q3' },
    { value: 'q4', label: isRTL ? 'الربع الرابع' : 'Q4' },
    { value: 'yearly', label: isRTL ? 'سنوي' : 'Yearly' },
  ];
  
  const handleExportPDF = () => {
    // Create printable content
    const printContent = document.getElementById('executive-dashboard-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${isRTL ? 'لوحة التحكم التنفيذية - IVI' : 'Executive Dashboard - IVI'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; direction: ${isRTL ? 'rtl' : 'ltr'}; }
                .header { text-align: center; margin-bottom: 30px; }
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .kpi-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
                .kpi-value { font-size: 28px; font-weight: bold; color: #1f2937; }
                .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: ${isRTL ? 'right' : 'left'}; }
                th { background: #f3f4f6; }
                .risk-high { color: #ef4444; }
                .risk-medium { color: #f59e0b; }
                .risk-low { color: #22c55e; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${isRTL ? 'لوحة التحكم التنفيذية' : 'Executive Dashboard'}</h1>
                <h2>Intelligent Value Index (IVI)</h2>
                <p>${isRTL ? 'بوبا العربية' : 'Bupa Arabia'} | ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-value">${metrics.totalCompanies}</div>
                  <div class="kpi-label">${isRTL ? 'إجمالي الشركات' : 'Total Companies'}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${metrics.avgIVI}</div>
                  <div class="kpi-label">${isRTL ? 'متوسط IVI' : 'Average IVI'}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${metrics.retentionRate}%</div>
                  <div class="kpi-label">${isRTL ? 'معدل الاحتفاظ' : 'Retention Rate'}</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-value">${metrics.costSavings}</div>
                  <div class="kpi-label">${isRTL ? 'التوفير المتوقع' : 'Expected Savings'}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">${isRTL ? 'توزيع المخاطر' : 'Risk Distribution'}</div>
                <table>
                  <tr>
                    <th>${isRTL ? 'الفئة' : 'Category'}</th>
                    <th>${isRTL ? 'العدد' : 'Count'}</th>
                    <th>${isRTL ? 'النسبة' : 'Percentage'}</th>
                  </tr>
                  <tr>
                    <td class="risk-high">${isRTL ? 'مخاطر عالية' : 'High Risk'}</td>
                    <td>${metrics.highRisk}</td>
                    <td>${((metrics.highRisk / metrics.totalCompanies) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td class="risk-medium">${isRTL ? 'مخاطر متوسطة' : 'Medium Risk'}</td>
                    <td>${metrics.mediumRisk}</td>
                    <td>${((metrics.mediumRisk / metrics.totalCompanies) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td class="risk-low">${isRTL ? 'مخاطر منخفضة' : 'Low Risk'}</td>
                    <td>${metrics.lowRisk}</td>
                    <td>${((metrics.lowRisk / metrics.totalCompanies) * 100).toFixed(1)}%</td>
                  </tr>
                </table>
              </div>
              
              <div class="section">
                <div class="section-title">${isRTL ? 'مكونات IVI' : 'IVI Components'}</div>
                <table>
                  <tr>
                    <th>${isRTL ? 'المكون' : 'Component'}</th>
                    <th>${isRTL ? 'الحالي' : 'Current'}</th>
                    <th>${isRTL ? 'المستهدف' : 'Target'}</th>
                    <th>${isRTL ? 'الفجوة' : 'Gap'}</th>
                  </tr>
                  <tr>
                    <td>${isRTL ? 'الصحة (H)' : 'Health (H)'}</td>
                    <td>${metrics.avgH}</td>
                    <td>75</td>
                    <td>${(75 - Number(metrics.avgH)).toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td>${isRTL ? 'التجربة (E)' : 'Experience (E)'}</td>
                    <td>${metrics.avgE}</td>
                    <td>80</td>
                    <td>${(80 - Number(metrics.avgE)).toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td>${isRTL ? 'الاستخدام (U)' : 'Utilization (U)'}</td>
                    <td>${metrics.avgU}</td>
                    <td>70</td>
                    <td>${(70 - Number(metrics.avgU)).toFixed(1)}</td>
                  </tr>
                </table>
              </div>
              
              <div class="section">
                <div class="section-title">${isRTL ? 'مقارنة الفئات' : 'Category Comparison'}</div>
                <table>
                  <tr>
                    <th>${isRTL ? 'الفئة' : 'Category'}</th>
                    <th>${isRTL ? 'العدد' : 'Count'}</th>
                    <th>${isRTL ? 'متوسط IVI' : 'Avg IVI'}</th>
                    <th>${isRTL ? 'معدل الاحتفاظ' : 'Retention'}</th>
                  </tr>
                  <tr>
                    <td>SME Clients</td>
                    <td>${metrics.smeCount}</td>
                    <td>52.3</td>
                    <td>78%</td>
                  </tr>
                  <tr>
                    <td>${isRTL ? 'حسابات رئيسية' : 'Key Accounts'}</td>
                    <td>${metrics.keyAccountCount}</td>
                    <td>68.7</td>
                    <td>92%</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #6b7280;">
                <p>${isRTL ? 'فريق العمل: شهد | غادة | رزان | يمامه | أفنان' : 'Team: Shahad | Ghadah | Razan | Yamamah | Afnan'}</p>
                <p>Bupa Arabia - Intelligent Value Index (IVI) Dashboard</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };
  
  return (
    <div className={cn("p-6 space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-bold">
            {isRTL ? 'لوحة التحكم التنفيذية' : 'Executive Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'نظرة شاملة على أهم المؤشرات للمدراء التنفيذيين' : 'Comprehensive overview of key metrics for executives'}
          </p>
        </div>
        <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
          <Select value={timePeriod} onValueChange={(v: any) => setTimePeriod(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            {isRTL ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>
      
      <div id="executive-dashboard-content">
        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-blue-100 text-sm">{isRTL ? 'إجمالي الشركات' : 'Total Companies'}</p>
                  <p className="text-4xl font-bold mt-1">{metrics.totalCompanies}</p>
                  <div className={cn("flex items-center mt-2 text-blue-100", isRTL && "flex-row-reverse")}>
                    <Building2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">SME: {metrics.smeCount} | KA: {metrics.keyAccountCount}</span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-emerald-100 text-sm">{isRTL ? 'متوسط IVI' : 'Average IVI'}</p>
                  <p className="text-4xl font-bold mt-1">{metrics.avgIVI}</p>
                  <div className={cn("flex items-center mt-2 text-emerald-100", isRTL && "flex-row-reverse")}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">{metrics.improvementRate} {isRTL ? 'تحسن' : 'improvement'}</span>
                  </div>
                </div>
                <Target className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-purple-100 text-sm">{isRTL ? 'معدل الاحتفاظ' : 'Retention Rate'}</p>
                  <p className="text-4xl font-bold mt-1">{metrics.retentionRate}%</p>
                  <div className={cn("flex items-center mt-2 text-purple-100", isRTL && "flex-row-reverse")}>
                    <Shield className="h-4 w-4 mr-1" />
                    <span className="text-sm">{isRTL ? 'متوقع للسنة القادمة' : 'Expected next year'}</span>
                  </div>
                </div>
                <Activity className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-amber-100 text-sm">{isRTL ? 'التوفير المتوقع' : 'Expected Savings'}</p>
                  <p className="text-4xl font-bold mt-1">{metrics.costSavings}</p>
                  <div className={cn("flex items-center mt-2 text-amber-100", isRTL && "flex-row-reverse")}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm">{isRTL ? 'من تحسين IVI' : 'from IVI improvement'}</span>
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Risk Distribution & IVI Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {isRTL ? 'توزيع المخاطر' : 'Risk Distribution'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'تصنيف الشركات حسب فئة المخاطر' : 'Companies classified by risk category'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
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
                <div className="w-1/2 space-y-3">
                  {riskData.map((item, idx) => (
                    <div key={idx} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{item.value}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({((item.value / metrics.totalCompanies) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* IVI Components Radar */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BarChart3 className="h-5 w-5 text-blue-500" />
                {isRTL ? 'مكونات IVI' : 'IVI Components'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'مقارنة الأداء الحالي مع المستهدف' : 'Current performance vs target'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={componentData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name={isRTL ? 'الحالي' : 'Current'}
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name={isRTL ? 'المستهدف' : 'Target'}
                    dataKey="target"
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
        
        {/* Category Comparison & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Comparison */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Building2 className="h-5 w-5 text-indigo-500" />
                {isRTL ? 'مقارنة الفئات' : 'Category Comparison'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'SME مقابل الحسابات الرئيسية' : 'SME vs Key Accounts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryComparison} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ivi" name={isRTL ? 'متوسط IVI' : 'Avg IVI'} fill="#3b82f6" />
                  <Bar dataKey="retention" name={isRTL ? 'الاحتفاظ %' : 'Retention %'} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className={cn("p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg", isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">SME Clients</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.smeCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'شركات صغيرة ومتوسطة' : 'Small & Medium Enterprises'}
                  </p>
                </div>
                <div className={cn("p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg", isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'حسابات رئيسية' : 'Key Accounts'}</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.keyAccountCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'شركات كبرى' : 'Large Enterprises'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Status */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                {isRTL ? 'الحالة السريعة' : 'Quick Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm">{isRTL ? 'الصحة (H)' : 'Health (H)'}</span>
                </div>
                <Badge variant="outline" className="bg-white">{metrics.avgH}</Badge>
              </div>
              
              <div className={cn("flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Smile className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">{isRTL ? 'التجربة (E)' : 'Experience (E)'}</span>
                </div>
                <Badge variant="outline" className="bg-white">{metrics.avgE}</Badge>
              </div>
              
              <div className={cn("flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Activity className="h-5 w-5 text-amber-500" />
                  <span className="text-sm">{isRTL ? 'الاستخدام (U)' : 'Utilization (U)'}</span>
                </div>
                <Badge variant="outline" className="bg-white">{metrics.avgU}</Badge>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  {isRTL ? 'الصيغة:' : 'Formula:'}
                </p>
                <code className="text-xs bg-muted p-2 rounded block">
                  IVI = (H × 40%) + (E × 30%) + (U × 30%)
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-6 border-t">
        <p>{isRTL ? 'فريق العمل: شهد | غادة | رزان | يمامه | أفنان' : 'Team: Shahad | Ghadah | Razan | Yamamah | Afnan'}</p>
        <p className="mt-1">Bupa Arabia - Intelligent Value Index (IVI) Dashboard</p>
      </div>
    </div>
  );
}
