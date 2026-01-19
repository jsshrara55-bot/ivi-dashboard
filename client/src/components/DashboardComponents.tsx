import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, description, trend, trendLabel, className, icon }: KPICardProps) {
  return (
    <Card className={cn("swiss-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend !== undefined) && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend !== undefined && (
              <span className={cn(
                "flex items-center mr-2 font-medium",
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
              )}>
                {trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : trend < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                {Math.abs(trend)}%
              </span>
            )}
            {description && <span>{description}</span>}
            {trendLabel && <span className="ml-1">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Risk Distribution Chart
interface RiskDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export function RiskDistributionChart({ data }: RiskDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="square" />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Scores Comparison Chart
interface ScoresComparisonProps {
  data: any[];
}

export function ScoresComparisonChart({ data }: ScoresComparisonProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
        />
        <Legend iconType="square" />
        <Bar dataKey="H_score" name="Health (H)" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="E_score" name="Experience (E)" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="U_score" name="Utilization (U)" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// IVI Trend Chart (Future Prediction)
interface IVITrendChartProps {
  data: any[];
}

export function IVITrendChart({ data }: IVITrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="CONT_NO" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
        />
        <Legend iconType="square" />
        <Bar dataKey="IVI_Score" name="Current IVI" fill="var(--primary)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Future_IVI_Score" name="Predicted IVI" fill="var(--chart-4)" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Interactive IVI Forecast Chart (12-month projection)
interface IVIForecastChartProps {
  currentIVI: number;
  projectedIVI: number;
  language?: 'ar' | 'en';
}

export function IVIForecastChart({ currentIVI, projectedIVI, language = 'en' }: IVIForecastChartProps) {
  const isArabic = language === 'ar';
  
  // Generate 12-month forecast data with realistic progression
  const monthlyImprovement = (projectedIVI - currentIVI) / 12;
  const months = isArabic 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const forecastData = months.map((month, index) => {
    // Add some realistic variance to the projection
    const variance = (Math.random() - 0.5) * 2; // ±1 point variance
    const projected = currentIVI + (monthlyImprovement * (index + 1)) + variance;
    return {
      month,
      [isArabic ? 'IVI المتوقع' : 'Projected IVI']: Math.min(100, Math.max(0, projected)).toFixed(1),
      [isArabic ? 'الحد الأدنى' : 'Min Range']: Math.max(0, projected - 3).toFixed(1),
      [isArabic ? 'الحد الأعلى' : 'Max Range']: Math.min(100, projected + 3).toFixed(1),
    };
  });

  // Add current month as baseline
  const currentMonth = isArabic ? 'الحالي' : 'Current';
  forecastData.unshift({
    month: currentMonth,
    [isArabic ? 'IVI المتوقع' : 'Projected IVI']: currentIVI.toFixed(1),
    [isArabic ? 'الحد الأدنى' : 'Min Range']: (currentIVI - 1).toFixed(1),
    [isArabic ? 'الحد الأعلى' : 'Max Range']: (currentIVI + 1).toFixed(1),
  });

  const projectedKey = isArabic ? 'IVI المتوقع' : 'Projected IVI';
  const minKey = isArabic ? 'الحد الأدنى' : 'Min Range';
  const maxKey = isArabic ? 'الحد الأعلى' : 'Max Range';

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11 }} 
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12 }} 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            direction: isArabic ? 'rtl' : 'ltr'
          }}
          formatter={(value: any, name: string) => [
            `${value}`,
            name
          ]}
        />
        <Legend iconType="circle" />
        <Line 
          type="monotone" 
          dataKey={minKey}
          stroke="#94a3b8" 
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          activeDot={false}
        />
        <Line 
          type="monotone" 
          dataKey={maxKey}
          stroke="#94a3b8" 
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          activeDot={false}
        />
        <Line 
          type="monotone" 
          dataKey={projectedKey}
          stroke="var(--primary)" 
          strokeWidth={3}
          dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Threshold Alert Indicator
interface ThresholdAlertProps {
  companies: Array<{
    name: string;
    currentIVI: number;
    threshold: number;
    direction: 'up' | 'down';
    daysToThreshold: number;
  }>;
  language?: 'ar' | 'en';
}

export function ThresholdAlertIndicator({ companies, language = 'en' }: ThresholdAlertProps) {
  const isArabic = language === 'ar';
  
  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArabic ? 'لا توجد شركات قريبة من عتبات التغيير' : 'No companies near threshold changes'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company, index) => {
        const progress = Math.abs(company.currentIVI - company.threshold) / 10 * 100;
        const isPositive = company.direction === 'up';
        
        return (
          <div key={index} className="p-3 rounded-lg border bg-background">
            <div className={cn("flex justify-between items-center mb-2", isArabic && "flex-row-reverse")}>
              <span className="font-medium text-sm">{company.name}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {isPositive 
                  ? (isArabic ? 'ترقية محتملة' : 'Potential Upgrade')
                  : (isArabic ? 'تراجع محتمل' : 'Potential Downgrade')
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isPositive ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {company.currentIVI.toFixed(1)} → {company.threshold}
              </div>
            </div>
            <div className={cn("text-xs text-muted-foreground mt-1", isArabic && "text-right")}>
              {isArabic 
                ? `~${company.daysToThreshold} يوم للوصول للعتبة`
                : `~${company.daysToThreshold} days to threshold`
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Feature Importance Chart
interface FeatureImportanceChartProps {
  data: { Feature: string; Importance: number }[];
}

export function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  const sortedData = [...data].sort((a, b) => b.Importance - a.Importance).slice(0, 10);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis dataKey="Feature" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
        />
        <Bar dataKey="Importance" fill="var(--chart-5)" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
