"use client"

import * as React from "react"
import { Table, Settings, Shield, LogOut, FileText, RefreshCw, ExternalLink } from "lucide-react"
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
import { ApiClient, type TableMetadata, type Admin, type AppSettings } from "@/lib/api"
import { DatabaseSection } from "./database/database-section"
import { AdminsSection } from "./admins/admins-section"
import { SettingsSection } from "./settings/settings-section"
import { LogsSection } from "./logs/logs-section"
import { SyncSection } from "./sync/sync-section"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "./theme-toggle"

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("tables")
  const [tables, setTables] = React.useState<TableMetadata[]>([])
  const [admins, setAdmins] = React.useState<Admin[]>([])
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()
  const [settings, setSettings] = React.useState<AppSettings | null>(null)

  const showError = React.useCallback(
    (error: string, type: "error" | "warning" = "error") => {
      toast({
        variant: type === "error" ? "destructive" : "default",
        title: type === "error" ? "Error" : "Warning",
        description: error,
      })
    },
    [toast],
  )

  const apiClient = React.useMemo(() => new ApiClient(token, onLogout, showError), [token, onLogout, showError])

  React.useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tablesData, adminsData, settingsData] = await Promise.all([
        apiClient.call<TableMetadata[]>("/api/v1/tables"),
        apiClient.call<Admin[]>("/api/v1/admins"),
        apiClient.call<AppSettings>("/api/v1/settings"),
      ])

      setTables(tablesData)
      setAdmins(adminsData)
      setSettings(settingsData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    onLogout()
  }

  const sidebarItems = [
    {
      title: "Tables",
      icon: Table,
      id: "tables",
    },
    {
      title: "Admins",
      icon: Shield,
      id: "admins",
    },
    {
      title: "Logs",
      icon: FileText,
      id: "logs",
    },
    {
      title: "Sync",
      icon: RefreshCw,
      id: "sync",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ]

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
              <span className="font-semibold">Admin Dashboard</span>
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
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        className={activeSection === item.id ? "bg-accent text-accent-foreground" : ""}
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
                {activeSection === "tables" && (
                  <DatabaseSection apiClient={apiClient} tables={tables} onTablesUpdate={setTables} />
                )}
                {activeSection === "admins" && (
                  <AdminsSection admins={admins} apiClient={apiClient} onAdminsUpdate={setAdmins} />
                )}
                {activeSection === "logs" && <LogsSection />}
                {activeSection === "sync" && <SyncSection />}
                {activeSection === "settings" && (
                  <SettingsSection apiClient={apiClient} settings={settings} onSettingsUpdate={setSettings} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
