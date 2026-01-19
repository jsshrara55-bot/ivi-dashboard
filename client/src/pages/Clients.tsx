import { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Search,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Filter,
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from 'xlsx';

type IVIClient = {
  id: number;
  contNo: string;
  companyName: string | null;
  sector: string | null;
  region: string | null;
  employeeCount: number | null;
  totalClaims: number | null;
  totalClaimed: string | null;
  totalApproved: string | null;
  hScore: string | null;
  eScore: string | null;
  uScore: string | null;
  iviScore: string | null;
  riskCategory: "Low" | "Medium" | "High" | null;
  chronicRate: string | null;
  complaintRate: string | null;
  rejectionRate: string | null;
  lossRatio: string | null;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "ivi" | "risk">("ivi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: iviData, isLoading } = trpc.ivi.scores.list.useQuery();

  const clients: IVIClient[] = iviData || [];

  // Extract unique regions and sectors
  const regions = Array.from(new Set(clients.map((c) => c.region).filter(Boolean))) as string[];
  const sectors = Array.from(new Set(clients.map((c) => c.sector).filter(Boolean))) as string[];

  // Filter and sort clients
  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === "all" || client.region === regionFilter;
      const matchesSector = sectorFilter === "all" || client.sector === sectorFilter;
      const matchesRisk = riskFilter === "all" || client.riskCategory === riskFilter;
      return matchesSearch && matchesRegion && matchesSector && matchesRisk;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = (a.companyName || "").localeCompare(b.companyName || "");
      } else if (sortBy === "ivi") {
        comparison = (parseFloat(a.iviScore || '0')) - (parseFloat(b.iviScore || '0'));
      } else if (sortBy === "risk") {
        const riskOrder = { High: 3, Medium: 2, Low: 1 };
        comparison =
          (riskOrder[a.riskCategory as keyof typeof riskOrder] || 0) -
          (riskOrder[b.riskCategory as keyof typeof riskOrder] || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
      case "High":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            عالية
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
            <TrendingDown className="h-3 w-3" />
            متوسطة
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            منخفضة
          </Badge>
        );
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const toggleSort = (column: "name" | "ivi" | "risk") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredClients.map((client, index) => ({
      '#': index + 1,
      'اسم الشركة': client.companyName || '-',
      'الكود': client.contNo,
      'المنطقة': client.region || '-',
      'أخرى': client.sector || '-',
      'IVI Score': client.iviScore ? parseFloat(client.iviScore).toFixed(1) : '-',
      'H Score': client.hScore ? parseFloat(client.hScore).toFixed(1) : '-',
      'E Score': client.eScore ? parseFloat(client.eScore).toFixed(1) : '-',
      'U Score': client.uScore ? parseFloat(client.uScore).toFixed(1) : '-',
      'فئة المخاطر': client.riskCategory === 'High' ? 'عالية' : client.riskCategory === 'Medium' ? 'متوسطة' : client.riskCategory === 'Low' ? 'منخفضة' : '-',
      'عدد الموظفين': client.employeeCount || '-',
      'إجمالي المطالبات': client.totalClaims || '-',
      'المبلغ المطالب': client.totalClaimed || '-',
      'المبلغ المعتمد': client.totalApproved || '-',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Main data sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'الشركات');

    // Summary sheet
    const summaryData = [
      { 'المقياس': 'إجمالي الشركات', 'القيمة': filteredClients.length },
      { 'المقياس': 'متوسط IVI', 'القيمة': (filteredClients.reduce((sum, c) => sum + parseFloat(c.iviScore || '0'), 0) / (filteredClients.length || 1)).toFixed(1) },
      { 'المقياس': 'عملاء عالية المخاطر', 'القيمة': filteredClients.filter(c => c.riskCategory === 'High').length },
      { 'المقياس': 'عملاء متوسطة المخاطر', 'القيمة': filteredClients.filter(c => c.riskCategory === 'Medium').length },
      { 'المقياس': 'عملاء منخفضة المخاطر', 'القيمة': filteredClients.filter(c => c.riskCategory === 'Low').length },
      { 'المقياس': 'تاريخ التقرير', 'القيمة': new Date().toLocaleDateString('ar-SA') },
    ];
    
    // Add filter info if any filters applied
    if (regionFilter !== 'all') {
      summaryData.push({ 'المقياس': 'فلتر المنطقة', 'القيمة': regionFilter });
    }
    if (sectorFilter !== 'all') {
      summaryData.push({ 'المقياس': 'فلتر الفئة', 'القيمة': sectorFilter });
    }
    if (riskFilter !== 'all') {
      summaryData.push({ 'المقياس': 'فلتر المخاطر', 'القيمة': riskFilter === 'High' ? 'عالية' : riskFilter === 'Medium' ? 'متوسطة' : 'منخفضة' });
    }
    if (searchTerm) {
      summaryData.push({ 'المقياس': 'كلمة البحث', 'القيمة': searchTerm });
    }
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'ملخص');

    // Download file
    const fileName = `Clients_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Stats
  const totalClients = clients.length;
  const highRiskCount = clients.filter((c: IVIClient) => c.riskCategory === "High").length;
  const avgIVI =
    clients.length > 0
      ? clients.reduce((sum: number, c: typeof clients[0]) => sum + parseFloat(c.iviScore || '0'), 0) / clients.length
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الشركات</h1>
          <p className="text-muted-foreground">
            إدارة وعرض جميع الشركات العميلة مع تقييمات IVI
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الشركات</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">شركة مسجلة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط IVI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(avgIVI)}`}>
                {avgIVI.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">من 100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عملاء عالية المخاطر</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
              <p className="text-xs text-muted-foreground">
                {totalClients > 0
                  ? `${((highRiskCount / totalClients) * 100).toFixed(0)}% من الإجمالي`
                  : "0%"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              الفلاتر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="أخرى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="فئة المخاطر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="High">عالية</SelectItem>
                  <SelectItem value="Medium">متوسطة</SelectItem>
                  <SelectItem value="Low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRegionFilter("all");
                  setSectorFilter("all");
                  setRiskFilter("all");
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>قائمة الشركات ({filteredClients.length})</span>
              <Button variant="outline" onClick={exportToExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                تصدير Excel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("name")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        اسم الشركة
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>الكود</TableHead>
                    <TableHead>المنطقة</TableHead>
                    <TableHead>أخرى</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("ivi")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        IVI Score
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>H</TableHead>
                    <TableHead>E</TableHead>
                    <TableHead>U</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("risk")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        المخاطر
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client: typeof filteredClients[0], index: number) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{client.companyName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.contNo}
                      </TableCell>
                      <TableCell>{client.region || "-"}</TableCell>
                      <TableCell>{client.sector || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${getScoreColor(client.iviScore ? parseFloat(client.iviScore) : null)}`}
                        >
                          {client.iviScore ? parseFloat(client.iviScore).toFixed(1) : "-"}
                        </span>
                      </TableCell>
                      <TableCell>{client.hScore ? parseFloat(client.hScore).toFixed(1) : "-"}</TableCell>
                      <TableCell>{client.eScore ? parseFloat(client.eScore).toFixed(1) : "-"}</TableCell>
                      <TableCell>{client.uScore ? parseFloat(client.uScore).toFixed(1) : "-"}</TableCell>
                      <TableCell>{getRiskBadge(client.riskCategory)}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/client/${client.contNo}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            عرض
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">لا توجد نتائج</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
