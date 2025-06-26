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
      console.log("Settings received:", settings)
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
      const updatedSettings = await apiClient.call<AppSettings>("/api/v1/settings", {
        method: "PATCH",
        body: JSON.stringify(formData),
      })
      onSettingsUpdate(updatedSettings)
      setHasChanges(false)

      toast({
        title: "Settings Saved",
        description: "Application settings have been updated successfully.",
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
      const updatedSettings = await apiClient.call<AppSettings>("/api/v1/settings")
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

      {/* Environment Mode Card */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Mode</CardTitle>
          <CardDescription>Switch between test mode (mock data) and production mode (real API calls)</CardDescription>
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
                    <p className="text-sm text-muted-foreground">Uses mock data for development</p>
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
                    <p className="text-sm text-muted-foreground">Makes real API calls</p>
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

          {mode === "PROD" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Production Mode Active</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    All API calls will be made to the configured base URL. Ensure your API server is running and
                    accessible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                value={formData?.version || ""}
                onChange={(e) => handleInputChange("version", e.target.value)}
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
              <Label htmlFor="max-file-size">Max File Size</Label>
              <Input
                id="max-file-size"
                value={formData?.maxFileSize || ""}
                onChange={(e) => handleInputChange("maxFileSize", e.target.value)}
                placeholder="10MB"
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={formData?.sessionTimeout || 3600}
                onChange={(e) => handleInputChange("sessionTimeout", Number.parseInt(e.target.value) || 3600)}
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

      {/* Notification Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Testing</CardTitle>
          <CardDescription>Test different types of notifications and error messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="default"
              onClick={() => {
                toast({
                  title: "Info",
                  description: "This is a test info message. Everything is working correctly!",
                })
              }}
              className="w-full"
            >
              Test Info
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                toast({
                  title: "Warning",
                  description: "This is a test warning message. Please pay attention to this.",
                  variant: "default",
                })
              }}
              className="w-full"
            >
              Test Warning
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "This is a test error message. Something went wrong!",
                })
              }}
              className="w-full"
            >
              Test Error
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast({
                  variant: "destructive",
                  title: "Authentication Error",
                  description: "Your session has expired. Please log in again.",
                  action: (
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  ),
                })
              }}
              className="w-full"
            >
              Test Auth Toast
            </Button>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Use these buttons to test different notification types:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Info:</strong> General information messages
              </li>
              <li>
                <strong>Warning:</strong> Warning notifications
              </li>
              <li>
                <strong>Error:</strong> Error toast notifications
              </li>
              <li>
                <strong>Auth Error:</strong> Authentication error dialog
              </li>
            </ul>
          </div>
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
