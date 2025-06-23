"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ApiClient, AppSettings } from "@/lib/api"

interface SettingsSectionProps {
  apiClient: ApiClient
  settings: AppSettings | null
  onSettingsUpdate: (settings: AppSettings) => void
}

export function SettingsSection({ apiClient, settings, onSettingsUpdate }: SettingsSectionProps) {
  const [formData, setFormData] = React.useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  React.useEffect(() => {
    if (settings) {
      setFormData({ ...settings })
      setHasChanges(false)
    }
  }, [settings])

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    if (!formData) return

    setFormData({
      ...formData,
      [field]: value,
    })
    setHasChanges(true)
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
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h2 className="text-2xl font-bold">Application Settings</h2>
          <p className="text-muted-foreground">Configure global application settings</p>
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
                value={formData.appName}
                onChange={(e) => handleInputChange("appName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              value={formData.baseUrl}
              onChange={(e) => handleInputChange("baseUrl", e.target.value)}
              placeholder="https://your-api-domain.com"
            />
            <p className="text-sm text-muted-foreground mt-1">The base URL for your API endpoints</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-file-size">Max File Size</Label>
              <Input
                id="max-file-size"
                value={formData.maxFileSize}
                onChange={(e) => handleInputChange("maxFileSize", e.target.value)}
                placeholder="10MB"
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={formData.sessionTimeout}
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
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                checked={formData.allowRegistration}
                onCheckedChange={(checked) => handleInputChange("allowRegistration", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={formData.emailVerificationRequired}
                onCheckedChange={(checked) => handleInputChange("emailVerificationRequired", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            if (settings) {
              setFormData({ ...settings })
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
