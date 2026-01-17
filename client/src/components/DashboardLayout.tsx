import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, LayoutDashboard, LogOut, Settings, Shield, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Predictions', href: '/predictions', icon: Activity },
    { name: 'Smart Pre-Auth', href: '/pre-auth', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <Activity className="h-8 w-8" />
              <span>IVI Dashboard</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            location === item.href
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
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
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Admin Section */}
              {user?.role === 'admin' && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-sidebar-foreground/60 uppercase tracking-wider">
                    Administration
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <Link href={item.href}>
                          <a
                            className={cn(
                              location === item.href
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
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
                          </a>
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
                      <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
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
                        className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.location.href = getLoginUrl()}
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
