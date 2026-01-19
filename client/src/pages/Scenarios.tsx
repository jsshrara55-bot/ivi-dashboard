import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Plus, 
  Save, 
  Trash2, 
  Star, 
  StarOff, 
  Share2, 
  Lock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Heart,
  Smile,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  GitCompare,
  Download
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function Scenarios() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedScenarios, setSelectedScenarios] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for creating scenarios
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("portfolio");
  const [hAdjustment, setHAdjustment] = useState(0);
  const [eAdjustment, setEAdjustment] = useState(0);
  const [uAdjustment, setUAdjustment] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [assumptions, setAssumptions] = useState("");
  
  // API queries
  const { data: myScenarios, refetch: refetchMyScenarios } = trpc.scenarios.list.useQuery();
  const { data: sharedScenarios, refetch: refetchSharedScenarios } = trpc.scenarios.listShared.useQuery();
  const { data: favoriteScenarios, refetch: refetchFavoriteScenarios } = trpc.scenarios.listFavorites.useQuery();
  const { data: iviScores } = trpc.ivi.scores.list.useQuery();
  
  // Mutations
  const calculateMutation = trpc.scenarios.calculate.useMutation();
  const createMutation = trpc.scenarios.create.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم حفظ السيناريو بنجاح" : "Scenario saved successfully");
      refetchMyScenarios();
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  const deleteMutation = trpc.scenarios.delete.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم حذف السيناريو" : "Scenario deleted");
      refetchMyScenarios();
      refetchFavoriteScenarios();
    }
  });
  const toggleFavoriteMutation = trpc.scenarios.toggleFavorite.useMutation({
    onSuccess: () => {
      refetchMyScenarios();
      refetchFavoriteScenarios();
    }
  });
  const toggleSharedMutation = trpc.scenarios.toggleShared.useMutation({
    onSuccess: () => {
      refetchMyScenarios();
      refetchSharedScenarios();
    }
  });
  
  // Get base scores for selected company or portfolio average
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
  
  // Calculate projected scores
  const projectedScores = useMemo(() => {
    const projectedH = Math.max(0, Math.min(100, baseScores.h * (1 + hAdjustment / 100)));
    const projectedE = Math.max(0, Math.min(100, baseScores.e * (1 + eAdjustment / 100)));
    const projectedU = Math.max(0, Math.min(100, baseScores.u * (1 + uAdjustment / 100)));
    const projectedIvi = 0.4 * projectedH + 0.3 * projectedE + 0.3 * projectedU;
    
    let riskCategory: "Low" | "Medium" | "High";
    if (projectedIvi >= 70) riskCategory = "Low";
    else if (projectedIvi >= 35) riskCategory = "Medium";
    else riskCategory = "High";
    
    return {
      h: Math.round(projectedH * 100) / 100,
      e: Math.round(projectedE * 100) / 100,
      u: Math.round(projectedU * 100) / 100,
      ivi: Math.round(projectedIvi * 100) / 100,
      riskCategory
    };
  }, [baseScores, hAdjustment, eAdjustment, uAdjustment]);
  
  // Generate monthly projections for chart
  const monthlyProjections = useMemo(() => {
    const projections = [];
    const monthlyChange = (projectedScores.ivi - baseScores.ivi) / timeHorizon;
    const now = new Date();
    
    for (let i = 0; i <= timeHorizon; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      const variance = (Math.random() - 0.5) * 2;
      const ivi = Math.max(0, Math.min(100, baseScores.ivi + monthlyChange * i + variance));
      
      projections.push({
        month: i,
        date: date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', year: '2-digit' }),
        ivi: Math.round(ivi * 100) / 100,
        baseline: baseScores.ivi
      });
    }
    
    return projections;
  }, [baseScores.ivi, projectedScores.ivi, timeHorizon, isRTL]);
  
  const resetForm = () => {
    setScenarioName("");
    setScenarioDescription("");
    setSelectedCompany("portfolio");
    setHAdjustment(0);
    setEAdjustment(0);
    setUAdjustment(0);
    setTimeHorizon(12);
    setAssumptions("");
  };
  
  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.error(isRTL ? "يرجى إدخال اسم السيناريو" : "Please enter a scenario name");
      return;
    }
    
    const companyInfo = selectedCompany !== "portfolio" 
      ? iviScores?.find(s => s.contNo === selectedCompany)
      : null;
    
    createMutation.mutate({
      name: scenarioName,
      description: scenarioDescription,
      contNo: selectedCompany !== "portfolio" ? selectedCompany : undefined,
      companyName: companyInfo?.companyName || undefined,
      baseIviScore: baseScores.ivi.toString(),
      hScoreAdjustment: hAdjustment.toString(),
      eScoreAdjustment: eAdjustment.toString(),
      uScoreAdjustment: uAdjustment.toString(),
      projectedHScore: projectedScores.h.toString(),
      projectedEScore: projectedScores.e.toString(),
      projectedUScore: projectedScores.u.toString(),
      projectedIviScore: projectedScores.ivi.toString(),
      projectedRiskCategory: projectedScores.riskCategory,
      timeHorizonMonths: timeHorizon,
      monthlyProjections: JSON.stringify(monthlyProjections),
      assumptions: assumptions,
    });
  };
  
  const handleToggleSelect = (id: number) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };
  
  // Comparison data for selected scenarios
  const comparisonData = useMemo(() => {
    if (selectedScenarios.length < 2) return null;
    
    const allScenarios = [...(myScenarios || []), ...(sharedScenarios || [])];
    const selected = selectedScenarios.map(id => allScenarios.find(s => s.id === id)).filter(Boolean);
    
    if (selected.length < 2) return null;
    
    return {
      scenarios: selected,
      barData: [
        { name: isRTL ? 'الصحة (H)' : 'Health (H)', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedHScore || 0)])) },
        { name: isRTL ? 'التجربة (E)' : 'Experience (E)', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedEScore || 0)])) },
        { name: isRTL ? 'الاستخدام (U)' : 'Utilization (U)', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedUScore || 0)])) },
        { name: 'IVI', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedIviScore || 0)])) },
      ],
      radarData: [
        { subject: 'H', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedHScore || 0)])) },
        { subject: 'E', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedEScore || 0)])) },
        { subject: 'U', ...Object.fromEntries(selected.map((s, i) => [`scenario${i + 1}`, Number(s?.projectedUScore || 0)])) },
      ]
    };
  }, [selectedScenarios, myScenarios, sharedScenarios, isRTL]);
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const ScenarioCard = ({ scenario, showActions = true }: { scenario: any; showActions?: boolean }) => (
    <Card className={`transition-all ${selectedScenarios.includes(scenario.id) ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-lg flex items-center gap-2">
              {scenario.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
              {scenario.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {scenario.companyName || (isRTL ? 'المحفظة الكاملة' : 'Full Portfolio')}
            </CardDescription>
          </div>
          <Badge className={getRiskColor(scenario.projectedRiskCategory)}>
            {scenario.projectedRiskCategory === "Low" ? (isRTL ? "منخفض" : "Low") :
             scenario.projectedRiskCategory === "Medium" ? (isRTL ? "متوسط" : "Medium") :
             (isRTL ? "عالي" : "High")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">IVI</div>
            <div className="font-bold text-lg">{Number(scenario.projectedIviScore).toFixed(1)}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">H</div>
            <div className="font-semibold">{Number(scenario.projectedHScore).toFixed(1)}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">E</div>
            <div className="font-semibold">{Number(scenario.projectedEScore).toFixed(1)}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">U</div>
            <div className="font-semibold">{Number(scenario.projectedUScore).toFixed(1)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>{scenario.timeHorizonMonths} {isRTL ? 'شهر' : 'months'}</span>
          {scenario.isShared && (
            <>
              <Share2 className="h-4 w-4 ml-2" />
              <span>{isRTL ? 'مشترك' : 'Shared'}</span>
            </>
          )}
        </div>
        
        {showActions && (
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleSelect(scenario.id)}
            >
              {selectedScenarios.includes(scenario.id) ? (
                <Eye className="h-4 w-4" />
              ) : (
                <GitCompare className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavoriteMutation.mutate({ id: scenario.id, isFavorite: !scenario.isFavorite })}
            >
              {scenario.isFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSharedMutation.mutate({ id: scenario.id, isShared: !scenario.isShared })}
            >
              {scenario.isShared ? <Lock className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => deleteMutation.mutate({ id: scenario.id })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold">
              {isRTL ? 'سيناريوهات IVI' : 'IVI Scenarios'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? 'إنشاء ومقارنة سيناريوهات توقعات مختلفة'
                : 'Create and compare different prediction scenarios'}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'سيناريو جديد' : 'New Scenario'}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">
              {isRTL ? 'إنشاء' : 'Create'}
            </TabsTrigger>
            <TabsTrigger value="my">
              {isRTL ? 'سيناريوهاتي' : 'My Scenarios'}
            </TabsTrigger>
            <TabsTrigger value="shared">
              {isRTL ? 'المشتركة' : 'Shared'}
            </TabsTrigger>
            <TabsTrigger value="compare">
              {isRTL ? 'مقارنة' : 'Compare'}
            </TabsTrigger>
          </TabsList>
          
          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Activity className="h-5 w-5" />
                    {isRTL ? 'معايير السيناريو' : 'Scenario Parameters'}
                  </CardTitle>
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
                          {isRTL ? 'المحفظة الكاملة (المتوسط)' : 'Full Portfolio (Average)'}
                        </SelectItem>
                        {iviScores?.map(score => (
                          <SelectItem key={score.contNo} value={score.contNo}>
                            {score.companyName} ({score.contNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Base Scores Display */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      {isRTL ? 'الدرجات الحالية' : 'Current Scores'}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">IVI</div>
                        <div className="font-bold">{baseScores.ivi.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">H</div>
                        <div className="font-semibold">{baseScores.h.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">E</div>
                        <div className="font-semibold">{baseScores.e.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">U</div>
                        <div className="font-semibold">{baseScores.u.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* H Score Adjustment */}
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Label className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {isRTL ? 'تعديل درجة الصحة (H)' : 'Health Score (H) Adjustment'}
                      </Label>
                      <span className={`font-mono ${hAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {hAdjustment >= 0 ? '+' : ''}{hAdjustment}%
                      </span>
                    </div>
                    <Slider
                      value={[hAdjustment]}
                      onValueChange={([v]) => setHAdjustment(v)}
                      min={-50}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'تحسين برامج الصحة الوقائية، إدارة الأمراض المزمنة'
                        : 'Improve preventive health programs, chronic disease management'}
                    </p>
                  </div>
                  
                  {/* E Score Adjustment */}
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Label className="flex items-center gap-2">
                        <Smile className="h-4 w-4 text-blue-500" />
                        {isRTL ? 'تعديل درجة التجربة (E)' : 'Experience Score (E) Adjustment'}
                      </Label>
                      <span className={`font-mono ${eAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {eAdjustment >= 0 ? '+' : ''}{eAdjustment}%
                      </span>
                    </div>
                    <Slider
                      value={[eAdjustment]}
                      onValueChange={([v]) => setEAdjustment(v)}
                      min={-50}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'تحسين خدمة العملاء، تسريع معالجة المطالبات'
                        : 'Improve customer service, faster claims processing'}
                    </p>
                  </div>
                  
                  {/* U Score Adjustment */}
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        {isRTL ? 'تعديل درجة الاستخدام (U)' : 'Utilization Score (U) Adjustment'}
                      </Label>
                      <span className={`font-mono ${uAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {uAdjustment >= 0 ? '+' : ''}{uAdjustment}%
                      </span>
                    </div>
                    <Slider
                      value={[uAdjustment]}
                      onValueChange={([v]) => setUAdjustment(v)}
                      min={-50}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'تحسين كفاءة الاستخدام، تقليل الهدر'
                        : 'Improve utilization efficiency, reduce waste'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  {/* Time Horizon */}
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {isRTL ? 'الأفق الزمني' : 'Time Horizon'}
                      </Label>
                      <span className="font-mono">{timeHorizon} {isRTL ? 'شهر' : 'months'}</span>
                    </div>
                    <Slider
                      value={[timeHorizon]}
                      onValueChange={([v]) => setTimeHorizon(v)}
                      min={3}
                      max={36}
                      step={3}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetForm}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Results Panel */}
              <div className="space-y-6">
                {/* Projected Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {projectedScores.ivi > baseScores.ivi ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                      {isRTL ? 'النتائج المتوقعة' : 'Projected Results'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-primary/10 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'IVI المتوقع' : 'Projected IVI'}
                        </div>
                        <div className="text-3xl font-bold">{projectedScores.ivi.toFixed(1)}</div>
                        <div className={`text-sm ${projectedScores.ivi > baseScores.ivi ? 'text-green-600' : 'text-red-600'}`}>
                          {projectedScores.ivi > baseScores.ivi ? '+' : ''}
                          {(projectedScores.ivi - baseScores.ivi).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'فئة المخاطر' : 'Risk Category'}
                        </div>
                        <Badge className={`text-lg mt-2 ${getRiskColor(projectedScores.riskCategory)}`}>
                          {projectedScores.riskCategory === "Low" ? (isRTL ? "منخفض" : "Low") :
                           projectedScores.riskCategory === "Medium" ? (isRTL ? "متوسط" : "Medium") :
                           (isRTL ? "عالي" : "High")}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-xs text-muted-foreground">H</div>
                        <div className="font-bold">{projectedScores.h.toFixed(1)}</div>
                        <div className={`text-xs ${projectedScores.h > baseScores.h ? 'text-green-600' : 'text-red-600'}`}>
                          {projectedScores.h > baseScores.h ? '+' : ''}
                          {(projectedScores.h - baseScores.h).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-xs text-muted-foreground">E</div>
                        <div className="font-bold">{projectedScores.e.toFixed(1)}</div>
                        <div className={`text-xs ${projectedScores.e > baseScores.e ? 'text-green-600' : 'text-red-600'}`}>
                          {projectedScores.e > baseScores.e ? '+' : ''}
                          {(projectedScores.e - baseScores.e).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-xs text-muted-foreground">U</div>
                        <div className="font-bold">{projectedScores.u.toFixed(1)}</div>
                        <div className={`text-xs ${projectedScores.u > baseScores.u ? 'text-green-600' : 'text-red-600'}`}>
                          {projectedScores.u > baseScores.u ? '+' : ''}
                          {(projectedScores.u - baseScores.u).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Projection Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isRTL ? 'مسار IVI المتوقع' : 'Projected IVI Path'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyProjections}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="baseline" 
                            stroke="#94a3b8" 
                            strokeDasharray="5 5"
                            name={isRTL ? 'الخط الأساسي' : 'Baseline'}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ivi" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name={isRTL ? 'IVI المتوقع' : 'Projected IVI'}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Save Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حفظ السيناريو' : 'Save Scenario'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* My Scenarios Tab */}
          <TabsContent value="my">
            {myScenarios && myScenarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myScenarios.map(scenario => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد سيناريوهات محفوظة' : 'No saved scenarios'}
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("create")}>
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إنشاء سيناريو' : 'Create Scenario'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Shared Scenarios Tab */}
          <TabsContent value="shared">
            {sharedScenarios && sharedScenarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedScenarios.map(scenario => (
                  <ScenarioCard key={scenario.id} scenario={scenario} showActions={false} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد سيناريوهات مشتركة' : 'No shared scenarios'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isRTL ? 'اختر السيناريوهات للمقارنة' : 'Select Scenarios to Compare'}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'اختر 2-3 سيناريوهات من قائمتك للمقارنة'
                    : 'Select 2-3 scenarios from your list to compare'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedScenarios.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {selectedScenarios.map(id => {
                      const scenario = [...(myScenarios || []), ...(sharedScenarios || [])].find(s => s.id === id);
                      return scenario ? (
                        <Badge key={id} variant="secondary" className="text-sm">
                          {scenario.name}
                          <button 
                            className="ml-2 hover:text-destructive"
                            onClick={() => handleToggleSelect(id)}
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                
                {myScenarios && myScenarios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myScenarios.map(scenario => (
                      <div 
                        key={scenario.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedScenarios.includes(scenario.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleToggleSelect(scenario.id)}
                      >
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">
                          IVI: {Number(scenario.projectedIviScore).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {isRTL ? 'لا توجد سيناريوهات للمقارنة' : 'No scenarios to compare'}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Comparison Results */}
            {comparisonData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isRTL ? 'مقارنة الدرجات' : 'Score Comparison'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData.barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            {comparisonData.scenarios.map((s, i) => (
                              <Bar 
                                key={s?.id} 
                                dataKey={`scenario${i + 1}`} 
                                fill={['#3b82f6', '#10b981', '#f59e0b'][i]}
                                name={s?.name}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Radar Chart Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isRTL ? 'مقارنة المكونات' : 'Component Comparison'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={comparisonData.radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            {comparisonData.scenarios.map((s, i) => (
                              <Radar
                                key={s?.id}
                                name={s?.name}
                                dataKey={`scenario${i + 1}`}
                                stroke={['#3b82f6', '#10b981', '#f59e0b'][i]}
                                fill={['#3b82f6', '#10b981', '#f59e0b'][i]}
                                fillOpacity={0.2}
                              />
                            ))}
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Detailed Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isRTL ? 'تفاصيل المقارنة' : 'Comparison Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'المقياس' : 'Metric'}
                            </th>
                            {comparisonData.scenarios.map(s => (
                              <th key={s?.id} className="p-2 text-center">{s?.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2 font-medium">IVI</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center font-bold">
                                {Number(s?.projectedIviScore).toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">H Score</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center">
                                {Number(s?.projectedHScore).toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">E Score</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center">
                                {Number(s?.projectedEScore).toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">U Score</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center">
                                {Number(s?.projectedUScore).toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">{isRTL ? 'فئة المخاطر' : 'Risk Category'}</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center">
                                <Badge className={getRiskColor(s?.projectedRiskCategory || '')}>
                                  {s?.projectedRiskCategory}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-2">{isRTL ? 'الأفق الزمني' : 'Time Horizon'}</td>
                            {comparisonData.scenarios.map(s => (
                              <td key={s?.id} className="p-2 text-center">
                                {s?.timeHorizonMonths} {isRTL ? 'شهر' : 'months'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Create Scenario Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'حفظ السيناريو' : 'Save Scenario'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'أدخل اسمًا ووصفًا للسيناريو'
                  : 'Enter a name and description for the scenario'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم السيناريو' : 'Scenario Name'}</Label>
                <Input
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder={isRTL ? 'مثال: تحسين برنامج الصحة' : 'e.g., Health Program Improvement'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
                <Textarea
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                  placeholder={isRTL ? 'وصف مختصر للسيناريو...' : 'Brief description of the scenario...'}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الافتراضات (اختياري)' : 'Assumptions (optional)'}</Label>
                <Textarea
                  value={assumptions}
                  onChange={(e) => setAssumptions(e.target.value)}
                  placeholder={isRTL ? 'الافتراضات المستخدمة في هذا السيناريو...' : 'Assumptions used in this scenario...'}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSaveScenario} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
