import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  X,
  CheckCircle,
  Info,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export interface KPIAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'ivi_drop' | 'risk_change' | 'retention' | 'threshold' | 'improvement';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  value?: number;
  previousValue?: number;
  threshold?: number;
  companyName?: string;
  timestamp: Date;
  isRead: boolean;
}

interface KPINotificationsProps {
  alerts: KPIAlert[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  onRefresh?: () => void;
  className?: string;
}

// Generate sample alerts based on KPI data
export function generateKPIAlerts(data: {
  avgIVI: number;
  previousIVI?: number;
  highRiskCount: number;
  previousHighRisk?: number;
  retentionRate: number;
  companies?: Array<{ name: string; iviScore: number; riskCategory: string; previousRisk?: string }>;
}): KPIAlert[] {
  const alerts: KPIAlert[] = [];
  const now = new Date();

  // Check for IVI drop
  if (data.previousIVI && data.avgIVI < data.previousIVI) {
    const drop = ((data.previousIVI - data.avgIVI) / data.previousIVI * 100).toFixed(1);
    if (Number(drop) > 5) {
      alerts.push({
        id: `ivi-drop-${now.getTime()}`,
        type: 'critical',
        category: 'ivi_drop',
        title: 'Significant IVI Drop Detected',
        titleAr: 'انخفاض كبير في IVI',
        message: `Average IVI dropped by ${drop}% from ${data.previousIVI.toFixed(1)} to ${data.avgIVI.toFixed(1)}`,
        messageAr: `انخفض متوسط IVI بنسبة ${drop}% من ${data.previousIVI.toFixed(1)} إلى ${data.avgIVI.toFixed(1)}`,
        value: data.avgIVI,
        previousValue: data.previousIVI,
        timestamp: now,
        isRead: false
      });
    }
  }

  // Check for high risk increase
  if (data.previousHighRisk && data.highRiskCount > data.previousHighRisk) {
    const increase = data.highRiskCount - data.previousHighRisk;
    alerts.push({
      id: `risk-increase-${now.getTime()}`,
      type: 'warning',
      category: 'risk_change',
      title: 'High Risk Companies Increased',
      titleAr: 'زيادة في الشركات عالية المخاطر',
      message: `${increase} more companies moved to high risk category`,
      messageAr: `${increase} شركات إضافية انتقلت إلى فئة المخاطر العالية`,
      value: data.highRiskCount,
      previousValue: data.previousHighRisk,
      timestamp: new Date(now.getTime() - 300000),
      isRead: false
    });
  }

  // Check retention rate threshold
  if (data.retentionRate < 80) {
    alerts.push({
      id: `retention-${now.getTime()}`,
      type: 'warning',
      category: 'retention',
      title: 'Retention Rate Below Target',
      titleAr: 'معدل الاحتفاظ أقل من المستهدف',
      message: `Current retention rate (${data.retentionRate.toFixed(1)}%) is below the 80% target`,
      messageAr: `معدل الاحتفاظ الحالي (${data.retentionRate.toFixed(1)}%) أقل من المستهدف 80%`,
      value: data.retentionRate,
      threshold: 80,
      timestamp: new Date(now.getTime() - 600000),
      isRead: false
    });
  }

  // Check individual company risk changes
  if (data.companies) {
    data.companies.forEach((company, idx) => {
      if (company.previousRisk && company.previousRisk !== company.riskCategory) {
        if (company.riskCategory === 'High' && company.previousRisk !== 'High') {
          alerts.push({
            id: `company-risk-${company.name}-${now.getTime()}-${idx}`,
            type: 'critical',
            category: 'risk_change',
            title: 'Company Risk Escalation',
            titleAr: 'تصعيد مخاطر شركة',
            message: `${company.name} moved from ${company.previousRisk} to High risk`,
            messageAr: `${company.name} انتقلت من ${company.previousRisk === 'Low' ? 'منخفض' : 'متوسط'} إلى مخاطر عالية`,
            companyName: company.name,
            value: company.iviScore,
            timestamp: new Date(now.getTime() - (idx * 120000)),
            isRead: false
          });
        }
      }
    });
  }

  // Add improvement alert if IVI increased
  if (data.previousIVI && data.avgIVI > data.previousIVI) {
    const improvement = ((data.avgIVI - data.previousIVI) / data.previousIVI * 100).toFixed(1);
    if (Number(improvement) > 2) {
      alerts.push({
        id: `ivi-improvement-${now.getTime()}`,
        type: 'success',
        category: 'improvement',
        title: 'IVI Improvement Detected',
        titleAr: 'تحسن في IVI',
        message: `Average IVI improved by ${improvement}% to ${data.avgIVI.toFixed(1)}`,
        messageAr: `تحسن متوسط IVI بنسبة ${improvement}% إلى ${data.avgIVI.toFixed(1)}`,
        value: data.avgIVI,
        previousValue: data.previousIVI,
        timestamp: new Date(now.getTime() - 900000),
        isRead: false
      });
    }
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default function KPINotifications({
  alerts,
  onDismiss,
  onDismissAll,
  onRefresh,
  className
}: KPINotificationsProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [localAlerts, setLocalAlerts] = useState<KPIAlert[]>(alerts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  // Show toast for new critical alerts
  useEffect(() => {
    const criticalAlerts = localAlerts.filter(a => a.type === 'critical' && !a.isRead);
    criticalAlerts.forEach(alert => {
      toast.error(isRTL ? alert.titleAr : alert.title, {
        description: isRTL ? alert.messageAr : alert.message,
        duration: 5000,
      });
    });
  }, [localAlerts, isRTL]);

  const handleDismiss = (id: string) => {
    setLocalAlerts(prev => prev.filter(a => a.id !== id));
    onDismiss?.(id);
  };

  const handleDismissAll = () => {
    setLocalAlerts([]);
    onDismissAll?.();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getAlertIcon = (type: KPIAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: KPIAlert['type']) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">{isRTL ? 'حرج' : 'Critical'}</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">{isRTL ? 'تحذير' : 'Warning'}</Badge>;
      case 'success':
        return <Badge className="bg-green-500">{isRTL ? 'تحسن' : 'Improved'}</Badge>;
      default:
        return <Badge variant="secondary">{isRTL ? 'معلومات' : 'Info'}</Badge>;
    }
  };

  const getCategoryIcon = (category: KPIAlert['category']) => {
    switch (category) {
      case 'ivi_drop':
        return <TrendingDown className="h-4 w-4" />;
      case 'improvement':
        return <TrendingUp className="h-4 w-4" />;
      case 'risk_change':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return isRTL ? 'الآن' : 'Just now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = localAlerts.filter(a => !a.isRead).length;
  const criticalCount = localAlerts.filter(a => a.type === 'critical').length;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {isRTL ? 'تنبيهات KPI الفورية' : 'Real-time KPI Alerts'}
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalCount} {isRTL ? 'حرج' : 'Critical'}
              </Badge>
            )}
          </CardTitle>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            {localAlerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissAll}
              >
                {isRTL ? 'مسح الكل' : 'Clear All'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>{isRTL ? 'لا توجد تنبيهات جديدة' : 'No new alerts'}</p>
            <p className="text-sm mt-1">
              {isRTL ? 'جميع المؤشرات ضمن النطاق الطبيعي' : 'All KPIs are within normal range'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {localAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    alert.type === 'critical' && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                    alert.type === 'warning' && "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
                    alert.type === 'success' && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    alert.type === 'info' && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
                    !alert.isRead && "ring-2 ring-offset-1",
                    alert.type === 'critical' && !alert.isRead && "ring-red-500",
                    alert.type === 'warning' && !alert.isRead && "ring-amber-500"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                      {getAlertIcon(alert.type)}
                      <div className={cn(isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                          <span className="font-semibold text-sm">
                            {isRTL ? alert.titleAr : alert.title}
                          </span>
                          {getAlertBadge(alert.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? alert.messageAr : alert.message}
                        </p>
                        <div className={cn("flex items-center gap-2 mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                          {getCategoryIcon(alert.category)}
                          <span>{formatTime(alert.timestamp)}</span>
                          {alert.value !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-medium">
                                {alert.previousValue !== undefined && (
                                  <span className="line-through mr-1">{alert.previousValue.toFixed(1)}</span>
                                )}
                                {alert.value.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
