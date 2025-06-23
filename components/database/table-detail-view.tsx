"use client"

import * as React from "react"
import { Cog, FileText, ChevronDown, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ApiClient, TableMetadata } from "@/lib/api"

interface TableDetailViewProps {
  table: TableMetadata
  onBack: () => void
  apiClient: ApiClient
  onTableUpdate: (table: TableMetadata) => void
}

export function TableDetailView({ table, onBack, apiClient, onTableUpdate }: TableDetailViewProps) {
  const [activeTab, setActiveTab] = React.useState("schema")
  const [rules, setRules] = React.useState(table.rules)
  const [isLoading, setIsLoading] = React.useState(false)
  const [tableData, setTableData] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  React.useEffect(() => {
    loadTableData()
  }, [currentPage])

  const loadTableData = async () => {
    try {
      // Mock table data with pagination
      const mockData = Array.from({ length: 5 }, (_, i) => {
        const id = `${currentPage}-${i + 1}`
        const baseData: any = { id }

        table.fields?.forEach((field) => {
          if (field.name === "id") return
          if (field.name === "created" || field.name === "updated") {
            baseData[field.name] = new Date().toISOString()
          } else if (field.name === "email") {
            baseData[field.name] = `user${id}@example.com`
          } else if (field.name === "password") {
            baseData[field.name] = "••••••••"
          } else {
            baseData[field.name] = `Sample ${field.name} ${id}`
          }
        })

        return baseData
      })

      setTableData(mockData)
      setTotalPages(3) // Mock pagination
    } catch (error) {
      console.error("Failed to load table data:", error)
    }
  }

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
            <p className="text-muted-foreground">Manage table configuration and data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "schema" ? "default" : "ghost"}
            onClick={() => setActiveTab("schema")}
            className="flex items-center gap-2"
          >
            <Cog className="h-4 w-4" />
            Schema
          </Button>
          <Button
            variant={activeTab === "rules" ? "default" : "ghost"}
            onClick={() => setActiveTab("rules")}
            className="flex items-center gap-2"
          >
            <Cog className="h-4 w-4" />
            Access Rules
          </Button>
          <Button
            variant={activeTab === "docs" ? "default" : "ghost"}
            onClick={() => setActiveTab("docs")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            API Docs
          </Button>
        </div>
      </div>

      {activeTab === "schema" && (
        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Table Data</CardTitle>
              <CardDescription>Current records in the table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {table.fields?.map((field) => (
                        <TableHead key={field.name}>{field.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <TableRow key={index}>
                          {table.fields?.map((field) => (
                            <TableCell key={field.name}>{row[field.name] || "-"}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={table.fields?.length || 1} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "rules" && (
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
                <ApiEndpointCard
                  method="GET"
                  endpoint={`/api/v1/tables/${table.name}`}
                  description={`List all records in the ${table.name} table`}
                  table={table}
                  operation="list"
                />

                <ApiEndpointCard
                  method="GET"
                  endpoint={`/api/v1/tables/${table.name}/{id}`}
                  description="Get a specific record by ID"
                  table={table}
                  operation="get"
                />

                {table.type !== "view" && (
                  <>
                    <ApiEndpointCard
                      method="POST"
                      endpoint={`/api/v1/tables/${table.name}`}
                      description="Create a new record"
                      table={table}
                      operation="create"
                    />

                    <ApiEndpointCard
                      method="PATCH"
                      endpoint={`/api/v1/tables/${table.name}/{id}`}
                      description="Update a specific record"
                      table={table}
                      operation="update"
                    />

                    <ApiEndpointCard
                      method="DELETE"
                      endpoint={`/api/v1/tables/${table.name}/{id}`}
                      description="Delete a specific record"
                      table={table}
                      operation="delete"
                    />
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

function ApiEndpointCard({
  method,
  endpoint,
  description,
  table,
  operation,
}: {
  method: string
  endpoint: string
  description: string
  table: TableMetadata
  operation: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800"
      case "POST":
        return "bg-blue-100 text-blue-800"
      case "PATCH":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generateRequestExample = () => {
    const baseUrl = "https://your-api.com"
    let example = `curl -X ${method} "${baseUrl}${endpoint}"`

    if (method !== "GET") {
      example += ` \\\n  -H "Content-Type: application/json"`
    }

    example += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`

    if (operation === "create" || operation === "update") {
      const sampleData: any = {}
      table.fields?.forEach((field) => {
        if (field.name === "id" || field.name === "created" || field.name === "updated") return
        if (field.name === "email") {
          sampleData[field.name] = "user@example.com"
        } else if (field.name === "password") {
          sampleData[field.name] = "securepassword"
        } else {
          sampleData[field.name] = `sample_${field.name}`
        }
      })

      example += ` \\\n  -d '${JSON.stringify(sampleData, null, 2)}'`
    }

    return example
  }

  const generateResponseExample = () => {
    if (operation === "list") {
      const sampleRecord: any = {}
      table.fields?.forEach((field) => {
        if (field.name === "id") {
          sampleRecord[field.name] = "123e4567-e89b-12d3-a456-426614174000"
        } else if (field.name === "created" || field.name === "updated") {
          sampleRecord[field.name] = "2024-01-15T10:00:00Z"
        } else if (field.name === "email") {
          sampleRecord[field.name] = "user@example.com"
        } else if (field.name === "password") {
          return // Don't include password in response
        } else {
          sampleRecord[field.name] = `sample_${field.name}`
        }
      })

      return JSON.stringify(
        {
          data: [sampleRecord],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
        null,
        2,
      )
    }

    if (operation === "delete") {
      return JSON.stringify({ success: true }, null, 2)
    }

    // Single record response
    const sampleRecord: any = {}
    table.fields?.forEach((field) => {
      if (field.name === "id") {
        sampleRecord[field.name] = "123e4567-e89b-12d3-a456-426614174000"
      } else if (field.name === "created" || field.name === "updated") {
        sampleRecord[field.name] = "2024-01-15T10:00:00Z"
      } else if (field.name === "email") {
        sampleRecord[field.name] = "user@example.com"
      } else if (field.name === "password") {
        return // Don't include password in response
      } else {
        sampleRecord[field.name] = `sample_${field.name}`
      }
    })

    return JSON.stringify(sampleRecord, null, 2)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getMethodColor(method)}>{method}</Badge>
              <code className="text-sm">{endpoint}</code>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-l-2 border-muted ml-4 pl-4 space-y-4">
          <div>
            <h5 className="font-medium mb-2">Request Example</h5>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{generateRequestExample()}</code>
            </pre>
          </div>

          <div>
            <h5 className="font-medium mb-2">Response Example</h5>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{generateResponseExample()}</code>
            </pre>
          </div>

          <div>
            <h5 className="font-medium mb-2">Possible Errors</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">400</Badge>
                <span>Bad Request - Invalid input data</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">401</Badge>
                <span>Unauthorized - Invalid or missing token</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">403</Badge>
                <span>Forbidden - Access denied by rules</span>
              </div>
              {(operation === "get" || operation === "update" || operation === "delete") && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">404</Badge>
                  <span>Not Found - Record does not exist</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="destructive">500</Badge>
                <span>Internal Server Error - Server error</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
