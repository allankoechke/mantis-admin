"use client"

import * as React from "react"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { TableMetadata } from "@/lib/api"

interface TableDocsDrawerProps {
  table: TableMetadata
  open: boolean
  onClose: () => void
}

export function TableDocsDrawer({ table, open, onClose }: TableDocsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            API Documentation - {table.name}
          </DrawerTitle>
          <DrawerDescription>Auto-generated API endpoints and examples</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <div className="space-y-4">
            <ApiEndpointCard
              method="GET"
              endpoint={`/api/v1/tables/${table.name}`}
              description={`List all records in the ${table.name} table`}
              table={table}
              operation="list"
            />

            <ApiEndpointCard
              method="GET"
              endpoint={`/api/v1/tables/${table.name}/{id}`}
              description="Get a specific record by ID"
              table={table}
              operation="get"
            />

            {table.type !== "view" && (
              <>
                <ApiEndpointCard
                  method="POST"
                  endpoint={`/api/v1/tables/${table.name}`}
                  description="Create a new record"
                  table={table}
                  operation="create"
                />

                <ApiEndpointCard
                  method="PATCH"
                  endpoint={`/api/v1/tables/${table.name}/{id}`}
                  description="Update a specific record"
                  table={table}
                  operation="update"
                />

                <ApiEndpointCard
                  method="DELETE"
                  endpoint={`/api/v1/tables/${table.name}/{id}`}
                  description="Delete a specific record"
                  table={table}
                  operation="delete"
                />
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function ApiEndpointCard({
  method,
  endpoint,
  description,
  table,
  operation,
}: {
  method: string
  endpoint: string
  description: string
  table: TableMetadata
  operation: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800"
      case "POST":
        return "bg-blue-100 text-blue-800"
      case "PATCH":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generateRequestExample = () => {
    const baseUrl = "https://your-api.com"
    let example = `curl -X ${method} "${baseUrl}${endpoint}"`

    if (method !== "GET") {
      example += ` \\\n  -H "Content-Type: application/json"`
    }

    example += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`

    if (operation === "create" || operation === "update") {
      const sampleData: any = {}
      table.fields?.forEach((field) => {
        if (field.name === "id" || field.name === "created" || field.name === "updated") return
        if (field.name === "email") {
          sampleData[field.name] = "user@example.com"
        } else if (field.name === "password") {
          sampleData[field.name] = "securepassword"
        } else {
          sampleData[field.name] = `sample_${field.name}`
        }
      })

      example += ` \\\n  -d '${JSON.stringify(sampleData, null, 2)}'`
    }

    return example
  }

  const generateResponseExample = () => {
    if (operation === "list") {
      const sampleRecord: any = {}
      table.fields?.forEach((field) => {
        if (field.name === "id") {
          sampleRecord[field.name] = "123e4567-e89b-12d3-a456-426614174000"
        } else if (field.name === "created" || field.name === "updated") {
          sampleRecord[field.name] = "2024-01-15T10:00:00Z"
        } else if (field.name === "email") {
          sampleRecord[field.name] = "user@example.com"
        } else if (field.name === "password") {
          return // Don't include password in response
        } else {
          sampleRecord[field.name] = `sample_${field.name}`
        }
      })

      return JSON.stringify(
        {
          data: [sampleRecord],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
        null,
        2,
      )
    }

    if (operation === "delete") {
      return JSON.stringify({ success: true }, null, 2)
    }

    // Single record response
    const sampleRecord: any = {}
    table.fields?.forEach((field) => {
      if (field.name === "id") {
        sampleRecord[field.name] = "123e4567-e89b-12d3-a456-426614174000"
      } else if (field.name === "created" || field.name === "updated") {
        sampleRecord[field.name] = "2024-01-15T10:00:00Z"
      } else if (field.name === "email") {
        sampleRecord[field.name] = "user@example.com"
      } else if (field.name === "password") {
        return // Don't include password in response
      } else {
        sampleRecord[field.name] = `sample_${field.name}`
      }
    })

    return JSON.stringify(sampleRecord, null, 2)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getMethodColor(method)}>{method}</Badge>
              <code className="text-sm">{endpoint}</code>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-l-2 border-muted ml-4 pl-4 space-y-4">
          <div>
            <h5 className="font-medium mb-2">Request Example</h5>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{generateRequestExample()}</code>
            </pre>
          </div>

          <div>
            <h5 className="font-medium mb-2">Response Example</h5>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              <code>{generateResponseExample()}</code>
            </pre>
          </div>

          <div>
            <h5 className="font-medium mb-2">Possible Errors</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">400</Badge>
                <span>Bad Request - Invalid input data</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">401</Badge>
                <span>Unauthorized - Invalid or missing token</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">403</Badge>
                <span>Forbidden - Access denied by rules</span>
              </div>
              {(operation === "get" || operation === "update" || operation === "delete") && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">404</Badge>
                  <span>Not Found - Record does not exist</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="destructive">500</Badge>
                <span>Internal Server Error - Server error</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
