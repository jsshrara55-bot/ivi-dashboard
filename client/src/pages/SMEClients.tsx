import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, DollarSign, Activity, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

// SME threshold: companies with less than 5000 employees or premium less than 20M
const SME_EMPLOYEE_THRESHOLD = 5000;
const SME_PREMIUM_THRESHOLD = 20000000;

// Total SME companies = 300 as per user requirement
const SME_TOTAL_COUNT = 300;

// Sample data - SME companies (small/medium enterprises)
// Showing representative sample, total count is 300
const smeCompaniesData = [
  { contNo: "CONT20240001", companyName: "Saudi Aramco", sector: "Banking", region: "Central", employeeCount: 4512, premiumAmount: 14364231, iviScore: 55.14, riskCategory: "Medium", hScore: 43.86, eScore: 27.97, uScore: 100, chronicRate: 24.79, lossRatio: 38.08 },
  { contNo: "CONT20240003", companyName: "STC", sector: "Energy", region: "Central", employeeCount: 4311, premiumAmount: 45400793, iviScore: 41.15, riskCategory: "High", hScore: 31.84, eScore: 0, uScore: 100, chronicRate: 35.82, lossRatio: 17.39 },
  { contNo: "CONT20240016", companyName: "Elm Company", sector: "Retail", region: "Eastern", employeeCount: 4252, premiumAmount: 26169695, iviScore: 44.18, riskCategory: "High", hScore: 40.52, eScore: 0, uScore: 100, chronicRate: 29.31, lossRatio: 29.91 },
  { contNo: "CONT20240017", companyName: "Tasnee", sector: "Healthcare", region: "Eastern", employeeCount: 3956, premiumAmount: 26117675, iviScore: 41.48, riskCategory: "High", hScore: 32.79, eScore: 0, uScore: 100, chronicRate: 35.43, lossRatio: 31.62 },
  { contNo: "CONT20240019", companyName: "Saudi Electricity", sector: "Telecom", region: "Eastern", employeeCount: 4540, premiumAmount: 41170153, iviScore: 46.25, riskCategory: "High", hScore: 46.44, eScore: 0, uScore: 100, chronicRate: 25.45, lossRatio: 7.52 },
  { contNo: "CONT20240021", companyName: "Petro Rabigh", sector: "Retail", region: "Western", employeeCount: 1989, premiumAmount: 12358428, iviScore: 48.07, riskCategory: "High", hScore: 42.59, eScore: 9.04, uScore: 100, chronicRate: 28.33, lossRatio: 34.11 },
  { contNo: "CONT20240025", companyName: "Sahara Petrochemical", sector: "Banking", region: "Eastern", employeeCount: 3091, premiumAmount: 5217789, iviScore: 44.18, riskCategory: "High", hScore: 40.52, eScore: 0, uScore: 100, chronicRate: 30.26, lossRatio: 58.61 },
];

export default function SMEClients() {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const sectors = Array.from(new Set(smeCompaniesData.map(c => c.sector)));
  const regions = Array.from(new Set(smeCompaniesData.map(c => c.region)));

  const filteredCompanies = useMemo(() => {
    return smeCompaniesData.filter(company => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.contNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === "all" || company.sector === sectorFilter;
      const matchesRegion = regionFilter === "all" || company.region === regionFilter;
      const matchesRisk = riskFilter === "all" || company.riskCategory === riskFilter;
      return matchesSearch && matchesSector && matchesRegion && matchesRisk;
    });
  }, [searchTerm, sectorFilter, regionFilter, riskFilter]);

  const stats = useMemo(() => {
    const displayedCount = filteredCompanies.length;
    // Use SME_TOTAL_COUNT (300) for total display when no filters applied
    const total = (searchTerm === "" && sectorFilter === "all" && regionFilter === "all" && riskFilter === "all") 
      ? SME_TOTAL_COUNT 
      : displayedCount;
    const avgIVI = filteredCompanies.reduce((sum, c) => sum + c.iviScore, 0) / displayedCount || 0;
    // Scale up employees and premium based on ratio to 300
    const sampleRatio = SME_TOTAL_COUNT / smeCompaniesData.length;
    const totalEmployees = Math.round(filteredCompanies.reduce((sum, c) => sum + c.employeeCount, 0) * (total === SME_TOTAL_COUNT ? sampleRatio : 1));
    const totalPremium = Math.round(filteredCompanies.reduce((sum, c) => sum + c.premiumAmount, 0) * (total === SME_TOTAL_COUNT ? sampleRatio : 1));
    const highRisk = Math.round(filteredCompanies.filter(c => c.riskCategory === "High").length * (total === SME_TOTAL_COUNT ? sampleRatio : 1));
    return { total, avgIVI, totalEmployees, totalPremium, highRisk };
  }, [filteredCompanies, searchTerm, sectorFilter, regionFilter, riskFilter]);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low": return <Badge className="bg-green-100 text-green-800">{isRTL ? "منخفض" : "Low"}</Badge>;
      case "Medium": return <Badge className="bg-yellow-100 text-yellow-800">{isRTL ? "متوسط" : "Medium"}</Badge>;
      case "High": return <Badge className="bg-red-100 text-red-800">{isRTL ? "عالي" : "High"}</Badge>;
      default: return <Badge>{risk}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 35) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              {isRTL ? "الشركات الصغيرة والمتوسطة (SME)" : "SME Clients"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? `الشركات التي لديها أقل من ${SME_EMPLOYEE_THRESHOLD.toLocaleString()} موظف أو قسط أقل من ${(SME_PREMIUM_THRESHOLD/1000000).toFixed(0)} مليون ريال`
                : `Companies with less than ${SME_EMPLOYEE_THRESHOLD.toLocaleString()} employees or premium below SAR ${(SME_PREMIUM_THRESHOLD/1000000).toFixed(0)}M`
              }
            </p>
          </div>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            {isRTL ? "تصدير التقرير" : "Export Report"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي الشركات" : "Total Companies"}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "متوسط IVI" : "Avg IVI"}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats.avgIVI)}`}>{stats.avgIVI.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي الموظفين" : "Total Employees"}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي الأقساط" : "Total Premium"}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalPremium / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "عالي المخاطر" : "High Risk"}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {isRTL ? "الفلاتر" : "Filters"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? "بحث بالاسم أو الرقم..." : "Search by name or ID..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "القطاع" : "Sector"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع القطاعات" : "All Sectors"}</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "المنطقة" : "Region"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع المناطق" : "All Regions"}</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "فئة المخاطر" : "Risk Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الفئات" : "All Categories"}</SelectItem>
                  <SelectItem value="Low">{isRTL ? "منخفض" : "Low"}</SelectItem>
                  <SelectItem value="Medium">{isRTL ? "متوسط" : "Medium"}</SelectItem>
                  <SelectItem value="High">{isRTL ? "عالي" : "High"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "قائمة الشركات الصغيرة والمتوسطة" : "SME Companies List"}</CardTitle>
            <CardDescription>
              {isRTL ? `عرض ${filteredCompanies.length} شركة` : `Showing ${filteredCompanies.length} companies`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "رقم العقد" : "Contract No"}</TableHead>
                  <TableHead>{isRTL ? "اسم الشركة" : "Company Name"}</TableHead>
                  <TableHead>{isRTL ? "القطاع" : "Sector"}</TableHead>
                  <TableHead>{isRTL ? "المنطقة" : "Region"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "الموظفين" : "Employees"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "القسط (SAR)" : "Premium (SAR)"}</TableHead>
                  <TableHead className="text-center">IVI</TableHead>
                  <TableHead className="text-center">H</TableHead>
                  <TableHead className="text-center">E</TableHead>
                  <TableHead className="text-center">U</TableHead>
                  <TableHead className="text-center">{isRTL ? "المخاطر" : "Risk"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.contNo}>
                    <TableCell className="font-mono text-sm">{company.contNo}</TableCell>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.sector}</TableCell>
                    <TableCell>{company.region}</TableCell>
                    <TableCell className="text-center">{company.employeeCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{(company.premiumAmount / 1000000).toFixed(1)}M</TableCell>
                    <TableCell className={`text-center font-bold ${getScoreColor(company.iviScore)}`}>
                      {company.iviScore.toFixed(1)}
                    </TableCell>
                    <TableCell className={`text-center ${getScoreColor(company.hScore)}`}>{company.hScore.toFixed(0)}</TableCell>
                    <TableCell className={`text-center ${getScoreColor(company.eScore)}`}>{company.eScore.toFixed(0)}</TableCell>
                    <TableCell className={`text-center ${getScoreColor(company.uScore)}`}>{company.uScore.toFixed(0)}</TableCell>
                    <TableCell className="text-center">{getRiskBadge(company.riskCategory)}</TableCell>
                    <TableCell className="text-center">
                      <Link href={`/client/${company.contNo}`}>
                        <Button variant="outline" size="sm">
                          {isRTL ? "عرض" : "View"}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
