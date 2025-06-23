"use client"

import * as React from "react"
import { Plus, Trash2, Cog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApiClient, TableMetadata } from "@/lib/api"

interface TableConfigDrawerProps {
  table: TableMetadata
  apiClient: ApiClient
  open: boolean
  onClose: () => void
  onTableUpdate: (table: TableMetadata) => void
}

export function TableConfigDrawer({ table, apiClient, open, onClose, onTableUpdate }: TableConfigDrawerProps) {
  const [columns, setColumns] = React.useState(table.fields || [])
  const [rules, setRules] = React.useState(table.rules)
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("schema")

  React.useEffect(() => {
    if (open) {
      setColumns(table.fields || [])
      setRules(table.rules)
    }
  }, [open, table])

  const dataTypes = [
    "string",
    "int",
    "bigint",
    "double",
    "float",
    "boolean",
    "date",
    "datetime",
    "timestamp",
    "json",
    "xml",
    "text",
    "varchar",
    "char",
    "binary",
    "uuid",
  ]

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "string", primaryKey: false, nullable: true }])
  }

  const removeColumn = (index: number) => {
    const column = columns[index]
    const isSystemColumn = ["id", "created", "updated", "email", "password"].includes(column.name)
    if (columns.length > 1 && !isSystemColumn) {
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  const updateColumn = (index: number, field: string, value: any) => {
    const updatedColumns = columns.map((col, i) => (i === index ? { ...col, [field]: value } : col))
    setColumns(updatedColumns)
  }

  const handleSaveSchema = async () => {
    setIsLoading(true)
    try {
      const updatedTable = await apiClient.call<TableMetadata>(`/api/v1/tables/${table.id}`, {
        method: "PATCH",
        body: JSON.stringify({ fields: columns }),
      })
      onTableUpdate(updatedTable)
    } catch (error) {
      console.error("Failed to update schema:", error)
    } finally {
      setIsLoading(false)
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

  const isSystemColumn = (columnName: string) => {
    return ["id", "created", "updated", "email", "password"].includes(columnName)
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            Configure {table.name} Table
          </DrawerTitle>
          <DrawerDescription>Manage table schema and access control rules</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="rules">Access Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="schema" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Table Structure</h4>
                  <p className="text-sm text-muted-foreground">Modify columns and their properties</p>
                </div>
                {table.type !== "view" && (
                  <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                )}
              </div>

              {table.type === "view" ? (
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">SQL Query</h5>
                  <pre className="text-sm overflow-x-auto">
                    <code>{table.sql}</code>
                  </pre>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {columns.map((column, index) => {
                    const isSystem = isSystemColumn(column.name)
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 border rounded-lg ${isSystem ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Column name"
                              value={column.name}
                              onChange={(e) => updateColumn(index, "name", e.target.value)}
                              disabled={isSystem}
                              className={isSystem ? "bg-muted" : ""}
                            />
                            {isSystem && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="w-32">
                          <Select
                            value={column.type}
                            onValueChange={(value) => updateColumn(index, "type", value)}
                            disabled={isSystem}
                          >
                            <SelectTrigger className={isSystem ? "bg-muted" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dataTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`primary-${index}`}
                              checked={column.primaryKey}
                              onChange={(e) => updateColumn(index, "primaryKey", e.target.checked)}
                              disabled={isSystem}
                              className="rounded"
                            />
                            <Label htmlFor={`primary-${index}`} className="text-xs">
                              PK
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`unique-${index}`}
                              checked={column.unique || false}
                              onChange={(e) => updateColumn(index, "unique", e.target.checked)}
                              disabled={isSystem}
                              className="rounded"
                            />
                            <Label htmlFor={`unique-${index}`} className="text-xs">
                              Unique
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={!column.nullable}
                              onChange={(e) => updateColumn(index, "nullable", !e.target.checked)}
                              disabled={isSystem}
                              className="rounded"
                            />
                            <Label htmlFor={`required-${index}`} className="text-xs">
                              Required
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`files-${index}`}
                              checked={column.isFile || false}
                              onChange={(e) => updateColumn(index, "isFile", e.target.checked)}
                              disabled={isSystem}
                              className="rounded"
                            />
                            <Label htmlFor={`files-${index}`} className="text-xs">
                              Files
                            </Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(index)}
                          disabled={columns.length === 1 || isSystem}
                          className={isSystem ? "opacity-30" : ""}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {table.type !== "view" && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    <Badge variant="outline" className="text-xs mr-2">
                      System
                    </Badge>
                    System columns are automatically managed and cannot be modified.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rules" className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-4">Access Control Rules</h4>
                <div className="space-y-4">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={activeTab === "schema" ? handleSaveSchema : handleSaveRules}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : `Save ${activeTab === "schema" ? "Schema" : "Rules"}`}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
