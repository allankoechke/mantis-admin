"use client"

import * as React from "react"
import { RefreshCw, Cog, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ApiClient, TableMetadata } from "@/lib/api"
import { TableConfigDrawer } from "./table-config-drawer"
import { TableDocsDrawer } from "./table-docs-drawer"

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

  React.useEffect(() => {
    loadTableData()
  }, [currentPage])

  const loadTableData = async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleReload = () => {
    loadTableData()
  }

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
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Reload
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

      <Card>
        <CardHeader>
          <CardTitle>Table Data</CardTitle>
          <CardDescription>Current records in the {table.name} table</CardDescription>
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
                      {isLoading ? "Loading..." : "No data available"}
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

      <TableConfigDrawer
        table={table}
        apiClient={apiClient}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onTableUpdate={onTableUpdate}
      />

      <TableDocsDrawer table={table} open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  )
}
