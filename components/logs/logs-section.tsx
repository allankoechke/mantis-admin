"use client"

import * as React from "react"
import { Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  message: string
  source: string
  details?: string
}

export function LogsSection() {
  const [logs] = React.useState<LogEntry[]>([
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      level: "info",
      message: "User login successful",
      source: "auth",
      details: "User admin@example.com logged in from IP 192.168.1.1",
    },
    {
      id: "2",
      timestamp: "2024-01-15T10:25:00Z",
      level: "warning",
      message: "Rate limit approaching",
      source: "api",
      details: "API rate limit at 80% for endpoint /api/v1/tables",
    },
    {
      id: "3",
      timestamp: "2024-01-15T10:20:00Z",
      level: "error",
      message: "Database connection failed",
      source: "database",
      details: "Connection timeout after 30 seconds",
    },
    {
      id: "4",
      timestamp: "2024-01-15T10:15:00Z",
      level: "info",
      message: "Table created successfully",
      source: "database",
      details: "New table 'products' created with 5 columns",
    },
    {
      id: "5",
      timestamp: "2024-01-15T10:10:00Z",
      level: "info",
      message: "Backup completed",
      source: "system",
      details: "Daily backup completed successfully (2.3GB)",
    },
  ])

  const [searchTerm, setSearchTerm] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState<string>("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    return matchesSearch && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h2 className="text-2xl font-bold">System Logs</h2>
            <p className="text-muted-foreground">Monitor system activity and events</p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>{filteredLogs.length} log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getLevelColor(log.level) as any}>{log.level.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.source}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
