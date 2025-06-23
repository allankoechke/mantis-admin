"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Application Settings</h2>
        <p className="text-muted-foreground">Configure global application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="Admin Dashboard" />
          </div>
          <div>
            <Label htmlFor="base-url">Base URL</Label>
            <Input id="base-url" defaultValue="https://api.example.com" placeholder="https://your-api-domain.com" />
            <p className="text-sm text-muted-foreground mt-1">The base URL for your API endpoints</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Enable maintenance mode for the application</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}
