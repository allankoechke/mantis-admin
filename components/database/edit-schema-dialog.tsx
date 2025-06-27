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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ApiClient, TableMetadata } from "@/lib/api"
import { dataTypes } from "@/lib/constants"

interface EditSchemaDialogProps {
  table: TableMetadata
  apiClient: ApiClient
  onClose: () => void
  onTableUpdate: (table: TableMetadata) => void
}

export function EditSchemaDialog({ table, apiClient, onClose, onTableUpdate }: EditSchemaDialogProps) {
  const [columns, setColumns] = React.useState(table.schema.fields || [])
  const [isLoading, setIsLoading] = React.useState(false)
  const [deletedColumns, setDeletedColumns] = React.useState([])

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "string", primaryKey: false, required: false, system: false }])
  }

  const removeColumn = (index: number) => {
    const column = columns[index]
    if (columns.length > 1 && !column.system) {
      setDeletedColumns([...deletedColumns, column.name]); // Add the column to the delete array
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  const updateColumn = (index: number, field: string, value: any) => {
    const updatedColumns = columns.map((col, i) => (i === index ? { ...col, [field]: value } : col))
    setColumns(updatedColumns)
  }

  // The update structure for tables is a s follows
  /*
  {
    name: "", // can be different from existing one
    has_api: <bool>,
    addRule: "",
    getRule: "",
    listRule: "",
    updateRule: "",
    deleteRule: "",
    deletedFields: [], // List of column names to delete
    fields: [], array of fields, changes to particular fields will be effected, new fields will be created
  }
  */

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const updatedTable = await apiClient.call<TableMetadata>(`/api/v1/tables/${table.id}`, {
        method: "PATCH",
        body: JSON.stringify({  fields: columns, deletedColumns  }),
      })
      onTableUpdate(updatedTable)
    } catch (error) {
      console.error("Failed to update schema:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSystemColumn = (column: any) => {
    return column.system
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Schema - {table.name}</DialogTitle>
          <DialogDescription>Modify the table structure and column definitions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-medium">Columns</Label>
                <p className="text-sm text-muted-foreground">Modify the columns for your {table.type} table</p>
              </div>
              {table.type !== "view" && (
                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {columns.map((column, index) => {
                const isSystem = isSystemColumn(column)
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
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Auto Generate Pattern"
                          value={column.autoGeneratePattern || ""}
                          onChange={(e) => updateColumn(index, "autoGeneratePattern", e.target.value)}
                          disabled={isSystem}
                          className={isSystem ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Default Value"
                          value={column.defaultValue || ""}
                          onChange={(e) => updateColumn(index, "defaultValue", e.target.value)}
                          disabled={isSystem}
                          className={isSystem ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Max Value"
                          value={column.maxValue || ""}
                          onChange={(e) => updateColumn(index, "maxValue", e.target.value)}
                          disabled={isSystem}
                          className={isSystem ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Min Value"
                          value={column.minValue || ""}
                          onChange={(e) => updateColumn(index, "minValue", e.target.value)}
                          disabled={isSystem}
                          className={isSystem ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          placeholder="Validator"
                          value={column.validator || ""}
                          onChange={(e) => updateColumn(index, "validator", e.target.value)}
                          disabled={isSystem}
                          className={isSystem ? "bg-muted" : ""}
                        />
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
                          checked={column.required || false}
                          onChange={(e) => updateColumn(index, "required", e.target.checked)}
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

            <div className="text-sm text-muted-foreground mt-2">
              <p>
                <Badge variant="outline" className="text-xs mr-2">
                  System
                </Badge>
                System columns are automatically managed and cannot be modified.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Schema"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
