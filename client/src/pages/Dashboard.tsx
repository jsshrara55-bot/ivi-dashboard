import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureImportanceChart, IVITrendChart, KPICard, RiskDistributionChart, ScoresComparisonChart } from "@/components/DashboardComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureImportance, fetchCsvData, FuturePrediction, IVIScore, Recommendation } from "@/lib/csv";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, BarChart3, Building2, Download, FileText, Filter, Phone, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const [iviScores, setIviScores] = useState<IVIScore[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Fetch summary from API
  const { data: iviSummary } = trpc.ivi.summary.useQuery();
  const { data: claimsStats } = trpc.ivi.claims.stats.useQuery();
  const { data: callStats } = trpc.ivi.calls.stats.useQuery();
  const { data: preAuthStats } = trpc.ivi.insurancePreAuths.stats.useQuery();
  const { data: providerStats } = trpc.ivi.providers.stats.useQuery();
  const { data: dbIviScores } = trpc.ivi.scores.list.useQuery();

  useEffect(() => {
    async function loadData() {
      try {
        const [scores, predictions, recs, features] = await Promise.all([
          fetchCsvData<IVIScore>('/data/ivi_scores.csv'),
          fetchCsvData<FuturePrediction>('/data/future_predictions.csv'),
          fetchCsvData<Recommendation>('/data/recommendations.csv'),
          fetchCsvData<FeatureImportance>('/data/feature_importance.csv')
        ]);
        
        setIviScores(scores);
        setFuturePredictions(predictions);
        setRecommendations(recs);
        setFeatureImportance(features);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Use database scores if available, otherwise use CSV
  const displayScores = useMemo(() => {
    if (dbIviScores && dbIviScores.length > 0) {
      return dbIviScores.map(score => ({
        CONT_NO: score.contNo,
        Company_Name: score.companyName || '',
        Sector: score.sector || '',
        Region: score.region || '',
        H_score: Number(score.hScore) || 0,
        E_score: Number(score.eScore) || 0,
        U_score: Number(score.uScore) || 0,
        IVI_Score: Number(score.iviScore) || 0,
        Risk_Category: score.riskCategory === 'High' ? 'High Risk' : 
                       score.riskCategory === 'Medium' ? 'Medium Risk' : 'Low Risk',
      }));
    }
    return iviScores;
  }, [dbIviScores, iviScores]);

  // Get unique values for filters
  const regions = useMemo(() => {
    const uniqueRegions = new Set(displayScores.map(s => s.Region).filter((r): r is string => Boolean(r)));
    return Array.from(uniqueRegions);
  }, [displayScores]);

  const sectors = useMemo(() => {
    const uniqueSectors = new Set(displayScores.map(s => s.Sector).filter((s): s is string => Boolean(s)));
    return Array.from(uniqueSectors);
  }, [displayScores]);

  // Apply filters
  const filteredScores = useMemo(() => {
    return displayScores.filter(score => {
      if (regionFilter !== "all" && score.Region !== regionFilter) return false;
      if (sectorFilter !== "all" && score.Sector !== sectorFilter) return false;
      if (riskFilter !== "all" && score.Risk_Category !== riskFilter) return false;
      return true;
    });
  }, [displayScores, regionFilter, sectorFilter, riskFilter]);

  // Export to PDF function
  const exportToPDF = () => {
    // Create a printable version of the dashboard
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IVI Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #0066cc; }
          .kpi-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .high-risk { color: #dc2626; }
          .medium-risk { color: #ca8a04; }
          .low-risk { color: #16a34a; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Intelligent Value Index (IVI) Dashboard Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <h2>Executive Summary</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.length}</div>
            <div class="kpi-label">Total Companies</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${(filteredScores.reduce((sum, s) => sum + s.IVI_Score, 0) / (filteredScores.length || 1)).toFixed(1)}</div>
            <div class="kpi-label">Average IVI Score</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.filter(s => s.Risk_Category === 'High Risk').length}</div>
            <div class="kpi-label">High Risk Clients</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${filteredScores.filter(s => s.Risk_Category === 'Low Risk').length}</div>
            <div class="kpi-label">Low Risk Clients</div>
          </div>
        </div>
        
        <h2>Client Performance Matrix</h2>
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Company Name</th>
              <th>Region</th>
              <th>Sector</th>
              <th>Risk Category</th>
              <th>H Score</th>
              <th>E Score</th>
              <th>U Score</th>
              <th>IVI Score</th>
            </tr>
          </thead>
          <tbody>
            ${filteredScores.map(score => `
              <tr>
                <td>${score.CONT_NO}</td>
                <td>${score.Company_Name || '-'}</td>
                <td>${score.Region || '-'}</td>
                <td>${score.Sector || '-'}</td>
                <td class="${score.Risk_Category === 'High Risk' ? 'high-risk' : score.Risk_Category === 'Medium Risk' ? 'medium-risk' : 'low-risk'}">${score.Risk_Category}</td>
                <td>${score.H_score.toFixed(1)}</td>
                <td>${score.E_score.toFixed(1)}</td>
                <td>${score.U_score.toFixed(1)}</td>
                <td><strong>${score.IVI_Score.toFixed(1)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Risk Distribution</h2>
        <ul>
          <li><strong>High Risk:</strong> ${filteredScores.filter(s => s.Risk_Category === 'High Risk').length} clients (${((filteredScores.filter(s => s.Risk_Category === 'High Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
          <li><strong>Medium Risk:</strong> ${filteredScores.filter(s => s.Risk_Category === 'Medium Risk').length} clients (${((filteredScores.filter(s => s.Risk_Category === 'Medium Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
          <li><strong>Low Risk:</strong> ${filteredScores.filter(s => s.Risk_Category === 'Low Risk').length} clients (${((filteredScores.filter(s => s.Risk_Category === 'Low Risk').length / (filteredScores.length || 1)) * 100).toFixed(1)}%)</li>
        </ul>
        
        <div class="footer">
          <p>IVI Dashboard - Intelligent Value Index | Powered by Bupa Arabia</p>
          <p>This report is confidential and intended for internal use only.</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate Summary Metrics - with safe defaults
  const totalCompanies = filteredScores.length || 1; // Prevent division by zero
  const avgIVI = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.IVI_Score || 0), 0) / totalCompanies : 0;
  const highRiskCount = filteredScores.filter(item => item.Risk_Category === 'High Risk').length;
  const mediumRiskCount = filteredScores.filter(item => item.Risk_Category === 'Medium Risk').length;
  const lowRiskCount = filteredScores.filter(item => item.Risk_Category === 'Low Risk').length;
  
  const avgH = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.H_score || 0), 0) / totalCompanies : 0;
  const avgE = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.E_score || 0), 0) / totalCompanies : 0;
  const avgU = filteredScores.length > 0 ? filteredScores.reduce((sum, item) => sum + (item.U_score || 0), 0) / totalCompanies : 0;
  
  const avgFutureIVI = futurePredictions.length > 0 ? futurePredictions.reduce((sum, item) => sum + (item.Future_IVI_Score || 0), 0) / (futurePredictions.length || 1) : 0;
  const improvement = avgFutureIVI - avgIVI;
  const improvementPercent = avgIVI > 0 ? (improvement / avgIVI) * 100 : 0;

  const riskData = [
    { name: 'High Risk', value: highRiskCount, color: 'var(--destructive)' },
    { name: 'Medium Risk', value: mediumRiskCount, color: 'var(--chart-3)' },
    { name: 'Low Risk', value: lowRiskCount, color: 'var(--chart-4)' },
  ];

  const scoresData = [
    { name: 'Average', H_score: avgH, E_score: avgE, U_score: avgU }
  ];

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive analysis of client portfolio health, experience, and utilization efficiency.
            </p>
          </div>
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF Report
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="swiss-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sector</label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Category</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="High Risk">High Risk</SelectItem>
                    <SelectItem value="Medium Risk">Medium Risk</SelectItem>
                    <SelectItem value="Low Risk">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setRegionFilter("all");
                    setSectorFilter("all");
                    setRiskFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            {(regionFilter !== "all" || sectorFilter !== "all" || riskFilter !== "all") && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredScores.length} of {displayScores.length} companies
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Total Companies" 
            value={totalCompanies} 
            icon={<Users className="h-4 w-4" />}
            description="Active corporate clients"
          />
          <KPICard 
            title="Average IVI Score" 
            value={avgIVI.toFixed(1)} 
            icon={<Activity className="h-4 w-4" />}
            description="Out of 100"
            trend={improvementPercent}
            trendLabel="projected growth"
          />
          <KPICard 
            title="High Risk Clients" 
            value={highRiskCount} 
            icon={<AlertTriangle className="h-4 w-4" />}
            description={`${((highRiskCount/totalCompanies)*100).toFixed(0)}% of portfolio`}
            className="border-l-4 border-l-destructive"
          />
          <KPICard 
            title="Projected Improvement" 
            value={`+${improvement.toFixed(1)}`} 
            icon={<TrendingUp className="h-4 w-4" />}
            description="Next 12 months"
            className="bg-primary/5"
          />
        </div>

        {/* Secondary KPI Cards - Data Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(claimsStats?.totalClaims || 0))}</div>
              <p className="text-xs text-muted-foreground">
                SAR {formatNumber(Number(claimsStats?.totalClaimed || 0))} claimed
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">SAR {formatNumber(Number(claimsStats?.totalApproved || 0))}</div>
              <p className="text-xs text-muted-foreground">
                {claimsStats?.totalClaimed ? ((Number(claimsStats.totalApproved) / Number(claimsStats.totalClaimed)) * 100).toFixed(1) : 0}% approval rate
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Call Center</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(callStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                Avg satisfaction: {Number(callStats?.avgSatisfaction || 0).toFixed(1)}/5
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pre-Authorizations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(preAuthStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                SAR {formatNumber(Number(preAuthStats?.totalCost || 0))} estimated
              </p>
            </CardContent>
          </Card>
          <Card className="swiss-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(providerStats?.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Healthcare facilities
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
            <TabsTrigger value="predictions">Future Predictions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 swiss-card">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>
                    Client portfolio segmentation by risk category
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RiskDistributionChart data={riskData} />
                </CardContent>
              </Card>
              <Card className="col-span-3 swiss-card">
                <CardHeader>
                  <CardTitle>Component Scores</CardTitle>
                  <CardDescription>
                    Average performance across H, E, U pillars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoresComparisonChart data={scoresData} />
                </CardContent>
              </Card>
            </div>
            
            {/* Claims Status Distribution */}
            {claimsStats?.byStatus && (
              <Card className="swiss-card">
                <CardHeader>
                  <CardTitle>Claims Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of claims by approval status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {claimsStats.byStatus.map((status) => (
                      <div key={status.status} className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold">{formatNumber(Number(status.count))}</div>
                        <div className="text-sm text-muted-foreground">{status.status}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          SAR {formatNumber(Number(status.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>Top Risk Drivers</CardTitle>
                <CardDescription>
                  Key factors influencing client retention and IVI scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureImportanceChart data={featureImportance} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>Client Performance Matrix</CardTitle>
                <CardDescription>Detailed breakdown of IVI scores for all clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Region</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Risk Category</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Health (H)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Experience (E)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Utilization (U)</th>
                        <th className="h-12 px-4 text-right align-middle font-bold text-primary">IVI Score</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredScores.map((client) => (
                        <tr key={client.CONT_NO} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">{client.CONT_NO}</td>
                          <td className="p-4 align-middle">{client.Company_Name || '-'}</td>
                          <td className="p-4 align-middle">{client.Region || '-'}</td>
                          <td className="p-4 align-middle">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              client.Risk_Category === 'High Risk' ? "bg-red-100 text-red-800" :
                              client.Risk_Category === 'Medium Risk' ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            )}>
                              {client.Risk_Category}
                            </span>
                          </td>
                          <td className="p-4 align-middle text-right">{(client.H_score || 0).toFixed(1)}</td>
                          <td className="p-4 align-middle text-right">{(client.E_score || 0).toFixed(1)}</td>
                          <td className="p-4 align-middle text-right">{(client.U_score || 0).toFixed(1)}</td>
                          <td className="p-4 align-middle text-right font-bold">{(client.IVI_Score || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader>
                <CardTitle>Projected IVI Improvement</CardTitle>
                <CardDescription>
                  Forecasted scores after implementing recommended interventions (12-month horizon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IVITrendChart data={futurePredictions} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              {recommendations.map((rec) => (
                <Card key={rec.CONT_NO} className={cn(
                  "swiss-card border-l-4",
                  rec.Risk_Category === 'High Risk' ? "border-l-destructive" :
                  rec.Risk_Category === 'Medium Risk' ? "border-l-yellow-500" : "border-l-green-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{rec.CONT_NO}</CardTitle>
                      <span className="text-sm font-medium text-muted-foreground">IVI: {(rec.IVI_Score || 0).toFixed(1)}</span>
                    </div>
                    <CardDescription>{rec.Risk_Category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(rec.Recommendations || '').split('|').map((action, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                          {action.trim()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
