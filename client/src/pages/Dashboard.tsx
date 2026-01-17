import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureImportanceChart, IVITrendChart, KPICard, RiskDistributionChart, ScoresComparisonChart } from "@/components/DashboardComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureImportance, fetchCsvData, FuturePrediction, IVIScore, Recommendation } from "@/lib/csv";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, BarChart3, Building2, FileText, Phone, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [iviScores, setIviScores] = useState<IVIScore[]>([]);
  const [futurePredictions, setFuturePredictions] = useState<FuturePrediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch summary from API
  const { data: iviSummary } = trpc.ivi.summary.useQuery();
  const { data: claimsStats } = trpc.ivi.claims.stats.useQuery();
  const { data: callStats } = trpc.ivi.calls.stats.useQuery();
  const { data: preAuthStats } = trpc.ivi.insurancePreAuths.stats.useQuery();
  const { data: providerStats } = trpc.ivi.providers.stats.useQuery();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate Summary Metrics - with safe defaults
  const totalCompanies = iviScores.length || 1; // Prevent division by zero
  const avgIVI = iviScores.length > 0 ? iviScores.reduce((sum, item) => sum + (item.IVI_Score || 0), 0) / totalCompanies : 0;
  const highRiskCount = iviScores.filter(item => item.Risk_Category === 'High Risk').length;
  const mediumRiskCount = iviScores.filter(item => item.Risk_Category === 'Medium Risk').length;
  const lowRiskCount = iviScores.filter(item => item.Risk_Category === 'Low Risk').length;
  
  const avgH = iviScores.length > 0 ? iviScores.reduce((sum, item) => sum + (item.H_score || 0), 0) / totalCompanies : 0;
  const avgE = iviScores.length > 0 ? iviScores.reduce((sum, item) => sum + (item.E_score || 0), 0) / totalCompanies : 0;
  const avgU = iviScores.length > 0 ? iviScores.reduce((sum, item) => sum + (item.U_score || 0), 0) / totalCompanies : 0;
  
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis of client portfolio health, experience, and utilization efficiency.
          </p>
        </div>

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
                          SAR {formatNumber(Number(status.amount || 0))}
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
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Risk Category</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Health (H)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Experience (E)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Utilization (U)</th>
                        <th className="h-12 px-4 text-right align-middle font-bold text-primary">IVI Score</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {iviScores.map((client) => (
                        <tr key={client.CONT_NO} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">{client.CONT_NO}</td>
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
