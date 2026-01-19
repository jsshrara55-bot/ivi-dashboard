import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, Database, GitCompare, Layers, LayoutDashboard, LogOut, Settings, Shield, ShieldCheck, Users, Upload, Bell, Menu, ClipboardCheck, FileText, Calculator, Building2, Building, Hospital } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";
import { LanguageToggle } from "./LanguageToggle";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: t('common.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('common.clients'), href: '/clients', icon: Users },
    { name: t('common.analytics'), href: '/analytics', icon: BarChart3 },
    { name: t('common.predictions'), href: '/predictions', icon: Activity },
    { name: t('common.smartPreAuth'), href: '/pre-auth', icon: ShieldCheck },
    { name: t('common.dataExplorer'), href: '/data-explorer', icon: Database },
    { name: t('common.settings'), href: '/settings', icon: Settings },
    { name: t('common.evaluation'), href: '/evaluation', icon: ClipboardCheck },
    { name: t('common.pdf') + ' ' + (isRTL ? 'تقرير' : 'Report'), href: '/pdf-report', icon: FileText },
    { name: isRTL ? 'مقارنة الشركات' : 'Compare', href: '/compare', icon: GitCompare },
    { name: isRTL ? 'السيناريوهات' : 'Scenarios', href: '/scenarios', icon: Layers },
    { name: isRTL ? 'حاسبة ROI' : 'ROI Calculator', href: '/roi-calculator', icon: Calculator },
    { name: isRTL ? 'الشركات الصغيرة' : 'SME Clients', href: '/sme-clients', icon: Building2 },
    { name: isRTL ? 'الشركات الكبيرة' : 'Key Accounts', href: '/key-accounts', icon: Building },
    { name: isRTL ? 'مقدمو الخدمات' : 'Providers', href: '/providers', icon: Hospital },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: t('common.adminPanel'), href: '/admin', icon: Shield },
    { name: t('common.dataLoader'), href: '/data-loader', icon: Upload },
    { name: t('common.riskAlerts'), href: '/risk-alerts', icon: Bell },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Sidebar content component to reuse in both desktop and mobile
  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    location === item.href
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                    isRTL && 'flex-row-reverse text-right'
                  )}
                >
                  <item.icon
                    className={cn(
                      location === item.href ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* Admin Section - Visible to all authenticated users */}
        {isAuthenticated && (
          <li>
            <div className={cn(
              "text-xs font-semibold leading-6 text-sidebar-foreground/60 uppercase tracking-wider",
              isRTL && "text-right"
            )}>
              {t('common.administration')}
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      location === item.href
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                      isRTL && 'flex-row-reverse text-right'
                    )}
                  >
                    <item.icon
                      className={cn(
                        location === item.href ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground',
                        'h-6 w-6 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* User Section */}
        <li className="mt-auto">
          <div className="border-t border-sidebar-border pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className={cn("flex items-center gap-3 px-2", isRTL && "flex-row-reverse")}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full text-sidebar-foreground/80 hover:text-sidebar-foreground",
                    isRTL ? "justify-end flex-row-reverse" : "justify-start"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('common.signOut')}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = getLoginUrl()}
              >
                {t('common.signIn')}
              </Button>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col",
        isRTL ? "lg:right-0" : "lg:left-0"
      )}>
        <div className={cn(
          "flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4",
          isRTL ? "border-l border-sidebar-border" : "border-r border-sidebar-border"
        )}>
          <div className={cn("flex h-16 shrink-0 items-center", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2 font-bold text-xl text-primary", isRTL && "flex-row-reverse")}>
              <Activity className="h-8 w-8" />
              <span>{isRTL ? 'لوحة IVI' : 'IVI Dashboard'}</span>
            </div>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar using Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0 bg-sidebar border-sidebar-border">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 h-full">
            <div className={cn("flex h-16 shrink-0 items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2 font-bold text-xl text-primary", isRTL && "flex-row-reverse")}>
                <Activity className="h-8 w-8" />
                <span>{isRTL ? 'لوحة IVI' : 'IVI Dashboard'}</span>
              </div>
            </div>
            <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className={cn(isRTL ? "lg:pr-72" : "lg:pl-72")}>
        {/* Top header with notifications */}
        <header className={cn(
          "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex flex-1 gap-x-4 self-stretch lg:gap-x-6", isRTL && "flex-row-reverse")}>
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-foreground"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
            
            {/* Mobile logo */}
            <div className="flex items-center lg:hidden">
              <div className={cn("flex items-center gap-2 font-bold text-lg text-primary", isRTL && "flex-row-reverse")}>
                <Activity className="h-6 w-6" />
                <span className="hidden sm:inline">{isRTL ? 'لوحة IVI' : 'IVI Dashboard'}</span>
              </div>
            </div>
            
            <div className="flex flex-1"></div>
            <div className={cn("flex items-center gap-x-4 lg:gap-x-6", isRTL && "flex-row-reverse")}>
              {/* Language Toggle */}
              <LanguageToggle />
              
              {/* Notification Bell */}
              {isAuthenticated && <NotificationBell />}
              
              {/* Mobile user info */}
              <div className="lg:hidden flex items-center gap-2">
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = getLoginUrl()}>
                    {t('common.signIn')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="py-6 sm:py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position={isRTL ? "top-right" : "top-left"} richColors closeButton />
    </div>
  );
}
