"use client"

import * as React from "react"
import { RefreshCw, Cog, FileText, Trash2, Search, Plus, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ApiClient, TableMetadata } from "@/lib/api"
import { TableConfigDrawer } from "./table-config-drawer"
import { TableDocsDrawer } from "./table-docs-drawer"
import { EditItemDrawer } from "./edit-item-drawer"
import { ColumnVisibilityDropdown } from "./column-visibility-dropdown"

interface TableDetailViewProps {
  table: TableMetadata
  onBack: () => void
  apiClient: ApiClient
  onTableUpdate: (table: TableMetadata) => void
}

export function TableDetailView({ table, onBack, apiClient, onTableUpdate }: TableDetailViewProps) {
  const [tableData, setTableData] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [configOpen, setConfigOpen] = React.useState(false)
  const [docsOpen, setDocsOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(
    table.schema.fields?.map((field) => field.name) || [],
  )
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [filterTerm, setFilterTerm] = React.useState("")
  const [appliedFilter, setAppliedFilter] = React.useState("")

  React.useEffect(() => {
    loadTableData()
  }, [currentPage, appliedFilter])

  React.useEffect(() => {
    setVisibleColumns(table.schema.fields?.map((field) => field.name) || [])
  }, [table.schema.fields])

  const loadTableData = async () => {
    setIsLoading(true)
    try {
      // Mock table data with pagination and filtering
      const mockData = Array.from({ length: 5 }, (_, i) => {
        const id = `${currentPage}-${i + 1}`
        const baseData: any = { id }

        table.schema.fields?.forEach((field) => {
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

      // Apply filter if exists
      let filteredData = mockData
      if (appliedFilter) {
        filteredData = mockData.filter((item) =>
          Object.values(item).some((value) => String(value).toLowerCase().includes(appliedFilter.toLowerCase())),
        )
      }

      setTableData(filteredData)
      setTotalPages(3) // Mock pagination
      setSelectedItems([]) // Clear selection on reload
    } catch (error) {
      console.error("Failed to load table data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReload = () => {
    loadTableData()
  }

  const handleFilter = () => {
    setAppliedFilter(filterTerm)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleFilterKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFilter()
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(tableData.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleRowClick = (item: any, event: React.MouseEvent) => {
    // Don't open edit drawer if clicking on checkbox
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return
    }
    setEditingItem(item)
  }

  const handleItemUpdate = (updatedItem: any) => {
    setTableData((prevData) => prevData.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      // Delete each selected item individually
      const deletePromises = selectedItems.map((itemId) =>
        apiClient.call(`/api/v1/tables/${table.name}/${itemId}`, { method: "DELETE" }),
      )

      await Promise.all(deletePromises)

      // Remove deleted items from table data
      setTableData((prevData) => prevData.filter((item) => !selectedItems.includes(item.id)))
      setSelectedItems([])
    } catch (error) {
      console.error("Failed to delete items:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredFields = table.schema.fields?.filter((field) => visibleColumns.includes(field.name)) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{table.name} Table</h2>
            <p className="text-muted-foreground">View and manage table data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReload} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
            <Cog className="h-4 w-4 mr-2" />
            Config
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDocsOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            API Docs
          </Button>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                onKeyPress={handleFilterKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleFilter} disabled={isLoading}>
              Filter
            </Button>
            {appliedFilter && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterTerm("")
                  setAppliedFilter("")
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {appliedFilter && <p className="text-sm text-muted-foreground mt-2">Filtering by: "{appliedFilter}"</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Data</CardTitle>
              <CardDescription>Current records in the {table.name} table</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting
                    ? "Deleting..."
                    : `Delete ${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""}`}
                </Button>
              )}
              <ColumnVisibilityDropdown
                table={table}
                visibleColumns={visibleColumns}
                onVisibilityChange={setVisibleColumns}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tableData.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                This table doesn't have any records yet. Add some data to get started.
              </p>
              <div className="flex gap-3">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://docs.example.com/records" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === tableData.length && tableData.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {filteredFields.map((field) => (
                      <TableHead key={field.name} className="capitalize">
                        {field.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => handleRowClick(row, e)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.includes(row.id)}
                            onCheckedChange={(checked) => handleSelectItem(row.id, checked as boolean)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </TableCell>
                        {filteredFields.map((field) => (
                          <TableCell key={field.name}>{row[field.name] || "-"}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={filteredFields.length + 1} className="text-center text-muted-foreground">
                        {isLoading ? "Loading..." : "No data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

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

      <TableConfigDrawer
        table={table}
        apiClient={apiClient}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onTableUpdate={onTableUpdate}
      />

      <TableDocsDrawer table={table} open={docsOpen} onClose={() => setDocsOpen(false)} />

      {editingItem && (
        <EditItemDrawer
          table={table}
          item={editingItem}
          apiClient={apiClient}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onItemUpdate={handleItemUpdate}
        />
      )}
    </div>
  )
}
