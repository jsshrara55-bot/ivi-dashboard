import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Building2, FileText, Phone, Users, Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DataExplorer() {
  const [activeTab, setActiveTab] = useState("providers");
  
  // Fetch data from API
  const { data: providers, isLoading: loadingProviders } = trpc.ivi.providers.list.useQuery();
  const { data: providerStats } = trpc.ivi.providers.stats.useQuery();
  const { data: claims, isLoading: loadingClaims } = trpc.ivi.claims.list.useQuery();
  const { data: claimsStats } = trpc.ivi.claims.stats.useQuery();
  const { data: calls, isLoading: loadingCalls } = trpc.ivi.calls.list.useQuery();
  const { data: callStats } = trpc.ivi.calls.stats.useQuery();
  const { data: preAuths, isLoading: loadingPreAuths } = trpc.ivi.insurancePreAuths.list.useQuery();
  const { data: preAuthStats } = trpc.ivi.insurancePreAuths.stats.useQuery();
  const { data: members, isLoading: loadingMembers } = trpc.ivi.members.list.useQuery();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(num);
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Data Explorer</h2>
            <p className="text-muted-foreground mt-2">
              Browse and analyze insurance data: providers, claims, members, and call center interactions.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="swiss-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("providers")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(providerStats?.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {providerStats?.byNetwork?.length || 0} networks
              </p>
            </CardContent>
          </Card>
          
          <Card className="swiss-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("members")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(members?.length || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Insured individuals
              </p>
            </CardContent>
          </Card>
          
          <Card className="swiss-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("claims")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(claimsStats?.totalClaims || 0))}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Number(claimsStats?.totalClaimed || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card className="swiss-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("preauths")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pre-Auths</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(preAuthStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Number(preAuthStats?.totalCost || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card className="swiss-card cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("calls")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Call Center</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(Number(callStats?.total || 0))}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Number(callStats?.avgSatisfaction || 0).toFixed(1)}/5 ⭐
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="preauths">Pre-Authorizations</TabsTrigger>
            <TabsTrigger value="calls">Call Center</TabsTrigger>
          </TabsList>
          
          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Healthcare Providers</CardTitle>
                  <CardDescription>Network of healthcare facilities and practitioners</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCsv(providers || [], 'providers')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Provider Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {providerStats?.byNetwork?.slice(0, 4).map((net) => (
                    <div key={net.network} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-xl font-bold">{net.count}</div>
                      <div className="text-xs text-muted-foreground">{net.network || 'Unknown'} Network</div>
                    </div>
                  ))}
                </div>
                
                {loadingProviders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto max-h-[500px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Code</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Network</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Practice</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Region</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Town</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers?.slice(0, 100).map((prov) => (
                          <tr key={prov.provCode} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-mono text-xs">{prov.provCode}</td>
                            <td className="p-4">{prov.provName}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                {prov.providerNetwork}
                              </span>
                            </td>
                            <td className="p-4">{prov.providerPractice}</td>
                            <td className="p-4">{prov.providerRegion}</td>
                            <td className="p-4">{prov.providerTown}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(providers?.length || 0) > 100 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing 100 of {providers?.length} providers
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Insured Members</CardTitle>
                  <CardDescription>Employee members covered under corporate policies</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCsv(members || [], 'members')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto max-h-[500px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Member No</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Contract</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Gender</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Age</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">City</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Network</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Chronic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members?.slice(0, 100).map((mbr) => (
                          <tr key={mbr.mbrNo} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-mono text-xs">{mbr.mbrNo}</td>
                            <td className="p-4 font-mono text-xs">{mbr.contNo}</td>
                            <td className="p-4">{mbr.gender}</td>
                            <td className="p-4">{mbr.age}</td>
                            <td className="p-4">{mbr.city}</td>
                            <td className="p-4">{mbr.planNetwork}</td>
                            <td className="p-4">
                              {mbr.hasChronic ? (
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">Yes</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(members?.length || 0) > 100 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing 100 of {members?.length} members
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Insurance Claims</CardTitle>
                  <CardDescription>Medical claims submitted for reimbursement</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCsv(claims || [], 'claims')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Claims Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {claimsStats?.byStatus?.map((status) => (
                    <div key={status.status} className={`text-center p-3 rounded-lg ${
                      status.status === 'Approved' ? 'bg-green-50' :
                      status.status === 'Rejected' ? 'bg-red-50' :
                      status.status === 'Pending' ? 'bg-yellow-50' : 'bg-muted/50'
                    }`}>
                      <div className="text-xl font-bold">{formatNumber(Number(status.count))}</div>
                      <div className="text-xs text-muted-foreground">{status.status}</div>
                    </div>
                  ))}
                </div>
                
                {loadingClaims ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto max-h-[500px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Claim ID</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Member</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Diagnosis</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Benefit</th>
                          <th className="h-10 px-4 text-right font-medium text-muted-foreground">Claimed</th>
                          <th className="h-10 px-4 text-right font-medium text-muted-foreground">Approved</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims?.slice(0, 100).map((claim) => (
                          <tr key={claim.claimId} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-mono text-xs">{claim.claimId}</td>
                            <td className="p-4 font-mono text-xs">{claim.mbrNo}</td>
                            <td className="p-4 text-xs">{claim.diagnosis?.substring(0, 30)}...</td>
                            <td className="p-4 text-xs">{claim.benefitDesc?.substring(0, 20)}...</td>
                            <td className="p-4 text-right">{formatCurrency(Number(claim.claimedAmount || 0))}</td>
                            <td className="p-4 text-right">{formatCurrency(Number(claim.approvedAmount || 0))}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                claim.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {claim.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(claims?.length || 0) > 100 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing 100 of {claims?.length} claims
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pre-Authorizations Tab */}
          <TabsContent value="preauths" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pre-Authorization Requests</CardTitle>
                  <CardDescription>Medication and procedure pre-approval requests</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCsv(preAuths || [], 'preauths')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Pre-Auth Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {preAuthStats?.byStatus?.map((status) => (
                    <div key={status.status} className={`text-center p-3 rounded-lg ${
                      status.status === 'Approved' ? 'bg-green-50' :
                      status.status === 'Rejected' ? 'bg-red-50' :
                      'bg-yellow-50'
                    }`}>
                      <div className="text-xl font-bold">{formatNumber(Number(status.count))}</div>
                      <div className="text-xs text-muted-foreground">{status.status}</div>
                    </div>
                  ))}
                </div>
                
                {loadingPreAuths ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto max-h-[500px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">ID</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Member</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Medication</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Category</th>
                          <th className="h-10 px-4 text-right font-medium text-muted-foreground">Est. Cost</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Docs</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preAuths?.slice(0, 100).map((pa) => (
                          <tr key={pa.preauthId} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-mono text-xs">{pa.preauthId}</td>
                            <td className="p-4 font-mono text-xs">{pa.mbrNo}</td>
                            <td className="p-4 text-xs">{pa.medicationName?.substring(0, 25)}...</td>
                            <td className="p-4 text-xs">{pa.medicationCategory}</td>
                            <td className="p-4 text-right">{formatCurrency(Number(pa.estimatedCost || 0))}</td>
                            <td className="p-4">
                              {pa.docsComplete ? (
                                <span className="text-green-600">✓ Complete</span>
                              ) : (
                                <span className="text-red-600">✗ Incomplete</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                pa.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                pa.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {pa.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(preAuths?.length || 0) > 100 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing 100 of {preAuths?.length} pre-authorizations
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Call Center Tab */}
          <TabsContent value="calls" className="space-y-4">
            <Card className="swiss-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Call Center Interactions</CardTitle>
                  <CardDescription>Customer service calls, complaints, and inquiries</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCsv(calls || [], 'calls')}>
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Call Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {callStats?.byStatus?.map((status) => (
                    <div key={status.status} className={`text-center p-3 rounded-lg ${
                      status.status === 'CLOSED' ? 'bg-green-50' :
                      status.status === 'OPENED' ? 'bg-yellow-50' :
                      'bg-blue-50'
                    }`}>
                      <div className="text-xl font-bold">{formatNumber(Number(status.count))}</div>
                      <div className="text-xs text-muted-foreground">{status.status}</div>
                    </div>
                  ))}
                </div>
                
                {loadingCalls ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-auto max-h-[500px]">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Call ID</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Member</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Category</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Type</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Reason</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                          <th className="h-10 px-4 text-right font-medium text-muted-foreground">Satisfaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calls?.slice(0, 100).map((call) => (
                          <tr key={call.callId} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-mono text-xs">{call.callId}</td>
                            <td className="p-4 font-mono text-xs">{call.mbrNo}</td>
                            <td className="p-4 text-xs">{call.callCat}</td>
                            <td className="p-4 text-xs">{call.callType}</td>
                            <td className="p-4 text-xs">{call.callReason?.substring(0, 30)}...</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                call.status === 'CLOSED' ? 'bg-green-100 text-green-800' :
                                call.status === 'OPENED' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {call.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {call.satisfactionScore ? `${call.satisfactionScore}/5 ⭐` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(calls?.length || 0) > 100 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing 100 of {calls?.length} calls
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
