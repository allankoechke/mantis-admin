"use client"

import * as React from "react"
import {
  Database,
  Settings,
  Shield,
  Table,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Cog,
  LogOut,
  Key,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TableMetadata {
  id: string
  name: string
  type: "base" | "auth" | "view"
  created: string
  updated: string
  rules: {
    list: string
    get: string
    add: string
    update: string
    delete: string
  }
  fields?: Array<{
    name: string
    type: string
    primaryKey: boolean
    nullable: boolean
    unique?: boolean
    isFile?: boolean
  }>
  sql?: string
}

interface Admin {
  id: string
  email: string
  created: string
  updated: string
}

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("database")
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [tables, setTables] = React.useState<TableMetadata[]>([])
  const [admins, setAdmins] = React.useState<Admin[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.status === 401) {
      onLogout()
      return null
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [tablesData, adminsData] = await Promise.all([apiCall("/api/v1/tables"), apiCall("/api/v1/admins")])

      if (tablesData) setTables(tablesData)
      if (adminsData) setAdmins(adminsData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    onLogout()
  }

  const sidebarItems = [
    {
      title: "Database",
      icon: Database,
      id: "database",
    },
    {
      title: "Admins",
      icon: Shield,
      id: "admins",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ]

  const filteredTables = tables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="font-semibold">Admin Dashboard</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          setActiveSection(item.id)
                          setSelectedTable(null)
                        }}
                        isActive={activeSection === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="font-semibold text-lg">
                {activeSection === "database" && "Database Management"}
                {activeSection === "admins" && "Admin Management"}
                {activeSection === "settings" && "Application Settings"}
              </h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : (
              <>
                {activeSection === "database" && (
                  <DatabaseSection
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredTables={filteredTables}
                    tables={tables}
                    apiCall={apiCall}
                    onTablesUpdate={setTables}
                  />
                )}
                {activeSection === "admins" && (
                  <AdminsSection admins={admins} apiCall={apiCall} onAdminsUpdate={setAdmins} />
                )}
                {activeSection === "settings" && <SettingsSection />}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function AddTableDialog({
  apiCall,
  onTablesUpdate,
}: {
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>
  onTablesUpdate: (tables: TableMetadata[]) => void
}) {
  const [tableType, setTableType] = React.useState<"base" | "auth" | "view">("base")
  const [tableName, setTableName] = React.useState("")
  const [tableDescription, setTableDescription] = React.useState("")
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

      await apiCall("/api/v1/tables", {
        method: "POST",
        body: JSON.stringify(tableData),
      })

      // Refresh tables list
      const updatedTables = await apiCall("/api/v1/tables")
      onTablesUpdate(updatedTables)

      // Reset form
      setTableName("")
      setTableDescription("")
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

function DatabaseSection({
  selectedTable,
  setSelectedTable,
  searchTerm,
  setSearchTerm,
  filteredTables,
  tables,
  apiCall,
  onTablesUpdate,
}: {
  selectedTable: string | null
  setSelectedTable: (table: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredTables: TableMetadata[]
  tables: TableMetadata[]
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>
  onTablesUpdate: (tables: TableMetadata[]) => void
}) {
  const handleDeleteTable = async (tableId: string) => {
    try {
      await apiCall(`/api/v1/tables/${tableId}`, { method: "DELETE" })
      const updatedTables = await apiCall("/api/v1/tables")
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
          apiCall={apiCall}
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
        <AddTableDialog apiCall={apiCall} onTablesUpdate={onTablesUpdate} />
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

function TableDetailView({
  table,
  onBack,
  apiCall,
  onTableUpdate,
}: {
  table: TableMetadata
  onBack: () => void
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>
  onTableUpdate: (table: TableMetadata) => void
}) {
  const [activeTab, setActiveTab] = React.useState("config")
  const [rules, setRules] = React.useState(table.rules)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSaveRules = async () => {
    setIsLoading(true)
    try {
      const updatedTable = await apiCall(`/api/v1/tables/${table.id}`, {
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
                      /api/v1/tables/{table.name}/{"{"}
                      {"{"}id{"}"}
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
                          /api/v1/tables/{table.name}/{"{"}
                          {"{"}id{"}"}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">Update a specific record</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                        <code className="text-sm">
                          /api/v1/tables/{table.name}/{"{"}
                          {"{"}id{"}"}
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

function ChangePasswordDialog({
  admin,
  apiCall,
  onClose,
}: {
  admin: Admin
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>
  onClose: () => void
}) {
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await apiCall(`/api/v1/admins/${admin.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      })
      onClose()
    } catch (error) {
      setError("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Password</DialogTitle>
        <DialogDescription>Change password for {admin.email}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function AdminsSection({
  admins,
  apiCall,
  onAdminsUpdate,
}: {
  admins: Admin[]
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>
  onAdminsUpdate: (admins: Admin[]) => void
}) {
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null)

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await apiCall(`/api/v1/admins/${adminId}`, { method: "DELETE" })
      const updatedAdmins = await apiCall("/api/v1/admins")
      onAdminsUpdate(updatedAdmins)
    } catch (error) {
      console.error("Failed to delete admin:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-muted-foreground">Manage administrator accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>{admins.length} administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>{new Date(admin.created).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(admin.updated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedAdmin(admin)}>
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteAdmin(admin.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        {selectedAdmin && (
          <ChangePasswordDialog admin={selectedAdmin} apiCall={apiCall} onClose={() => setSelectedAdmin(null)} />
        )}
      </Dialog>
    </div>
  )
}

function SettingsSection() {
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
