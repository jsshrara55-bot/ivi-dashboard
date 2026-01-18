import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bell, AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

interface RiskAlert {
  id: number;
  contNo: string;
  companyName: string | null;
  previousRisk: string;
  newRisk: string;
  previousScore: string | null;
  newScore: string | null;
  createdAt: Date;
  notificationSent: boolean;
}

export function NotificationBell() {
  const [lastSeenId, setLastSeenId] = useState<number>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('lastSeenAlertId');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isOpen, setIsOpen] = useState(false);

  // Query for unread count with polling
  const { data: unreadData, refetch: refetchUnread } = trpc.ivi.riskAlerts.getUnreadCount.useQuery(
    { lastSeenId },
    {
      refetchInterval: 30000, // Poll every 30 seconds
      refetchIntervalInBackground: false,
    }
  );

  // Query for recent alerts
  const { data: recentData, refetch: refetchRecent } = trpc.ivi.riskAlerts.getRecent.useQuery(
    { lastSeenId, limit: 10 },
    {
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }
  );

  // Show toast for new alerts
  useEffect(() => {
    if (recentData?.hasNew && recentData.alerts.length > 0) {
      const latestAlert = recentData.alerts[0];
      const isEscalation = latestAlert.newRisk === 'High' && latestAlert.previousRisk !== 'High';
      
      if (isEscalation) {
        toast.error(`⚠️ تنبيه مخاطر جديد: ${latestAlert.companyName}`, {
          description: `${latestAlert.previousRisk} → ${latestAlert.newRisk}`,
          duration: 5000,
        });
      } else {
        toast.info(`📊 تغيير في فئة المخاطر: ${latestAlert.companyName}`, {
          description: `${latestAlert.previousRisk} → ${latestAlert.newRisk}`,
          duration: 5000,
        });
      }
    }
  }, [recentData?.latestId]);

  // Mark alerts as seen when dropdown opens
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open && recentData?.latestId && recentData.latestId > lastSeenId) {
      const newLastSeenId = recentData.latestId;
      setLastSeenId(newLastSeenId);
      localStorage.setItem('lastSeenAlertId', newLastSeenId.toString());
    }
  }, [recentData?.latestId, lastSeenId]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    refetchUnread();
    refetchRecent();
  }, [refetchUnread, refetchRecent]);

  const unreadCount = unreadData?.count || 0;
  const alerts = recentData?.alerts || [];

  const getRiskIcon = (previousRisk: string, newRisk: string) => {
    if (newRisk === 'High' && previousRisk !== 'High') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    } else if (newRisk === 'Low' || (previousRisk === 'High' && newRisk !== 'High')) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-yellow-500" />;
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now.getTime() - alertDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return alertDate.toLocaleDateString('ar-SA');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            تنبيهات المخاطر
          </span>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-6 px-2">
            <Clock className="h-3 w-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">لا توجد تنبيهات جديدة</p>
            <p className="text-xs mt-1">آخر 24 ساعة</p>
          </div>
        ) : (
          <>
            {alerts.map((alert) => (
              <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 cursor-pointer" asChild>
                <Link href={`/client/${alert.contNo}`}>
                  <div className="flex items-start gap-3 w-full">
                    {getRiskIcon(alert.previousRisk, alert.newRisk)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {alert.companyName || `عقد ${alert.contNo}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getRiskBadgeVariant(alert.previousRisk)} className="text-xs">
                          {alert.previousRisk}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant={getRiskBadgeVariant(alert.newRisk)} className="text-xs">
                          {alert.newRisk}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link href="/risk-alerts" className="w-full text-center text-sm text-primary">
                عرض جميع التنبيهات
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
