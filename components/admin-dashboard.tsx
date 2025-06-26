"use client"

import * as React from "react"
import { Table, Settings, Shield, LogOut, FileText, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiClient, type TableMetadata, type Admin, type AppSettings } from "@/lib/api"
import { DatabaseSection } from "./database/database-section"
import { AdminsSection } from "./admins/admins-section"
import { SettingsSection } from "./settings/settings-section"
import { LogsSection } from "./logs/logs-section"
import { SyncSection } from "./sync/sync-section"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "./theme-toggle"
import { useRouter } from "@/lib/router"
import { useAppState, type AppMode } from "@/lib/app-state"

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [mounted, setMounted] = React.useState(false)
  const [tables, setTables] = React.useState<TableMetadata[]>([])
  const [admins, setAdmins] = React.useState<Admin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [settings, setSettings] = React.useState<AppSettings | null>(null)
  const [authErrorDialog, setAuthErrorDialog] = React.useState(false)
  const { toast } = useToast()
  const { route, navigate } = useRouter()
  const { mode } = useAppState()

  const showError = React.useCallback(
    (error: string, type: "error" | "warning" = "error") => {
      try {
        // Prevent error loops by checking if error is already being shown
        if (error.includes("Unauthorized") || error.includes("auth")) {
          return // Don't show toast for auth errors, handle with dialog
        }

        toast({
          variant: type === "error" ? "destructive" : "default",
          title: type === "error" ? "Error" : "Warning",
          description: error,
        })
      } catch (toastError) {
        console.warn("Failed to show error toast:", toastError)
      }
    },
    [toast],
  )

  const handleUnauthorized = React.useCallback(() => {
    try {
      setAuthErrorDialog(true)
    } catch (error) {
      console.warn("Failed to handle unauthorized:", error)
    }
  }, [])

  const [apiClient, setApiClient] = React.useState(
    () => new ApiClient(token, handleUnauthorized, mode, settings?.baseUrl, showError),
  )

  React.useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  // Update API client when mode or settings change
  React.useEffect(() => {
    const newApiClient = new ApiClient(token, handleUnauthorized, mode, settings?.baseUrl, showError)
    setApiClient(newApiClient)
  }, [mode, settings?.baseUrl, token, handleUnauthorized, showError])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log("Loading dashboard data...")

      const [tablesData, adminsData, settingsData] = await Promise.all([
        apiClient.call<TableMetadata[]>("/api/v1/tables"),
        apiClient.call<Admin[]>("/api/v1/admins"),
        apiClient.call<AppSettings>("/api/v1/settings"),
      ])

      console.log("Data loaded:", { tablesData, adminsData, settingsData })

      setTables(tablesData)
      setAdmins(adminsData)
      setSettings(settingsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      // Set default settings if loading fails
      setSettings({
        appName: "Mantis Admin",
        baseUrl: "https://api.example.com",
        version: "1.2.3",
        maintenanceMode: false,
        maxFileSize: "10MB",
        allowRegistration: true,
        emailVerificationRequired: false,
        sessionTimeout: 3600,
        mode: mode,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("admin_token")
      onLogout()
    } catch (error) {
      console.warn("Failed to logout:", error)
    }
  }

  const handleAuthErrorLogin = () => {
    try {
      setAuthErrorDialog(false)
      handleLogout()
    } catch (error) {
      console.warn("Failed to handle auth error login:", error)
    }
  }

  const handleModeChange = (newMode: AppMode, baseUrl?: string) => {
    // Update API client with new mode and base URL
    const newApiClient = new ApiClient(token, handleUnauthorized, newMode, baseUrl, showError)
    setApiClient(newApiClient)

    // Reload data with new mode
    loadData()
  }

  const sidebarItems = [
    {
      title: "Tables",
      icon: Table,
      id: "tables",
      path: "/tables",
    },
    {
      title: "Admins",
      icon: Shield,
      id: "admins",
      path: "/admins",
    },
    {
      title: "Logs",
      icon: FileText,
      id: "logs",
      path: "/logs",
    },
    {
      title: "Sync",
      icon: RefreshCw,
      id: "sync",
      path: "/sync",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
      path: "/settings",
    },
  ]

  // Extract the section from the route path safely
  const getCurrentSection = () => {
    try {
      const pathParts = route.path.split("/").filter(Boolean)
      return pathParts[0] || "tables"
    } catch (error) {
      console.warn("Error parsing route:", error)
      return "tables"
    }
  }

  const currentSection = getCurrentSection()

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">Mantis Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          try {
                            navigate(item.path)
                          } catch (error) {
                            console.warn("Failed to navigate:", error)
                          }
                        }}
                        isActive={currentSection === item.id}
                        className={currentSection === item.id ? "bg-accent text-accent-foreground" : ""}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              {settings && (
                <SidebarMenuItem>
                  <div className="px-4 py-2 text-xs text-muted-foreground">Version {settings.version}</div>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span>Documentation</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <main className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                {currentSection === "tables" && (
                  <DatabaseSection apiClient={apiClient} tables={tables} onTablesUpdate={setTables} />
                )}
                {currentSection === "admins" && (
                  <AdminsSection admins={admins} apiClient={apiClient} onAdminsUpdate={setAdmins} />
                )}
                {currentSection === "logs" && <LogsSection />}
                {currentSection === "sync" && <SyncSection />}
                {currentSection === "settings" && (
                  <SettingsSection
                    apiClient={apiClient}
                    settings={settings}
                    onSettingsUpdate={setSettings}
                    onModeChange={handleModeChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Auth Error Dialog */}
      <Dialog open={authErrorDialog} onOpenChange={setAuthErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Authentication Error
            </DialogTitle>
            <DialogDescription>
              Your session has expired or you don't have permission to access this resource. Please log in again to
              continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthErrorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAuthErrorLogin}>Login Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
