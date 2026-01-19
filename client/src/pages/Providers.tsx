import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hospital, Search, Filter, MapPin, Stethoscope, Building2, FileText, Globe, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Provider types
type ProviderPractice = "Hospital" | "Polyclinic" | "Dental" | "Pharmacy" | "Optical" | "Eye Center" | "Clinic" | "Other";

interface Provider {
  provCode: string;
  provName: string;
  providerNetwork: string;
  providerPractice: string;
  providerRegion: string;
  providerTown: string;
  totalClaims?: number;
  totalAmount?: number;
  avgApprovalRate?: number;
}

// Sample providers data from the CSV
const providersData: Provider[] = [
  { provCode: "20068", provName: "Dallah Hospital - Nakeel", providerNetwork: "H. NW7", providerPractice: "Hospital", providerRegion: "Central", providerTown: "Riyadh", totalClaims: 1250, totalAmount: 4500000, avgApprovalRate: 92 },
  { provCode: "20134", provName: "Saudi German Hospitals Group", providerNetwork: "G. NW6", providerPractice: "Hospital", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 2100, totalAmount: 7800000, avgApprovalRate: 88 },
  { provCode: "20147", provName: "United Doctors Hospital", providerNetwork: "F. NW5", providerPractice: "Hospital", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 980, totalAmount: 3200000, avgApprovalRate: 91 },
  { provCode: "22478", provName: "Oral Dental Clinics", providerNetwork: "J. ONW", providerPractice: "Dental", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 450, totalAmount: 280000, avgApprovalRate: 95 },
  { provCode: "22671", provName: "Al Nahdi Medical Company", providerNetwork: "F. NW5", providerPractice: "Pharmacy", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 5600, totalAmount: 1200000, avgApprovalRate: 98 },
  { provCode: "21800", provName: "DIMA Dental Center", providerNetwork: "F. NW5", providerPractice: "Dental", providerRegion: "Central", providerTown: "Riyadh", totalClaims: 320, totalAmount: 180000, avgApprovalRate: 94 },
  { provCode: "20056", provName: "Al Mana General Hospital - Al Jubail", providerNetwork: "F. NW5", providerPractice: "Hospital", providerRegion: "Eastern", providerTown: "Jubail Industrial", totalClaims: 780, totalAmount: 2900000, avgApprovalRate: 89 },
  { provCode: "20057", provName: "Al Mana General Hospital - Al Khobar", providerNetwork: "F. NW5", providerPractice: "Hospital", providerRegion: "Eastern", providerTown: "Khobar", totalClaims: 1100, totalAmount: 4100000, avgApprovalRate: 90 },
  { provCode: "20058", provName: "Al Mana General Hospital - Dammam", providerNetwork: "F. NW5", providerPractice: "Hospital", providerRegion: "Eastern", providerTown: "Dammam", totalClaims: 1450, totalAmount: 5200000, avgApprovalRate: 87 },
  { provCode: "20089", provName: "Magrabi Eye Ear & Dental Hospital - Jeddah", providerNetwork: "D. NW3", providerPractice: "Dental & Eye Center", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 890, totalAmount: 1800000, avgApprovalRate: 93 },
  { provCode: "20236", provName: "Al Amen Hospital", providerNetwork: "D. NW3", providerPractice: "Hospital", providerRegion: "Western", providerTown: "Taif", totalClaims: 560, totalAmount: 1900000, avgApprovalRate: 86 },
  { provCode: "20100", provName: "Al Zahra Hospital - Jeddah", providerNetwork: "L. NWS", providerPractice: "Hospital", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 1680, totalAmount: 6100000, avgApprovalRate: 91 },
  { provCode: "20030", provName: "Obeid Specialist Hospital - Riyadh", providerNetwork: "L. NWS", providerPractice: "Hospital", providerRegion: "Central", providerTown: "Riyadh", totalClaims: 920, totalAmount: 3400000, avgApprovalRate: 88 },
  { provCode: "20045", provName: "GAMA Hospital", providerNetwork: "C. NW2", providerPractice: "Hospital", providerRegion: "Eastern", providerTown: "Khobar", totalClaims: 1340, totalAmount: 4800000, avgApprovalRate: 89 },
  { provCode: "20077", provName: "Dr Erfan & Bagedo General Hospital", providerNetwork: "G. NW6", providerPractice: "Hospital", providerRegion: "Western", providerTown: "Jeddah", totalClaims: 1890, totalAmount: 7200000, avgApprovalRate: 90 },
];

export default function Providers() {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [networkFilter, setNetworkFilter] = useState("all");

  const practices = Array.from(new Set(providersData.map(p => p.providerPractice)));
  const regions = Array.from(new Set(providersData.map(p => p.providerRegion)));
  const networks = Array.from(new Set(providersData.map(p => p.providerNetwork)));

  const filteredProviders = useMemo(() => {
    return providersData.filter(provider => {
      const matchesSearch = provider.provName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.provCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.providerTown.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPractice = practiceFilter === "all" || provider.providerPractice === practiceFilter;
      const matchesRegion = regionFilter === "all" || provider.providerRegion === regionFilter;
      const matchesNetwork = networkFilter === "all" || provider.providerNetwork === networkFilter;
      return matchesSearch && matchesPractice && matchesRegion && matchesNetwork;
    });
  }, [searchTerm, practiceFilter, regionFilter, networkFilter]);

  const stats = useMemo(() => {
    const total = filteredProviders.length;
    const hospitals = filteredProviders.filter(p => p.providerPractice === "Hospital").length;
    const totalClaims = filteredProviders.reduce((sum, p) => sum + (p.totalClaims || 0), 0);
    const totalAmount = filteredProviders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const avgApproval = filteredProviders.reduce((sum, p) => sum + (p.avgApprovalRate || 0), 0) / total || 0;
    return { total, hospitals, totalClaims, totalAmount, avgApproval };
  }, [filteredProviders]);

  const getPracticeBadge = (practice: string) => {
    const colors: Record<string, string> = {
      "Hospital": "bg-blue-100 text-blue-800",
      "Polyclinic": "bg-green-100 text-green-800",
      "Dental": "bg-purple-100 text-purple-800",
      "Pharmacy": "bg-orange-100 text-orange-800",
      "Optical": "bg-cyan-100 text-cyan-800",
      "Eye Center": "bg-indigo-100 text-indigo-800",
      "Clinic": "bg-pink-100 text-pink-800",
    };
    return <Badge className={colors[practice] || "bg-gray-100 text-gray-800"}>{practice}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Hospital className="h-8 w-8 text-teal-600" />
              {isRTL ? "مقدمو الخدمات الصحية" : "Healthcare Providers"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL 
                ? "المستشفيات والعيادات والصيدليات ومراكز الرعاية الصحية"
                : "Hospitals, clinics, pharmacies and healthcare facilities"
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
          <Card className="border-teal-200 bg-teal-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي المقدمين" : "Total Providers"}</CardTitle>
              <Hospital className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-700">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "المستشفيات" : "Hospitals"}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hospitals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي المطالبات" : "Total Claims"}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClaims.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "إجمالي المبالغ" : "Total Amount"}</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalAmount / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isRTL ? "متوسط الموافقة" : "Avg Approval"}</CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.avgApproval.toFixed(0)}%</div>
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
                  placeholder={isRTL ? "بحث بالاسم أو الرمز أو المدينة..." : "Search by name, code or city..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "نوع المنشأة" : "Practice Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الأنواع" : "All Types"}</SelectItem>
                  {practices.map(practice => (
                    <SelectItem key={practice} value={practice}>{practice}</SelectItem>
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
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "الشبكة" : "Network"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الشبكات" : "All Networks"}</SelectItem>
                  {networks.map(network => (
                    <SelectItem key={network} value={network}>{network}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? "قائمة مقدمي الخدمات" : "Providers List"}</CardTitle>
            <CardDescription>
              {isRTL ? `عرض ${filteredProviders.length} مقدم خدمة` : `Showing ${filteredProviders.length} providers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "الرمز" : "Code"}</TableHead>
                  <TableHead>{isRTL ? "اسم المنشأة" : "Provider Name"}</TableHead>
                  <TableHead>{isRTL ? "النوع" : "Type"}</TableHead>
                  <TableHead>{isRTL ? "الشبكة" : "Network"}</TableHead>
                  <TableHead>{isRTL ? "المنطقة" : "Region"}</TableHead>
                  <TableHead>{isRTL ? "المدينة" : "City"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "المطالبات" : "Claims"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "المبلغ (SAR)" : "Amount (SAR)"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "نسبة الموافقة" : "Approval %"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.provCode}>
                    <TableCell className="font-mono text-sm">{provider.provCode}</TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate" title={provider.provName}>
                      {provider.provName}
                    </TableCell>
                    <TableCell>{getPracticeBadge(provider.providerPractice)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{provider.providerNetwork}</Badge>
                    </TableCell>
                    <TableCell>{provider.providerRegion}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {provider.providerTown}
                    </TableCell>
                    <TableCell className="text-center">{(provider.totalClaims || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center">{((provider.totalAmount || 0) / 1000000).toFixed(1)}M</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${(provider.avgApprovalRate || 0) >= 90 ? "text-green-600" : (provider.avgApprovalRate || 0) >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                        {provider.avgApprovalRate || 0}%
                      </span>
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
