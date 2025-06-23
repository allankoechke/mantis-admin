"use client"

import * as React from "react"
import {
  Database,
  Settings,
  Shield,
  Table,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Cog,
  ScrollText,
  Copy,
  Check,
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

// Mock data
const mockTables = [
  { id: 1, name: "users", type: "auth", rows: 1250, columns: 8, created: "2024-01-15" },
  { id: 2, name: "products", type: "base", rows: 450, columns: 12, created: "2024-01-20" },
  { id: 3, name: "orders", type: "base", rows: 3200, columns: 10, created: "2024-01-25" },
  { id: 4, name: "categories_view", type: "view", rows: 25, columns: 5, created: "2024-02-01" },
]

const mockTableData = {
  users: [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin", created: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user", created: "2024-01-16" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user", created: "2024-01-17" },
  ],
  products: [
    { id: 1, name: "Laptop", price: 999.99, category: "Electronics", stock: 50 },
    { id: 2, name: "Phone", price: 699.99, category: "Electronics", stock: 100 },
    { id: 3, name: "Book", price: 19.99, category: "Books", stock: 200 },
  ],
}

const mockAdmins = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "Super Admin",
    lastLogin: "2024-12-06",
    status: "active",
  },
  {
    id: 2,
    name: "John Admin",
    email: "john.admin@example.com",
    role: "Admin",
    lastLogin: "2024-12-05",
    status: "active",
  },
  {
    id: 3,
    name: "Jane Manager",
    email: "jane.manager@example.com",
    role: "Manager",
    lastLogin: "2024-12-04",
    status: "inactive",
  },
]

const mockLogs = [
  {
    id: 1,
    timestamp: "2024-12-06 14:30:25",
    level: "INFO",
    message: "User john@example.com logged in successfully",
    source: "auth",
  },
  {
    id: 2,
    timestamp: "2024-12-06 14:28:15",
    level: "ERROR",
    message: "Failed to connect to database: connection timeout",
    source: "database",
  },
  {
    id: 3,
    timestamp: "2024-12-06 14:25:10",
    level: "INFO",
    message: "API request: GET /api/v1/products - 200 OK",
    source: "api",
  },
  {
    id: 4,
    timestamp: "2024-12-06 14:20:05",
    level: "WARN",
    message: "Rate limit exceeded for IP 192.168.1.100",
    source: "security",
  },
]

export function AdminDashboard() {
  const [mounted, setMounted] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("database")
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
      title: "Logs",
      icon: ScrollText,
      id: "logs",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ]

  const filteredTables = mockTables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
            <div className="flex items-center gap-2 px-4 py-2">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">Admin Dashboard</span>
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
                {activeSection === "logs" && "System Logs"}
                {activeSection === "settings" && "Application Settings"}
              </h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            {activeSection === "database" && (
              <DatabaseSection
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredTables={filteredTables}
              />
            )}
            {activeSection === "admins" && <AdminsSection />}
            {activeSection === "logs" && <LogsSection />}
            {activeSection === "settings" && <SettingsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function AddTableDialog() {
  const [tableType, setTableType] = React.useState<"base" | "auth" | "view">("base")
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
        { name: "name", type: "string", primaryKey: false, nullable: true, isSystem: true },
        { name: "created", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
        { name: "updated", type: "datetime", primaryKey: false, nullable: false, isSystem: true },
      ])
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

  return (
    <Dialog>
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
              <Input id="table-name" placeholder="Enter table name" />
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

          <div>
            <Label htmlFor="table-description">Description</Label>
            <Textarea id="table-description" placeholder="Enter table description" />
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
          <Button variant="outline">Cancel</Button>
          <Button>Create {tableType === "view" ? "View" : "Table"}</Button>
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
}: {
  selectedTable: string | null
  setSelectedTable: (table: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredTables: any[]
}) {
  if (selectedTable) {
    const tableInfo = mockTables.find((t) => t.name === selectedTable)
    return (
      <TableDetailView
        tableName={selectedTable}
        tableType={tableInfo?.type || "base"}
        onBack={() => setSelectedTable(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Tables</h2>
          <p className="text-muted-foreground">Manage your database tables and data</p>
        </div>
        <AddTableDialog />
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
                    View Data
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Structure
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="font-medium">{table.rows.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Columns:</span>
                  <span className="font-medium">{table.columns}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{table.created}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ApiEndpointCard({
  method,
  endpoint,
  description,
  parameters,
  queryParams,
  example,
}: {
  method: string
  endpoint: string
  description: string
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>
  queryParams?: Array<{ name: string; type: string; description: string }>
  example?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const methodColors = {
    GET: "bg-green-100 text-green-800",
    POST: "bg-blue-100 text-blue-800",
    PUT: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={methodColors[method as keyof typeof methodColors] || "bg-gray-100 text-gray-800"}>
              {method}
            </Badge>
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{endpoint}</code>
          </div>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(endpoint)}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {parameters && parameters.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Parameters</h5>
            <div className="space-y-2">
              {parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs">{param.name}</code>
                  <Badge variant="outline" className="text-xs">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  <span className="text-muted-foreground">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {queryParams && queryParams.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Query Parameters</h5>
            <div className="space-y-2">
              {queryParams.map((param, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs">{param.name}</code>
                  <Badge variant="outline" className="text-xs">
                    {param.type}
                  </Badge>
                  <span className="text-muted-foreground">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {example && (
          <div>
            <h5 className="font-medium mb-2">Example Response</h5>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{example}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TableDetailView({
  tableName,
  tableType,
  onBack,
}: { tableName: string; tableType: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState("data")
  const tableData = mockTableData[tableName as keyof typeof mockTableData] || []
  const baseUrl = "https://api.example.com"

  const generateApiDocs = () => {
    const endpoints = []

    endpoints.push({
      method: "GET",
      endpoint: `${baseUrl}/api/v1/${tableName}`,
      description: `Get a list of ${tableName} records`,
      queryParams: [
        { name: "page", type: "integer", description: "Page number for pagination (default: 1)" },
        { name: "limit", type: "integer", description: "Number of records per page (default: 20)" },
        { name: "sort", type: "string", description: "Sort field (e.g., 'created', '-created' for desc)" },
        { name: "filter", type: "string", description: "Filter expression (e.g., 'name~\"John\"')" },
      ],
      example: JSON.stringify(
        {
          data: tableData.slice(0, 2),
          pagination: {
            page: 1,
            limit: 20,
            total: tableData.length,
            pages: Math.ceil(tableData.length / 20),
          },
        },
        null,
        2,
      ),
    })

    endpoints.push({
      method: "GET",
      endpoint: `${baseUrl}/api/v1/${tableName}/{id}`,
      description: `Get a specific ${tableName} record by ID`,
      parameters: [{ name: "id", type: "string", required: true, description: "The unique identifier of the record" }],
      example: JSON.stringify(tableData[0] || {}, null, 2),
    })

    if (tableType === "base" || tableType === "auth") {
      endpoints.push({
        method: "POST",
        endpoint: `${baseUrl}/api/v1/${tableName}`,
        description: `Create a new ${tableName} record`,
        example: JSON.stringify({ message: "Record created successfully", id: "new-id" }, null, 2),
      })

      endpoints.push({
        method: "PUT",
        endpoint: `${baseUrl}/api/v1/${tableName}/{id}`,
        description: `Update a specific ${tableName} record`,
        parameters: [
          { name: "id", type: "string", required: true, description: "The unique identifier of the record to update" },
        ],
        example: JSON.stringify({ message: "Record updated successfully" }, null, 2),
      })

      endpoints.push({
        method: "DELETE",
        endpoint: `${baseUrl}/api/v1/${tableName}/{id}`,
        description: `Delete a specific ${tableName} record`,
        parameters: [
          { name: "id", type: "string", required: true, description: "The unique identifier of the record to delete" },
        ],
        example: JSON.stringify({ message: "Record deleted successfully" }, null, 2),
      })
    }

    if (tableType === "auth") {
      endpoints.push({
        method: "POST",
        endpoint: `${baseUrl}/api/v1/${tableName}/auth`,
        description: `Authenticate user credentials`,
        example: JSON.stringify(
          {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: tableData[0] || {},
            expires: "2024-12-07T14:30:25Z",
          },
          null,
          2,
        ),
      })
    }

    return endpoints
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{tableName} Table</h2>
            <p className="text-muted-foreground">Manage data and configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Row</DialogTitle>
                <DialogDescription>Add a new row to the {tableName} table.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.keys(tableData[0] || {}).map((key) => (
                  <div key={key}>
                    <Label htmlFor={key} className="capitalize">
                      {key}
                    </Label>
                    <Input id={key} placeholder={`Enter ${key}`} />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Add Row</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        {[
          { id: "data", label: "Data", icon: Table },
          { id: "docs", label: "API Documentation", icon: FileText },
          { id: "config", label: "Configuration", icon: Cog },
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

      {activeTab === "data" && (
        <Card>
          <CardHeader>
            <CardTitle>Table Data</CardTitle>
            <CardDescription>
              {tableData.length} rows in {tableName} table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableComponent>
              <TableHeader>
                <TableRow>
                  {Object.keys(tableData[0] || {}).map((key) => (
                    <TableHead key={key} className="capitalize">
                      {key}
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex: number) => (
                      <TableCell key={cellIndex}>
                        {typeof value === "string" && value.includes("@") ? (
                          <Badge variant="secondary">{value}</Badge>
                        ) : (
                          String(value)
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
      )}

      {activeTab === "docs" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Auto-generated API endpoints for the {tableName} {tableType} table
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {generateApiDocs().map((endpoint, index) => (
              <ApiEndpointCard
                key={index}
                method={endpoint.method}
                endpoint={endpoint.endpoint}
                description={endpoint.description}
                parameters={endpoint.parameters}
                queryParams={endpoint.queryParams}
                example={endpoint.example}
              />
            ))}
          </div>
        </div>
      )}

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
                  <Input id="list-rule" placeholder='e.g., "True", "auth.id != None", ""' defaultValue="" />
                  <p className="text-xs text-muted-foreground mt-1">Controls who can list records</p>
                </div>

                <div>
                  <Label htmlFor="get-rule">Get Rule</Label>
                  <Input id="get-rule" placeholder='e.g., "True", "auth.id == record.user_id"' defaultValue="" />
                  <p className="text-xs text-muted-foreground mt-1">Controls who can view individual records</p>
                </div>

                {(tableType === "base" || tableType === "auth") && (
                  <>
                    <div>
                      <Label htmlFor="add-rule">Add Rule</Label>
                      <Input
                        id="add-rule"
                        placeholder='e.g., "auth.id != None", "auth.role == "admin""'
                        defaultValue=""
                      />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can create new records</p>
                    </div>

                    <div>
                      <Label htmlFor="update-rule">Update Rule</Label>
                      <Input id="update-rule" placeholder='e.g., "auth.id == record.user_id", ""' defaultValue="" />
                      <p className="text-xs text-muted-foreground mt-1">Controls who can update records</p>
                    </div>

                    <div>
                      <Label htmlFor="delete-rule">Delete Rule</Label>
                      <Input id="delete-rule" placeholder='e.g., "auth.role == "admin"", ""' defaultValue="" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Settings</CardTitle>
              <CardDescription>Configure general table behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable API Access</Label>
                  <p className="text-sm text-muted-foreground">Allow API queries to this table</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">Cache query results for better performance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup this table</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {tableType === "auth" && (
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure authentication behavior for this table</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Password Reset</Label>
                    <p className="text-sm text-muted-foreground">Allow users to reset their passwords</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Allow users to enable 2FA on their accounts</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Social Login</Label>
                    <p className="text-sm text-muted-foreground">Allow login with Google, GitHub, etc.</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <Label>Password Policy</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Session Duration</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function AdminsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new administrator account with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-name">Full Name</Label>
                <Input id="admin-name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" placeholder="Enter email address" />
              </div>
              <div>
                <Label htmlFor="admin-role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>{mockAdmins.length} administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"}>{admin.role}</Badge>
                  </TableCell>
                  <TableCell>{admin.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
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
    </div>
  )
}

function LogsSection() {
  const [logLevel, setLogLevel] = React.useState("all")
  const [logSource, setLogSource] = React.useState("all")

  const filteredLogs = mockLogs.filter((log) => {
    const levelMatch = logLevel === "all" || log.level.toLowerCase() === logLevel.toLowerCase()
    const sourceMatch = logSource === "all" || log.source === logSource
    return levelMatch && sourceMatch
  })

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-100 text-red-800"
      case "warn":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Logs</h2>
          <p className="text-muted-foreground">Monitor application activity and errors</p>
        </div>
        <div className="flex gap-2">
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={logSource} onValueChange={setLogSource}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>{filteredLogs.length} log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className={getLevelColor(log.level)}>{log.level}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-muted-foreground">{log.timestamp}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.source}
                    </Badge>
                  </div>
                  <p className="text-sm">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsSection() {
  const [showConnectionString, setShowConnectionString] = React.useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Application Settings</h2>
        <p className="text-muted-foreground">Configure global application settings and preferences</p>
      </div>

      <div className="grid gap-6">
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
            <div>
              <Label htmlFor="app-description">Description</Label>
              <Textarea id="app-description" defaultValue="Comprehensive admin dashboard for database management" />
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

        <Card>
          <CardHeader>
            <CardTitle>Database Settings</CardTitle>
            <CardDescription>Configure database connection and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Database Type</Label>
              <Select defaultValue="sqlite">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connection-string">Connection String</Label>
              <div className="flex gap-2">
                <Input
                  id="connection-string"
                  type={showConnectionString ? "text" : "password"}
                  defaultValue="postgresql://user:password@localhost:5432/database"
                  placeholder="Database connection string"
                />
                <Button type="button" variant="outline" onClick={() => setShowConnectionString(!showConnectionString)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Connection string for non-SQLite databases. This information is encrypted and secured.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup database daily</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Query Logging</Label>
                <p className="text-sm text-muted-foreground">Log all database queries for debugging</p>
              </div>
              <Switch />
            </div>
            <div>
              <Label>Connection Pool Size</Label>
              <Select defaultValue="10">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 connections</SelectItem>
                  <SelectItem value="10">10 connections</SelectItem>
                  <SelectItem value="20">20 connections</SelectItem>
                  <SelectItem value="50">50 connections</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label>Session Duration (minutes)</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
