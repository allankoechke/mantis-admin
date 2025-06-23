"use client"

import * as React from "react"
import { Plus, Trash2, Cog, X } from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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
      <DrawerContent side="right" className="w-[800px] max-w-[90vw]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cog className="h-5 w-5" />
              <DrawerTitle>Configure {table.name} Table</DrawerTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription>Manage table schema and access control rules</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="rules">Access Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="schema" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium">Table Structure</h4>
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
                    <h5 className="font-medium mb-3">SQL Query</h5>
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      <code>{table.sql}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {columns.map((column, index) => {
                      const isSystem = isSystemColumn(column.name)
                      return (
                        <div key={index} className={`p-4 border rounded-lg space-y-4 ${isSystem ? "bg-muted/50" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-sm font-medium mb-2 block">Column Name</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Column name"
                                  value={column.name}
                                  onChange={(e) => updateColumn(index, "name", e.target.value)}
                                  disabled={isSystem}
                                  className={`flex-1 ${isSystem ? "bg-muted" : ""}`}
                                />
                                {isSystem && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="w-40">
                              <Label className="text-sm font-medium mb-2 block">Data Type</Label>
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
                            <div className="pt-6">
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
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`primary-${index}`}
                                checked={column.primaryKey}
                                onChange={(e) => updateColumn(index, "primaryKey", e.target.checked)}
                                disabled={isSystem}
                                className="rounded"
                              />
                              <Label htmlFor={`primary-${index}`} className="text-sm">
                                Primary Key
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
                              <Label htmlFor={`unique-${index}`} className="text-sm">
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
                              <Label htmlFor={`required-${index}`} className="text-sm">
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
                              <Label htmlFor={`files-${index}`} className="text-sm">
                                File Field
                              </Label>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {table.type !== "view" && (
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <p>
                      <Badge variant="outline" className="text-xs mr-2">
                        System
                      </Badge>
                      System columns are automatically managed and cannot be modified.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rules" className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4">Access Control Rules</h4>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="list-rule" className="text-sm font-medium">
                        List Rule
                      </Label>
                      <Textarea
                        id="list-rule"
                        placeholder='e.g., "True", "auth.id != None", ""'
                        value={rules.list}
                        onChange={(e) => setRules({ ...rules, list: e.target.value })}
                        className="mt-2"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can list records</p>
                    </div>

                    <div>
                      <Label htmlFor="get-rule" className="text-sm font-medium">
                        Get Rule
                      </Label>
                      <Textarea
                        id="get-rule"
                        placeholder='e.g., "True", "auth.id == record.user_id"'
                        value={rules.get}
                        onChange={(e) => setRules({ ...rules, get: e.target.value })}
                        className="mt-2"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can view individual records</p>
                    </div>

                    {table.type !== "view" && (
                      <>
                        <div>
                          <Label htmlFor="add-rule" className="text-sm font-medium">
                            Add Rule
                          </Label>
                          <Textarea
                            id="add-rule"
                            placeholder='e.g., "auth.id != None", "auth.role == "admin""'
                            value={rules.add}
                            onChange={(e) => setRules({ ...rules, add: e.target.value })}
                            className="mt-2"
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Controls who can create new records</p>
                        </div>

                        <div>
                          <Label htmlFor="update-rule" className="text-sm font-medium">
                            Update Rule
                          </Label>
                          <Textarea
                            id="update-rule"
                            placeholder='e.g., "auth.id == record.user_id", ""'
                            value={rules.update}
                            onChange={(e) => setRules({ ...rules, update: e.target.value })}
                            className="mt-2"
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Controls who can update records</p>
                        </div>

                        <div>
                          <Label htmlFor="delete-rule" className="text-sm font-medium">
                            Delete Rule
                          </Label>
                          <Textarea
                            id="delete-rule"
                            placeholder='e.g., "auth.role == "admin"", ""'
                            value={rules.delete}
                            onChange={(e) => setRules({ ...rules, delete: e.target.value })}
                            className="mt-2"
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Controls who can delete records</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h5 className="font-medium mb-3">Rule Examples</h5>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p>
                          <code className="bg-background px-2 py-1 rounded">""</code> - Admin access only
                        </p>
                        <p>
                          <code className="bg-background px-2 py-1 rounded">"True"</code> - Public access
                        </p>
                        <p>
                          <code className="bg-background px-2 py-1 rounded">"auth.id != None"</code> - Authenticated
                          users
                        </p>
                        <p>
                          <code className="bg-background px-2 py-1 rounded">"auth.id == record.user_id"</code> - Owner
                          only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t mt-6">
          <div className="flex gap-3">
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
