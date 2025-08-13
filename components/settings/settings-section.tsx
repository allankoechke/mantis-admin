"use client"

import * as React from "react"
import { RefreshCw, TestTube, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import type { ApiClient, AppSettings } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAppState, type AppMode } from "@/lib/app-state"

interface SettingsSectionProps {
  apiClient: ApiClient
  settings: AppSettings | null
  onSettingsUpdate: (settings: AppSettings) => void
  onModeChange: (mode: AppMode, baseUrl?: string) => void
}

export function SettingsSection({ apiClient, settings, onSettingsUpdate, onModeChange }: SettingsSectionProps) {
  const { toast } = useToast()
  const { mode, setMode } = useAppState()
  const [formData, setFormData] = React.useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (settings) {
      setFormData({ ...settings, mode })
      setHasChanges(false)
    }
  }, [settings, mode])

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    if (!formData) return

    setFormData({
      ...formData,
      [field]: value,
    })
    setHasChanges(true)
  }

  const handleModeToggle = (newMode: AppMode) => {
    setMode(newMode)
    if (formData) {
      setFormData({
        ...formData,
        mode: newMode,
      })
      setHasChanges(true)
    }
    onModeChange(newMode, formData?.baseUrl)
  }

  const handleSave = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      const updatedSettings = await apiClient.call<AppSettings>("/api/v1/settings/config", {
        method: "PATCH",
        body: JSON.stringify(formData),
      })

      // If the request failed, throw the error here 
      if (updatedSettings?.error?.length > 0) throw updatedSettings.error

      onSettingsUpdate(updatedSettings)
      setHasChanges(false)

      toast({
        title: "Settings Saved",
        description: "Application settings have been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const updatedSettings = await apiClient.call<AppSettings>("/api/v1/settings/config")

      // If the request failed, throw the error here 
      if (updatedSettings?.error?.length > 0) throw updatedSettings.error

      onSettingsUpdate(updatedSettings)
    } catch (error) {
      console.error("Failed to refresh settings:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show loading if we don't have formData yet
  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h2 className="text-2xl font-bold">Application Settings</h2>
            <p className="text-muted-foreground">Configure global application settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "TEST" ? "secondary" : "default"} className="flex items-center gap-1">
            {mode === "TEST" ? <TestTube className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
            {mode} MODE
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="app-name">Application Name</Label>
              <Input
                id="app-name"
                value={formData?.appName || ""}
                onChange={(e) => handleInputChange("appName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData?.mantisVersion || ""}
                disabled={true}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={formData?.baseUrl || ""}
              onChange={(e) => handleInputChange("baseUrl", e.target.value)}
              placeholder="https://your-api-domain.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              The base URL for your API endpoints{" "}
              {mode === "PROD" ? "(used in production mode)" : "(not used in test mode)"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={formData?.maxFileSize?.toString() || 10}
                onChange={(e) => handleInputChange("maxFileSize", Number.parseInt(e.target.value) || 10)}

              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={formData?.sessionTimeout?.toString() || 86400}
                onChange={(e) => handleInputChange("sessionTimeout", Number.parseInt(e.target.value) || 86400)}
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Admin Session Timeout (seconds)</Label>
              <Input
                id="admin-session-timeout"
                type="number"
                value={formData?.adminSessionTimeout?.toString() || 84000}
                onChange={(e) => handleInputChange("adminSessionTimeout", Number.parseInt(e.target.value) || 3600)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable maintenance mode for the application</p>
              </div>
              <Switch
                checked={formData?.maintenanceMode || false}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                checked={formData?.allowRegistration || false}
                onCheckedChange={(checked) => handleInputChange("allowRegistration", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={formData?.emailVerificationRequired || false}
                onCheckedChange={(checked) => handleInputChange("emailVerificationRequired", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Mode Card */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Mode</CardTitle>
          <CardDescription>Switch between test mode (cors supported) and production mode (real API calls)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all ${mode === "TEST" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
              onClick={() => handleModeToggle("TEST")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Test Mode</h4>
                    <p className="text-sm text-muted-foreground">Uses UI dev server for development</p>
                  </div>
                  {mode === "TEST" && (
                    <Badge variant="default" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${mode === "PROD" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
              onClick={() => handleModeToggle("PROD")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Production Mode</h4>
                    <p className="text-sm text-muted-foreground">API and UI running on same server.</p>
                  </div>
                  {mode === "PROD" && (
                    <Badge variant="default" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {mode === "TEST" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Testing Mode Active</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    All API calls will be made to an external API server. Ensure your API server is running and
                    accessible, and set `MANTIS_PORT` in the env settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            if (settings) {
              setFormData({ ...settings, mode })
              setHasChanges(false)
            }
          }}
          disabled={!hasChanges}
        >
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
