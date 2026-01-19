import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Heart, Smile, TrendingDown, ArrowRight, Shield, Leaf, Activity } from "lucide-react";

interface CompanyData {
  name: string;
  h: number;
  e: number;
  u: number;
  ivi: number;
}

interface IVIRadarChartProps {
  companies: CompanyData[];
  showIdeal?: boolean;
}

// IVI Radar Chart Component - Spider Chart showing H, E, U balance
export function IVIRadarChart({ companies, showIdeal = true }: IVIRadarChartProps) {
  const { isRTL } = useLanguage();

  // Transform data for radar chart
  const radarData = [
    {
      dimension: isRTL ? "الصحة (H)" : "Health (H)",
      fullMark: 100,
      ideal: 85,
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.h;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "التجربة (E)" : "Experience (E)",
      fullMark: 100,
      ideal: 85,
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.e;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "الاستخدام (U)" : "Utilization (U)",
      fullMark: 100,
      ideal: 85,
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.u;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          {isRTL ? "رادار IVI - توازن الأبعاد الثلاثة" : "IVI Radar - Three Dimensions Balance"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? "الشركة المثالية تغطي كامل الرادار بتوازن بين H, E, U"
            : "The ideal company covers the entire radar with balance between H, E, U"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              
              {/* Ideal reference area */}
              {showIdeal && (
                <Radar
                  name={isRTL ? "المثالي" : "Ideal"}
                  dataKey="ideal"
                  stroke="#9ca3af"
                  fill="#9ca3af"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
              )}
              
              {/* Company radars */}
              {companies.map((company, idx) => (
                <Radar
                  key={company.name}
                  name={company.name}
                  dataKey={`company${idx}`}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
              
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend explanation */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <Heart className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <div className="font-medium text-red-700">H - {isRTL ? "الصحة" : "Health"}</div>
            <div className="text-xs text-red-600">
              {isRTL ? "المخرجات الصحية والوقاية" : "Health outcomes & prevention"}
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Smile className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="font-medium text-blue-700">E - {isRTL ? "التجربة" : "Experience"}</div>
            <div className="text-xs text-blue-600">
              {isRTL ? "جودة الخدمة والرضا" : "Service quality & satisfaction"}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <TrendingDown className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <div className="font-medium text-amber-700">U - {isRTL ? "الاستخدام" : "Utilization"}</div>
            <div className="text-xs text-amber-600">
              {isRTL ? "كفاءة التكلفة والاستدامة" : "Cost efficiency & sustainability"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bridge Diagram Component - Connecting Traditional Insurance to Longevity Model
export function IVIBridgeDiagram() {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          {isRTL ? "جسر التحول: من التأمين التقليدي إلى نموذج الاستدامة" : "Transformation Bridge: From Traditional Insurance to Longevity Model"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? "مؤشر IVI هو الجسر الذي يربط بين النموذجين"
            : "IVI Index is the bridge connecting both models"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Bridge Diagram */}
          <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Traditional Insurance Model */}
            <div className="flex-1 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-700 mb-3">
                  {isRTL ? "النموذج التقليدي" : "Traditional Model"}
                </h3>
                <div className="space-y-2 text-sm text-red-600">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {isRTL ? "فواتير ومطالبات" : "Bills & Claims"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {isRTL ? "رد فعل للأمراض" : "Reactive to illness"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {isRTL ? "تركيز على الخسارة" : "Loss-focused"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {isRTL ? "علاقة معاملات" : "Transactional"}
                  </div>
                </div>
              </div>
            </div>

            {/* IVI Bridge */}
            <div className="flex-shrink-0 relative">
              {/* Bridge structure */}
              <div className="relative w-48 h-32">
                {/* Bridge arch */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 130">
                  {/* Bridge path */}
                  <path
                    d="M 10 100 Q 100 20 190 100"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Bridge supports */}
                  <line x1="10" y1="100" x2="10" y2="120" stroke="#10b981" strokeWidth="6" />
                  <line x1="190" y1="100" x2="190" y2="120" stroke="#10b981" strokeWidth="6" />
                  {/* Bridge deck */}
                  <line x1="0" y1="120" x2="200" y2="120" stroke="#10b981" strokeWidth="4" />
                </svg>
                
                {/* IVI label on bridge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  IVI
                </div>
              </div>
              
              {/* Arrows */}
              <div className={`flex items-center justify-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ArrowRight className={`h-5 w-5 text-emerald-500 ${isRTL ? 'rotate-180' : ''}`} />
                <span className="text-xs text-emerald-600 font-medium">
                  {isRTL ? "التحول" : "Transform"}
                </span>
                <ArrowRight className={`h-5 w-5 text-emerald-500 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Longevity Model */}
            <div className="flex-1 p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-emerald-700 mb-3">
                  {isRTL ? "نموذج الاستدامة" : "Longevity Model"}
                </h3>
                <div className="space-y-2 text-sm text-emerald-600">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    {isRTL ? "وقاية واستباقية" : "Prevention & Proactive"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    {isRTL ? "استدامة طويلة المدى" : "Long-term sustainability"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    {isRTL ? "جودة الحياة" : "Quality of life"}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    {isRTL ? "شراكة حقيقية" : "True partnership"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IVI Components under bridge */}
          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 rounded-xl text-white">
            <div className="text-center mb-4">
              <h4 className="font-bold text-lg">
                {isRTL ? "مكونات جسر IVI" : "IVI Bridge Components"}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold">H</div>
                <div className="text-xs opacity-90">
                  {isRTL ? "الصحة = 35%" : "Health = 35%"}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold">E</div>
                <div className="text-xs opacity-90">
                  {isRTL ? "التجربة = 30%" : "Experience = 30%"}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold">U</div>
                <div className="text-xs opacity-90">
                  {isRTL ? "الاستخدام = 35%" : "Utilization = 35%"}
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border-l-4 border-emerald-500 italic text-slate-600">
            {isRTL ? (
              <p>
                "هدفنا ليس فقط التنبؤ بمن سيغادر، بل بناء نظام يجعل العميل 'يرغب' في البقاء لأننا أصبحنا شريكاً في نمو صحة موظفيه."
              </p>
            ) : (
              <p>
                "Our goal is not just to predict who will leave, but to build a system that makes the client 'want' to stay because we've become a partner in their employees' health growth."
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Risk Drivers Radar - For comparing multiple companies
interface RiskDriversRadarProps {
  companies: CompanyData[];
}

export function RiskDriversRadar({ companies }: RiskDriversRadarProps) {
  const { isRTL } = useLanguage();

  // Extended radar data with more dimensions
  const radarData = [
    {
      dimension: isRTL ? "الأمراض المزمنة" : "Chronic Diseases",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = Math.max(0, 100 - (company.h * 0.8));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "سرعة الموافقات" : "Approval Speed",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.e;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "رضا العملاء" : "Customer Satisfaction",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.e * 0.9 + 10;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "كفاءة التكلفة" : "Cost Efficiency",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.u;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "الرعاية الوقائية" : "Preventive Care",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.h * 0.7 + 20;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      dimension: isRTL ? "الاحتفاظ" : "Retention",
      ...companies.reduce((acc, company, idx) => {
        acc[`company${idx}`] = company.ivi;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          {isRTL ? "رادار محركات المخاطر" : "Risk Drivers Radar"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? "تحليل شامل لمحركات المخاطر الرئيسية"
            : "Comprehensive analysis of key risk drivers"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              
              {companies.map((company, idx) => (
                <Radar
                  key={company.name}
                  name={company.name}
                  dataKey={`company${idx}`}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}
              
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default { IVIRadarChart, IVIBridgeDiagram, RiskDriversRadar };
