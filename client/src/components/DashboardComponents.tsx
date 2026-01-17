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
