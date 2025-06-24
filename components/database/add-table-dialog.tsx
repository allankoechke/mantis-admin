"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ApiClient, TableMetadata } from "@/lib/api"

interface AddTableDialogProps {
  apiClient: ApiClient
  onTablesUpdate: (tables: TableMetadata[]) => void
}

export function AddTableDialog({ apiClient, onTablesUpdate }: AddTableDialogProps) {
  const [tableType, setTableType] = React.useState<"base" | "auth" | "view">("base")
  const [tableName, setTableName] = React.useState("")
  const [columns, setColumns] = React.useState<
    Array<{
      name: string
      type: string
      primaryKey: boolean
      nullable: boolean
      unique?: boolean
      isFile?: boolean
      isSystem?: boolean
    }>
  >([])
  const [sqlQuery, setSqlQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

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

  React.useEffect(() => {
    if (tableType === "base") {
      setColumns([
        { name: "id", type: "string", primaryKey: true, nullable: false, isSystem: true },
        { name: "created", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
        { name: "updated", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
      ])
    } else if (tableType === "auth") {
      setColumns([
        { name: "id", type: "string", primaryKey: true, nullable: false, isSystem: true },
        { name: "email", type: "string", primaryKey: false, nullable: false, isSystem: true },
        { name: "password", type: "string", primaryKey: false, nullable: false, isSystem: true },
        { name: "created", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
        { name: "updated", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
      ])
    } else {
      setColumns([])
    }
  }, [tableType])

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "string", primaryKey: false, nullable: true, isSystem: false }])
  }

  const removeColumn = (index: number) => {
    const column = columns[index]
    if (columns.length > 1 && !column.isSystem) {
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  const updateColumn = (index: number, field: string, value: any) => {
    const updatedColumns = columns.map((col, i) => (i === index ? { ...col, [field]: value } : col))
    setColumns(updatedColumns)
  }

  const handleSubmit = async () => {
    if (!tableName.trim()) return

    setIsLoading(true)
    try {
      const tableData: Partial<TableMetadata> = {
        name: tableName,
        type: tableType,
        rules: {
          list: "",
          get: "",
          add: tableType === "view" ? "" : "",
          update: tableType === "view" ? "" : "",
          delete: tableType === "view" ? "" : "",
        },
      }

      if (tableType === "view") {
        tableData.sql = sqlQuery
      } else {
        tableData.fields = columns
      }

      await apiClient.call("/api/v1/tables", {
        method: "POST",
        body: JSON.stringify(tableData),
      })

      // Refresh tables list
      const updatedTables = await apiClient.call<TableMetadata[]>("/api/v1/tables")
      onTablesUpdate(updatedTables)

      // Reset form
      setTableName("")
      setSqlQuery("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create table:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>Create a new database table with custom columns and settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="table-name">Table Name</Label>
              <Input
                id="table-name"
                placeholder="Enter table name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="table-type">Table Type</Label>
              <Select value={tableType} onValueChange={(value: "base" | "auth" | "view") => setTableType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base Table</SelectItem>
                  <SelectItem value="auth">Auth Table</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tableType === "view" ? (
            <div>
              <Label htmlFor="sql-query">SQL Query</Label>
              <Textarea
                id="sql-query"
                placeholder="SELECT * FROM users WHERE active = true"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="min-h-[200px] font-mono"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter the SQL query that defines this view. The query should be valid SQL syntax.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Columns</Label>
                  <p className="text-sm text-muted-foreground">Define the columns for your {tableType} table</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${column.isSystem ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Column name"
                          value={column.name}
                          onChange={(e) => updateColumn(index, "name", e.target.value)}
                          disabled={column.isSystem}
                          className={column.isSystem ? "bg-muted" : ""}
                        />
                        {column.isSystem && (
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
                        disabled={column.isSystem}
                      >
                        <SelectTrigger className={column.isSystem ? "bg-muted" : ""}>
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
                          disabled={column.isSystem}
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
                          disabled={column.isSystem}
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
                          disabled={column.isSystem}
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
                          disabled={column.isSystem}
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
                      disabled={columns.length === 1 || column.isSystem}
                      className={column.isSystem ? "opacity-30" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  <Badge variant="outline" className="text-xs mr-2">
                    System
                  </Badge>
                  System columns are automatically managed and cannot be modified.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !tableName.trim()}>
            {isLoading ? "Creating..." : `Create ${tableType === "view" ? "View" : "Table"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
