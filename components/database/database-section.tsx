"use client"

import * as React from "react"
import { Search, Table, Eye, Trash2, MoreHorizontal, RefreshCw, Plus, ExternalLink, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ApiClient, TableMetadata } from "@/lib/api"
import { AddTableDialog } from "./add-table-dialog"
import { TableDetailView } from "./table-detail-view"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TableDocsDrawer } from "./table-docs-drawer"
import { useRouter } from "@/lib/router"
import { useToast } from "@/hooks/use-toast"

interface DatabaseSectionProps {
  apiClient: ApiClient
  tables: TableMetadata[]
  onTablesUpdate: (tables: TableMetadata[]) => void
}

export function DatabaseSection({ apiClient, tables, onTablesUpdate }: DatabaseSectionProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [editingTable, setEditingTable] = React.useState<TableMetadata | null>(null)
  const [searchExpanded, setSearchExpanded] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [docsOpen, setDocsOpen] = React.useState(false)
  const { route, navigate } = useRouter()
  const { toast } = useToast()

  // Check if we're viewing a specific table - safer parsing
  const getSelectedTableName = () => {
    try {
      const pathParts = route.path.split("/").filter(Boolean)
      return pathParts.length > 1 && pathParts[0] === "tables" ? pathParts[1] : null
    } catch (error) {
      console.warn("Error parsing table route:", error)
      return null
    }
  }

  const selectedTableName = getSelectedTableName()

  const filteredTables = tables?.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDeleteTable = async (tableId: string) => {
    try {
      const res: any = await apiClient.call(`/api/v1/tables/${tableId}`, { method: "DELETE" })

      // If the request failed, throw the error here 
      if (res?.error?.length > 0) throw res.error

      // Fetch new tables
      const updatedTables = await apiClient.call<TableMetadata[]>("/api/v1/tables")

      // If the request failed, throw the error here 
      if (updatedTables?.error?.length > 0) throw updatedTables.error

      // Set the new tables
      onTablesUpdate(updatedTables)

      toast({
        title: "Table Deleted",
        description: "Table deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete table:", error)
    }
  }

  const handleTableClick = (tableName: string) => {
    try {
      navigate(`/tables/${tableName}`)
    } catch (error) {
      console.warn("Failed to navigate to table:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const updatedTables = await apiClient.call<TableMetadata[]>("/api/v1/tables")

      // If the request failed, throw the error here 
      if (updatedTables?.error?.length > 0) throw updatedTables.error

      onTablesUpdate(updatedTables)
    } catch (error) {
      console.error("Failed to refresh tables:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (selectedTableName) {
    const tableInfo = tables.find((t) => t.name === selectedTableName)
    if (tableInfo) {
      return (
        <TableDetailView
          table={tableInfo}
          onBack={() => {
            try {
              navigate("/tables")
            } catch (error) {
              console.warn("Failed to navigate back:", error)
            }
          }}
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
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        {/* Expandable Search */}
        <div className={`flex items-center transition-all duration-200 ${searchExpanded ? "flex-1" : ""}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchExpanded(true)}
              onBlur={() => {
                if (!searchTerm) setSearchExpanded(false)
              }}
              className={`pl-10 transition-all duration-200 ${searchExpanded ? "w-80" : "w-64"}`}
            />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDocsOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Table API Docs
          </Button>
          <AddTableDialog apiClient={apiClient} onTablesUpdate={onTablesUpdate} />
        </div>
      </div>

      {tables.length === 0 && !isRefreshing ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Table className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tables Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by creating your first table. Tables are used to store and organize your data.
            </p>
            <div className="flex gap-3">
              <AddTableDialog apiClient={apiClient} onTablesUpdate={onTablesUpdate}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </AddTableDialog>
              <Button variant="outline" onClick={() => setDocsOpen(true)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTableClick(table.name)}
            >
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
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTableClick(table.name)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTable(table.id)
                      }}
                    >
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
                    <span className="font-medium">{table.schema.fields?.length || 0}</span>
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
      )}

      {/* Open docs on table CRUD */}
      <TableDocsDrawer open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  )
}
