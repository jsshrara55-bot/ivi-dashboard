import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { 
  generateRecommendations, 
  calculateTotalImpact,
  ActionItem 
} from "@/lib/scenarioRecommendations";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Clock,
  BarChart3,
  PieChart,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  RefreshCw
} from "lucide-react";
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

// Cost estimates per recommendation category (in SAR)
const COST_ESTIMATES = {
  H: {
    low: 50000,
    medium: 150000,
    high: 300000
  },
  E: {
    low: 30000,
    medium: 100000,
    high: 250000
  },
  U: {
    low: 40000,
    medium: 120000,
    high: 280000
  }
};

// Savings multipliers based on IVI improvement
const SAVINGS_PER_IVI_POINT = 25000; // SAR per IVI point improvement per year
const CLAIMS_REDUCTION_RATE = 0.02; // 2% claims reduction per IVI point
const RETENTION_IMPROVEMENT_RATE = 0.015; // 1.5% retention improvement per IVI point

export default function ROICalculator() {
  const { isRTL } = useLanguage();
  const { data: iviScores } = trpc.ivi.scores.list.useQuery();
  
  // Input parameters
  const [selectedCompany, setSelectedCompany] = useState<string>("portfolio");
  const [hAdjustment, setHAdjustment] = useState(15);
  const [eAdjustment, setEAdjustment] = useState(15);
  const [uAdjustment, setUAdjustment] = useState(15);
  const [timeHorizon, setTimeHorizon] = useState(12); // months
  const [annualPremium, setAnnualPremium] = useState(5000000); // SAR
  const [memberCount, setMemberCount] = useState(500);
  const [avgClaimCost, setAvgClaimCost] = useState(2500); // SAR per claim
  
  // Get base scores
  const baseScores = useMemo(() => {
    if (!iviScores || iviScores.length === 0) {
      return { h: 50, e: 50, u: 50, ivi: 50 };
    }
    
    if (selectedCompany === "portfolio") {
      const avgH = iviScores.reduce((sum, s) => sum + Number(s.hScore || 0), 0) / iviScores.length;
      const avgE = iviScores.reduce((sum, s) => sum + Number(s.eScore || 0), 0) / iviScores.length;
      const avgU = iviScores.reduce((sum, s) => sum + Number(s.uScore || 0), 0) / iviScores.length;
      const avgIvi = iviScores.reduce((sum, s) => sum + Number(s.iviScore || 0), 0) / iviScores.length;
      return { h: avgH, e: avgE, u: avgU, ivi: avgIvi };
    }
    
    const company = iviScores.find(s => s.contNo === selectedCompany);
    if (company) {
      return {
        h: Number(company.hScore || 0),
        e: Number(company.eScore || 0),
        u: Number(company.uScore || 0),
        ivi: Number(company.iviScore || 0)
      };
    }
    
    return { h: 50, e: 50, u: 50, ivi: 50 };
  }, [iviScores, selectedCompany]);
  
  // Calculate projected IVI
  const projectedIvi = useMemo(() => {
    const projectedH = Math.max(0, Math.min(100, baseScores.h * (1 + hAdjustment / 100)));
    const projectedE = Math.max(0, Math.min(100, baseScores.e * (1 + eAdjustment / 100)));
    const projectedU = Math.max(0, Math.min(100, baseScores.u * (1 + uAdjustment / 100)));
    return 0.4 * projectedH + 0.3 * projectedE + 0.3 * projectedU;
  }, [baseScores, hAdjustment, eAdjustment, uAdjustment]);
  
  const iviImprovement = projectedIvi - baseScores.ivi;
  
  // Generate recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(hAdjustment, eAdjustment, uAdjustment);
  }, [hAdjustment, eAdjustment, uAdjustment]);
  
  // Calculate implementation costs
  const implementationCosts = useMemo(() => {
    let totalCost = 0;
    const costBreakdown: { category: string; cost: number; count: number }[] = [];
    
    const hRecs = recommendations.filter(r => r.category === 'H');
    const eRecs = recommendations.filter(r => r.category === 'E');
    const uRecs = recommendations.filter(r => r.category === 'U');
    
    const calculateCategoryCost = (recs: ActionItem[], category: 'H' | 'E' | 'U') => {
      return recs.reduce((sum, rec) => {
        return sum + COST_ESTIMATES[category][rec.priority];
      }, 0);
    };
    
    const hCost = calculateCategoryCost(hRecs, 'H');
    const eCost = calculateCategoryCost(eRecs, 'E');
    const uCost = calculateCategoryCost(uRecs, 'U');
    
    costBreakdown.push({ category: 'H', cost: hCost, count: hRecs.length });
    costBreakdown.push({ category: 'E', cost: eCost, count: eRecs.length });
    costBreakdown.push({ category: 'U', cost: uCost, count: uRecs.length });
    
    totalCost = hCost + eCost + uCost;
    
    return { totalCost, costBreakdown };
  }, [recommendations]);
  
  // Calculate expected savings
  const expectedSavings = useMemo(() => {
    const yearsInHorizon = timeHorizon / 12;
    
    // Direct IVI improvement savings
    const iviSavings = iviImprovement * SAVINGS_PER_IVI_POINT * yearsInHorizon;
    
    // Claims reduction savings
    const claimsReduction = iviImprovement * CLAIMS_REDUCTION_RATE;
    const estimatedAnnualClaims = memberCount * 2.5; // avg 2.5 claims per member per year
    const claimsSavings = estimatedAnnualClaims * avgClaimCost * claimsReduction * yearsInHorizon;
    
    // Retention improvement value
    const retentionImprovement = iviImprovement * RETENTION_IMPROVEMENT_RATE;
    const retentionValue = annualPremium * retentionImprovement * yearsInHorizon;
    
    // Operational efficiency (reduced admin costs)
    const operationalSavings = implementationCosts.totalCost * 0.15 * yearsInHorizon;
    
    const totalSavings = iviSavings + claimsSavings + retentionValue + operationalSavings;
    
    return {
      iviSavings,
      claimsSavings,
      retentionValue,
      operationalSavings,
      totalSavings,
      claimsReduction: claimsReduction * 100,
      retentionImprovement: retentionImprovement * 100
    };
  }, [iviImprovement, timeHorizon, memberCount, avgClaimCost, annualPremium, implementationCosts.totalCost]);
  
  // Calculate ROI
  const roi = useMemo(() => {
    const netBenefit = expectedSavings.totalSavings - implementationCosts.totalCost;
    const roiPercentage = implementationCosts.totalCost > 0 
      ? (netBenefit / implementationCosts.totalCost) * 100 
      : 0;
    const paybackMonths = expectedSavings.totalSavings > 0 
      ? (implementationCosts.totalCost / (expectedSavings.totalSavings / timeHorizon))
      : 0;
    
    return {
      netBenefit,
      roiPercentage,
      paybackMonths
    };
  }, [expectedSavings.totalSavings, implementationCosts.totalCost, timeHorizon]);
  
  // Generate monthly projection data
  const monthlyProjections = useMemo(() => {
    const projections = [];
    const monthlyInvestment = implementationCosts.totalCost / Math.min(6, timeHorizon);
    const monthlySavings = expectedSavings.totalSavings / timeHorizon;
    
    let cumulativeInvestment = 0;
    let cumulativeSavings = 0;
    let cumulativeNet = 0;
    
    for (let i = 0; i <= timeHorizon; i++) {
      const investment = i <= 6 ? monthlyInvestment : 0;
      const savings = i >= 3 ? monthlySavings * (Math.min(i - 2, timeHorizon - 2) / (timeHorizon - 2)) : 0;
      
      cumulativeInvestment += investment;
      cumulativeSavings += savings;
      cumulativeNet = cumulativeSavings - cumulativeInvestment;
      
      projections.push({
        month: i,
        label: isRTL ? `شهر ${i}` : `Month ${i}`,
        investment: Math.round(cumulativeInvestment),
        savings: Math.round(cumulativeSavings),
        net: Math.round(cumulativeNet)
      });
    }
    
    return projections;
  }, [implementationCosts.totalCost, expectedSavings.totalSavings, timeHorizon, isRTL]);
  
  // Savings breakdown for pie chart
  const savingsBreakdown = [
    { name: isRTL ? 'تحسين IVI' : 'IVI Improvement', value: expectedSavings.iviSavings, color: '#3b82f6' },
    { name: isRTL ? 'تقليل المطالبات' : 'Claims Reduction', value: expectedSavings.claimsSavings, color: '#10b981' },
    { name: isRTL ? 'تحسين الاحتفاظ' : 'Retention Value', value: expectedSavings.retentionValue, color: '#f59e0b' },
    { name: isRTL ? 'الكفاءة التشغيلية' : 'Operational Efficiency', value: expectedSavings.operationalSavings, color: '#8b5cf6' }
  ].filter(item => item.value > 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const resetToDefaults = () => {
    setHAdjustment(15);
    setEAdjustment(15);
    setUAdjustment(15);
    setTimeHorizon(12);
    setAnnualPremium(5000000);
    setMemberCount(500);
    setAvgClaimCost(2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="h-8 w-8 text-primary" />
              {isRTL ? 'حاسبة العائد على الاستثمار' : 'ROI Calculator'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? 'احسب العائد المتوقع من تطبيق توصيات تحسين IVI'
                : 'Calculate expected returns from implementing IVI improvement recommendations'}
            </p>
          </div>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Parameters */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {isRTL ? 'معاملات الإدخال' : 'Input Parameters'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'حدد السيناريو والمعاملات المالية' : 'Define scenario and financial parameters'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Selection */}
              <div className="space-y-2">
                <Label>{isRTL ? 'الشركة' : 'Company'}</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio">
                      {isRTL ? 'المحفظة الكاملة' : 'Full Portfolio'}
                    </SelectItem>
                    {iviScores?.map(score => (
                      <SelectItem key={score.contNo} value={score.contNo}>
                        {score.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              {/* IVI Adjustments */}
              <div className="space-y-4">
                <h4 className="font-medium">{isRTL ? 'تعديلات IVI المستهدفة' : 'Target IVI Adjustments'}</h4>
                
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label>{isRTL ? 'الصحة (H)' : 'Health (H)'}</Label>
                    <span className="font-mono text-green-600">+{hAdjustment}%</span>
                  </div>
                  <Slider
                    value={[hAdjustment]}
                    onValueChange={([v]) => setHAdjustment(v)}
                    min={0}
                    max={50}
                    step={5}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label>{isRTL ? 'التجربة (E)' : 'Experience (E)'}</Label>
                    <span className="font-mono text-green-600">+{eAdjustment}%</span>
                  </div>
                  <Slider
                    value={[eAdjustment]}
                    onValueChange={([v]) => setEAdjustment(v)}
                    min={0}
                    max={50}
                    step={5}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label>{isRTL ? 'الاستخدام (U)' : 'Utilization (U)'}</Label>
                    <span className="font-mono text-green-600">+{uAdjustment}%</span>
                  </div>
                  <Slider
                    value={[uAdjustment]}
                    onValueChange={([v]) => setUAdjustment(v)}
                    min={0}
                    max={50}
                    step={5}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Financial Parameters */}
              <div className="space-y-4">
                <h4 className="font-medium">{isRTL ? 'المعاملات المالية' : 'Financial Parameters'}</h4>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'الأفق الزمني (أشهر)' : 'Time Horizon (months)'}</Label>
                  <Select value={timeHorizon.toString()} onValueChange={(v) => setTimeHorizon(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">{isRTL ? '6 أشهر' : '6 months'}</SelectItem>
                      <SelectItem value="12">{isRTL ? '12 شهر' : '12 months'}</SelectItem>
                      <SelectItem value="24">{isRTL ? '24 شهر' : '24 months'}</SelectItem>
                      <SelectItem value="36">{isRTL ? '36 شهر' : '36 months'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'القسط السنوي (ر.س)' : 'Annual Premium (SAR)'}</Label>
                  <Input
                    type="number"
                    value={annualPremium}
                    onChange={(e) => setAnnualPremium(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'عدد الأعضاء' : 'Member Count'}</Label>
                  <Input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isRTL ? 'متوسط تكلفة المطالبة (ر.س)' : 'Avg Claim Cost (SAR)'}</Label>
                  <Input
                    type="number"
                    value={avgClaimCost}
                    onChange={(e) => setAvgClaimCost(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* ROI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`${roi.roiPercentage >= 100 ? 'border-green-500' : roi.roiPercentage >= 50 ? 'border-yellow-500' : 'border-red-500'} border-2`}>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'العائد على الاستثمار' : 'ROI'}
                  </div>
                  <div className={`text-2xl font-bold ${roi.roiPercentage >= 100 ? 'text-green-600' : roi.roiPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {roi.roiPercentage.toFixed(0)}%
                  </div>
                  <Badge variant={roi.roiPercentage >= 100 ? 'default' : roi.roiPercentage >= 50 ? 'secondary' : 'destructive'} className="mt-1">
                    {roi.roiPercentage >= 100 ? (isRTL ? 'ممتاز' : 'Excellent') : 
                     roi.roiPercentage >= 50 ? (isRTL ? 'جيد' : 'Good') : 
                     (isRTL ? 'ضعيف' : 'Poor')}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'صافي الفائدة' : 'Net Benefit'}
                  </div>
                  <div className={`text-xl font-bold ${roi.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(roi.netBenefit)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isRTL ? `خلال ${timeHorizon} شهر` : `Over ${timeHorizon} months`}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'فترة الاسترداد' : 'Payback Period'}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {roi.paybackMonths.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'أشهر' : 'months'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'تحسين IVI' : 'IVI Improvement'}
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    +{iviImprovement.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {baseScores.ivi.toFixed(1)} → {projectedIvi.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost vs Savings Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    {isRTL ? 'تكلفة التنفيذ' : 'Implementation Cost'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-4">
                    {formatCurrency(implementationCosts.totalCost)}
                  </div>
                  <div className="space-y-2">
                    {implementationCosts.costBreakdown.map((item) => (
                      <div key={item.category} className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            item.category === 'H' ? 'bg-red-500' :
                            item.category === 'E' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          {item.category === 'H' ? (isRTL ? 'الصحة' : 'Health') :
                           item.category === 'E' ? (isRTL ? 'التجربة' : 'Experience') :
                           (isRTL ? 'الاستخدام' : 'Utilization')}
                          <span className="text-muted-foreground">({item.count})</span>
                        </span>
                        <span className="font-medium">{formatCurrency(item.cost)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    {isRTL ? 'التوفير المتوقع' : 'Expected Savings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    {formatCurrency(expectedSavings.totalSavings)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'تحسين IVI' : 'IVI Improvement'}</span>
                      <span className="font-medium">{formatCurrency(expectedSavings.iviSavings)}</span>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'تقليل المطالبات' : 'Claims Reduction'}</span>
                      <span className="font-medium">{formatCurrency(expectedSavings.claimsSavings)}</span>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'تحسين الاحتفاظ' : 'Retention Value'}</span>
                      <span className="font-medium">{formatCurrency(expectedSavings.retentionValue)}</span>
                    </div>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'الكفاءة التشغيلية' : 'Operational Efficiency'}</span>
                      <span className="font-medium">{formatCurrency(expectedSavings.operationalSavings)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">
                  <Clock className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'الجدول الزمني' : 'Timeline'}
                </TabsTrigger>
                <TabsTrigger value="breakdown">
                  <PieChart className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'التوزيع' : 'Breakdown'}
                </TabsTrigger>
                <TabsTrigger value="metrics">
                  <BarChart3 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'المقاييس' : 'Metrics'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'مسار الاستثمار والعائد' : 'Investment & Return Timeline'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyProjections}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => label}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="investment" 
                            stroke="#ef4444" 
                            fill="#fecaca"
                            name={isRTL ? 'الاستثمار التراكمي' : 'Cumulative Investment'}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="savings" 
                            stroke="#22c55e" 
                            fill="#bbf7d0"
                            name={isRTL ? 'التوفير التراكمي' : 'Cumulative Savings'}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="net" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name={isRTL ? 'صافي الفائدة' : 'Net Benefit'}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="breakdown">
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'توزيع التوفير' : 'Savings Breakdown'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={savingsBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {savingsBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="metrics">
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'مقاييس الأداء المتوقعة' : 'Expected Performance Metrics'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تقليل المطالبات' : 'Claims Reduction'}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          -{expectedSavings.claimsReduction.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تحسين الاحتفاظ' : 'Retention Improvement'}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          +{expectedSavings.retentionImprovement.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'التوصيات المطبقة' : 'Recommendations'}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {recommendations.length}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'التوفير الشهري' : 'Monthly Savings'}
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCurrency(expectedSavings.totalSavings / timeHorizon)}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* ROI Assessment */}
                    <div className={`p-4 rounded-lg ${roi.roiPercentage >= 100 ? 'bg-green-50 dark:bg-green-950/20' : roi.roiPercentage >= 50 ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                      <div className="flex items-start gap-3">
                        {roi.roiPercentage >= 100 ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                        ) : roi.roiPercentage >= 50 ? (
                          <Info className="h-6 w-6 text-yellow-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-semibold">
                            {roi.roiPercentage >= 100 
                              ? (isRTL ? 'استثمار ممتاز' : 'Excellent Investment')
                              : roi.roiPercentage >= 50 
                              ? (isRTL ? 'استثمار جيد' : 'Good Investment')
                              : (isRTL ? 'يحتاج مراجعة' : 'Needs Review')}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {roi.roiPercentage >= 100 
                              ? (isRTL 
                                ? `العائد المتوقع ${roi.roiPercentage.toFixed(0)}% يتجاوز التكلفة بشكل كبير. فترة الاسترداد ${roi.paybackMonths.toFixed(1)} شهر فقط.`
                                : `Expected ROI of ${roi.roiPercentage.toFixed(0)}% significantly exceeds costs. Payback period is only ${roi.paybackMonths.toFixed(1)} months.`)
                              : roi.roiPercentage >= 50 
                              ? (isRTL 
                                ? `العائد المتوقع ${roi.roiPercentage.toFixed(0)}% إيجابي. قد ترغب في زيادة التعديلات لتحسين العائد.`
                                : `Expected ROI of ${roi.roiPercentage.toFixed(0)}% is positive. Consider increasing adjustments for better returns.`)
                              : (isRTL 
                                ? `العائد المتوقع ${roi.roiPercentage.toFixed(0)}% منخفض. راجع المعاملات أو قلل نطاق التنفيذ.`
                                : `Expected ROI of ${roi.roiPercentage.toFixed(0)}% is low. Review parameters or reduce implementation scope.`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
