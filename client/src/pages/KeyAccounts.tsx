import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, DollarSign, Activity, FileText, Crown } from "lucide-react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

// Key Account: companies with 5000+ employees or premium 20M+ SAR
const KEY_ACCOUNT_EMPLOYEE_THRESHOLD = 5000;
const KEY_ACCOUNT_PREMIUM_THRESHOLD = 20000000;

// Sample data - Key Account companies (large enterprises)
const keyAccountsData = [
  { contNo: "CONT20240002", companyName: "SABIC", sector: "Banking", region: "Southern", employeeCount: 10174, premiumAmount: 7132899, iviScore: 13.56, riskCategory: "High", hScore: 31.75, eScore: 0, uScore: 8.16, chronicRate: 36.81, lossRatio: 115.92 },
  { contNo: "CONT20240004", companyName: "Al Rajhi Bank", sector: "Energy", region: "Southern", employeeCount: 12231, premiumAmount: 41570403, iviScore: 43.9, riskCategory: "High", hScore: 39.1, eScore: 0.63, uScore: 100, chronicRate: 30.56, lossRatio: 6.04 },
  { contNo: "CONT20240005", companyName: "Saudi Airlines", sector: "Healthcare", region: "Western", employeeCount: 10154, premiumAmount: 5436124, iviScore: 41.88, riskCategory: "High", hScore: 33.96, eScore: 0, uScore: 100, chronicRate: 34.78, lossRatio: 64.58 },
  { contNo: "CONT20240006", companyName: "ACWA Power", sector: "Telecom", region: "Northern", employeeCount: 5052, premiumAmount: 19449461, iviScore: 45.21, riskCategory: "High", hScore: 37.74, eScore: 5.73, uScore: 100, chronicRate: 31.58, lossRatio: 20.06 },
  { contNo: "CONT20240007", companyName: "Ma'aden", sector: "Technology", region: "Central", employeeCount: 6724, premiumAmount: 29090698, iviScore: 41.44, riskCategory: "High", hScore: 32.68, eScore: 0, uScore: 100, chronicRate: 37.86, lossRatio: 15.33 },
  { contNo: "CONT20240008", companyName: "Almarai", sector: "Technology", region: "Southern", employeeCount: 13723, premiumAmount: 35831481, iviScore: 40.68, riskCategory: "High", hScore: 30.5, eScore: 0, uScore: 100, chronicRate: 38.46, lossRatio: 20.95 },
  { contNo: "CONT20240009", companyName: "Jarir Bookstore", sector: "Banking", region: "Northern", employeeCount: 9544, premiumAmount: 47187302, iviScore: 46.23, riskCategory: "High", hScore: 39.52, eScore: 6.84, uScore: 100, chronicRate: 30.0, lossRatio: 8.16 },
  { contNo: "CONT20240010", companyName: "Mobily", sector: "Technology", region: "Southern", employeeCount: 12043, premiumAmount: 8075222, iviScore: 41.09, riskCategory: "High", hScore: 31.68, eScore: 0, uScore: 100, chronicRate: 36.36, lossRatio: 69.28 },
  { contNo: "CONT20240011", companyName: "Zain KSA", sector: "Retail", region: "Eastern", employeeCount: 14513, premiumAmount: 11778091, iviScore: 41.62, riskCategory: "High", hScore: 33.19, eScore: 0, uScore: 100, chronicRate: 35.62, lossRatio: 27.27 },
  { contNo: "CONT20240012", companyName: "Bank AlJazira", sector: "Healthcare", region: "Eastern", employeeCount: 10915, premiumAmount: 15915531, iviScore: 48.09, riskCategory: "High", hScore: 39.28, eScore: 12.41, uScore: 100, chronicRate: 29.33, lossRatio: 44.76 },
  { contNo: "CONT20240013", companyName: "Riyad Bank", sector: "Technology", region: "Eastern", employeeCount: 11480, premiumAmount: 48488918, iviScore: 44.83, riskCategory: "High", hScore: 42.37, eScore: 0, uScore: 100, chronicRate: 25.85, lossRatio: 14.09 },
  { contNo: "CONT20240014", companyName: "SNB", sector: "Banking", region: "Southern", employeeCount: 9251, premiumAmount: 15965755, iviScore: 40.96, riskCategory: "High", hScore: 31.3, eScore: 0, uScore: 100, chronicRate: 38.16, lossRatio: 50.54 },
  { contNo: "CONT20240015", companyName: "SABB", sector: "Transport", region: "Northern", employeeCount: 10985, premiumAmount: 42376264, iviScore: 43.53, riskCategory: "High", hScore: 38.65, eScore: 0, uScore: 100, chronicRate: 30.26, lossRatio: 21.95 },
  { contNo: "CONT20240018", companyName: "Yanbu Cement", sector: "Retail", region: "Northern", employeeCount: 14994, premiumAmount: 35793026, iviScore: 46.37, riskCategory: "High", hScore: 41.79, eScore: 4.97, uScore: 100, chronicRate: 28.21, lossRatio: 25.26 },
  { contNo: "CONT20240020", companyName: "Sadara", sector: "Manufacturing", region: "Southern", employeeCount: 10060, premiumAmount: 29293170, iviScore: 43.39, riskCategory: "High", hScore: 38.25, eScore: 0, uScore: 100, chronicRate: 33.33, lossRatio: 23.02 },
  { contNo: "CONT20240022", companyName: "Saudi Kayan", sector: "Telecom", region: "Western", employeeCount: 10271, premiumAmount: 30821297, iviScore: 41.98, riskCategory: "High", hScore: 34.24, eScore: 0, uScore: 100, chronicRate: 32.46, lossRatio: 19.32 },
  { contNo: "CONT20240023", companyName: "Sipchem", sector: "Healthcare", region: "Southern", employeeCount: 9169, premiumAmount: 42126361, iviScore: 45.15, riskCategory: "High", hScore: 42.54, eScore: 0.74, uScore: 100, chronicRate: 26.37, lossRatio: 10.08 },
  { contNo: "CONT20240024", companyName: "Advanced Petrochemical", sector: "Energy", region: "Central", employeeCount: 13092, premiumAmount: 27828789, iviScore: 48.57, riskCategory: "High", hScore: 41.01, eScore: 12.06, uScore: 100, chronicRate: 28.7, lossRatio: 16.62 },
];

export default function KeyAccounts() {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const sectors = Array.from(new Set(keyAccountsData.map(c => c.sector)));
  const regions = Array.from(new Set(keyAccountsData.map(c => c.region)));

  const filteredCompanies = useMemo(() => {
    return keyAccountsData.filter(company => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.contNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === "all" || company.sector === sectorFilter;
      const matchesRegion = regionFilter === "all" || company.region === regionFilter;
      const matchesRisk = riskFilter === "all" || company.riskCategory === riskFilter;
      return matchesSearch && matchesSector && matchesRegion && matchesRisk;
    });
  }, [searchTerm, sectorFilter, regionFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = filteredCompanies.length;
    const avgIVI = filteredCompanies.reduce((sum, c) => sum + c.iviScore, 0) / total || 0;
    const totalEmployees = filteredCompanies.reduce((sum, c) => sum + c.employeeCount, 0);
    const totalPremium = filteredCompanies.reduce((sum, c) => sum + c.premiumAmount, 0);
    const highRisk = filteredCompanies.filter(c => c.riskCategory === "High").length;
    return { total, avgIVI, totalEmployees, totalPremium, highRisk };
  }, [filteredCompanies]);

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
              <Building className="h-8 w-8 text-purple-600" />
              <Crown className="h-6 w-6 text-yellow-500" />
              {isRTL ? "الشركات الكبيرة (Key Accounts)" : "Key Accounts"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? `الشركات التي لديها ${KEY_ACCOUNT_EMPLOYEE_THRESHOLD.toLocaleString()}+ موظف أو قسط ${(KEY_ACCOUNT_PREMIUM_THRESHOLD/1000000).toFixed(0)}+ مليون ريال`
                : `Companies with ${KEY_ACCOUNT_EMPLOYEE_THRESHOLD.toLocaleString()}+ employees or premium SAR ${(KEY_ACCOUNT_PREMIUM_THRESHOLD/1000000).toFixed(0)}M+`
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
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي الشركات" : "Total Companies"}</CardTitle>
              <Building className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.total}</div>
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
            <CardTitle>{isRTL ? "قائمة الشركات الكبيرة" : "Key Accounts List"}</CardTitle>
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
                    <TableCell className="font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      {company.companyName}
                    </TableCell>
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
