"use client"

import * as React from "react"
import { Search, Table, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ApiClient, TableMetadata } from "@/lib/api"
import { AddTableDialog } from "./add-table-dialog"
import { TableDetailView } from "./table-detail-view"

interface DatabaseSectionProps {
  apiClient: ApiClient
  tables: TableMetadata[]
  onTablesUpdate: (tables: TableMetadata[]) => void
}

export function DatabaseSection({ apiClient, tables, onTablesUpdate }: DatabaseSectionProps) {
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDeleteTable = async (tableId: string) => {
    try {
      await apiClient.call(`/api/v1/tables/${tableId}`, { method: "DELETE" })
      const updatedTables = await apiClient.call<TableMetadata[]>("/api/v1/tables")
      onTablesUpdate(updatedTables)
    } catch (error) {
      console.error("Failed to delete table:", error)
    }
  }

  if (selectedTable) {
    const tableInfo = tables.find((t) => t.name === selectedTable)
    if (tableInfo) {
      return (
        <TableDetailView
          table={tableInfo}
          onBack={() => setSelectedTable(null)}
          apiClient={apiClient}
          onTableUpdate={(updatedTable) => {
            const updatedTables = tables.map((t) => (t.id === updatedTable.id ? updatedTable : t))
            onTablesUpdate(updatedTables)
          }}
        />
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Tables</h2>
          <p className="text-muted-foreground">Manage your database tables and data</p>
        </div>
        <AddTableDialog apiClient={apiClient} onTablesUpdate={onTablesUpdate} />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTables.map((table) => (
          <Card key={table.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  {table.name}
                  <Badge
                    variant={table.type === "auth" ? "default" : table.type === "view" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {table.type}
                  </Badge>
                </div>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedTable(table.name)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Structure
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTable(table.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{table.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="font-medium">{table.fields?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(table.created).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
