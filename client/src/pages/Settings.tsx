import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, Globe, Layout, Loader2, Moon, RotateCcw, Save, Settings as SettingsIcon, Sun, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  // Fetch user settings
  const { data: settings, isLoading } = trpc.userSettings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Local state for form
  const [language, setLanguage] = useState<"ar" | "en">("en");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [displayDensity, setDisplayDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [riskAlertNotifications, setRiskAlertNotifications] = useState(true);
  const [dailySummaryNotifications, setDailySummaryNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [defaultDashboardView, setDefaultDashboardView] = useState<"overview" | "analytics" | "predictions">("overview");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showTooltips, setShowTooltips] = useState(true);
  
  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      setLanguage(settings.language);
      setTheme(settings.theme);
      setDisplayDensity(settings.displayDensity);
      setEmailNotifications(settings.emailNotifications);
      setRiskAlertNotifications(settings.riskAlertNotifications);
      setDailySummaryNotifications(settings.dailySummaryNotifications);
      setNotificationSound(settings.notificationSound);
      setDefaultDashboardView(settings.defaultDashboardView);
      setItemsPerPage(settings.itemsPerPage);
      setShowTooltips(settings.showTooltips);
    }
  }, [settings]);
  
  // Mutations
  const updateSettings = trpc.userSettings.update.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate();
      toast.success("Settings saved successfully");
      
      // Apply theme change immediately
      applyTheme(theme);
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
  
  const resetSettings = trpc.userSettings.reset.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate();
      toast.success("Settings reset to defaults");
      
      // Reset local state
      setLanguage("en");
      setTheme("system");
      setDisplayDensity("comfortable");
      setEmailNotifications(true);
      setRiskAlertNotifications(true);
      setDailySummaryNotifications(false);
      setNotificationSound(true);
      setDefaultDashboardView("overview");
      setItemsPerPage(10);
      setShowTooltips(true);
      
      applyTheme("system");
    },
    onError: (error) => {
      toast.error(`Failed to reset settings: ${error.message}`);
    },
  });
  
  // Apply theme to document
  const applyTheme = (selectedTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    
    if (selectedTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemPrefersDark);
    } else {
      root.classList.toggle("dark", selectedTheme === "dark");
    }
  };
  
  const handleSave = () => {
    updateSettings.mutate({
      language,
      theme,
      displayDensity,
      emailNotifications,
      riskAlertNotifications,
      dailySummaryNotifications,
      notificationSound,
      defaultDashboardView,
      itemsPerPage,
      showTooltips,
    });
  };
  
  const handleReset = () => {
    resetSettings.mutate();
  };
  
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Sign in Required</CardTitle>
              <CardDescription>
                Please sign in to access your settings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your dashboard experience
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetSettings.isPending}
            >
              {resetSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="appearance">
              <Layout className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <SettingsIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
                <CardDescription>
                  Choose your preferred language for the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select the display language
                    </p>
                  </div>
                  <Select value={language} onValueChange={(v: "ar" | "en") => setLanguage(v)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Theme
                </CardTitle>
                <CardDescription>
                  Customize the visual appearance of the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Color Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between light, dark, or system theme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={(v: "light" | "dark" | "system") => setTheme(v)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <SettingsIcon className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Display Density</Label>
                    <p className="text-sm text-muted-foreground">
                      Adjust the spacing and size of elements
                    </p>
                  </div>
                  <Select value={displayDensity} onValueChange={(v: "compact" | "comfortable" | "spacious") => setDisplayDensity(v)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Risk Alert Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when client risk levels change
                    </p>
                  </div>
                  <Switch
                    checked={riskAlertNotifications}
                    onCheckedChange={setRiskAlertNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of portfolio activity
                    </p>
                  </div>
                  <Switch
                    checked={dailySummaryNotifications}
                    onCheckedChange={setDailySummaryNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Notification Sound
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when new notifications arrive
                    </p>
                  </div>
                  <Switch
                    checked={notificationSound}
                    onCheckedChange={setNotificationSound}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Dashboard Preferences
                </CardTitle>
                <CardDescription>
                  Customize your default dashboard behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Default View</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose the default page when opening the dashboard
                    </p>
                  </div>
                  <Select value={defaultDashboardView} onValueChange={(v: "overview" | "analytics" | "predictions") => setDefaultDashboardView(v)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Executive Overview</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="predictions">Predictions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Items Per Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Number of items to display in tables
                    </p>
                  </div>
                  <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 items</SelectItem>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="25">25 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Tooltips</Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tooltips throughout the dashboard
                    </p>
                  </div>
                  <Switch
                    checked={showTooltips}
                    onCheckedChange={setShowTooltips}
                  />
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{user?.name || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{user?.email || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="font-medium capitalize">{user?.role || "User"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Login Method</Label>
                    <p className="font-medium capitalize">{user?.loginMethod || "OAuth"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
