"use client"

import * as React from "react"
import { Cog, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { ApiClient, TableMetadata } from "@/lib/api"

interface TableDetailViewProps {
  table: TableMetadata
  onBack: () => void
  apiClient: ApiClient
  onTableUpdate: (table: TableMetadata) => void
}

export function TableDetailView({ table, onBack, apiClient, onTableUpdate }: TableDetailViewProps) {
  const [activeTab, setActiveTab] = React.useState("config")
  const [rules, setRules] = React.useState(table.rules)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSaveRules = async () => {
    setIsLoading(true)
    try {
      const updatedTable = await apiClient.call<TableMetadata>(`/api/v1/tables/${table.id}`, {
        method: "PATCH",
        body: JSON.stringify({ rules }),
      })
      onTableUpdate(updatedTable)
    } catch (error) {
      console.error("Failed to update rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{table.name} Table</h2>
            <p className="text-muted-foreground">Manage table configuration</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {[
          { id: "config", label: "Configuration", icon: Cog },
          { id: "docs", label: "API Documentation", icon: FileText },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "config" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Rules</CardTitle>
              <CardDescription>Configure access permissions using rule expressions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="list-rule">List Rule</Label>
                  <Input
                    id="list-rule"
                    placeholder='e.g., "True", "auth.id != None", ""'
                    value={rules.list}
                    onChange={(e) => setRules({ ...rules, list: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Controls who can list records</p>
                </div>

                <div>
                  <Label htmlFor="get-rule">Get Rule</Label>
                  <Input
                    id="get-rule"
                    placeholder='e.g., "True", "auth.id == record.user_id"'
                    value={rules.get}
                    onChange={(e) => setRules({ ...rules, get: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Controls who can view individual records</p>
                </div>

                {table.type !== "view" && (
                  <>
                    <div>
                      <Label htmlFor="add-rule">Add Rule</Label>
                      <Input
                        id="add-rule"
                        placeholder='e.g., "auth.id != None", "auth.role == "admin""'
                        value={rules.add}
                        onChange={(e) => setRules({ ...rules, add: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can create new records</p>
                    </div>

                    <div>
                      <Label htmlFor="update-rule">Update Rule</Label>
                      <Input
                        id="update-rule"
                        placeholder='e.g., "auth.id == record.user_id", ""'
                        value={rules.update}
                        onChange={(e) => setRules({ ...rules, update: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can update records</p>
                    </div>

                    <div>
                      <Label htmlFor="delete-rule">Delete Rule</Label>
                      <Input
                        id="delete-rule"
                        placeholder='e.g., "auth.role == "admin"", ""'
                        value={rules.delete}
                        onChange={(e) => setRules({ ...rules, delete: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can delete records</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveRules} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Rules"}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h5 className="font-medium mb-2">Rule Examples</h5>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <code>""</code> - Admin access only
                  </p>
                  <p>
                    <code>"True"</code> - Public access
                  </p>
                  <p>
                    <code>"auth.id != None"</code> - Authenticated users only
                  </p>
                  <p>
                    <code>"auth.id == record.user_id"</code> - Owner access only
                  </p>
                  <p>
                    <code>"auth.role == \"admin\""</code> - Admin role required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Structure</CardTitle>
              <CardDescription>
                {table.type === "view" ? "SQL Query" : "Table fields and their properties"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {table.type === "view" ? (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{table.sql}</code>
                </pre>
              ) : (
                <div className="space-y-2">
                  {table.fields?.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{field.name}</code>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.primaryKey && (
                          <Badge variant="default" className="text-xs">
                            PK
                          </Badge>
                        )}
                        {field.unique && (
                          <Badge variant="secondary" className="text-xs">
                            Unique
                          </Badge>
                        )}
                        {!field.nullable && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "docs" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Auto-generated API endpoints for the {table.name} table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800">GET</Badge>
                    <code className="text-sm">/api/v1/tables/{table.name}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">List all records in the {table.name} table</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800">GET</Badge>
                    <code className="text-sm">
                      /api/v1/tables/{table.name}/{"{"}id{"}"}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">Get a specific record by ID</p>
                </div>

                {table.type !== "view" && (
                  <>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">POST</Badge>
                        <code className="text-sm">/api/v1/tables/{table.name}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Create a new record</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800">PATCH</Badge>
                        <code className="text-sm">
                          /api/v1/tables/{table.name}/{"{"}id{"}"}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">Update a specific record</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                        <code className="text-sm">
                          /api/v1/tables/{table.name}/{"{"}id{"}"}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">Delete a specific record</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
