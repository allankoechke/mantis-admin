"use client"

import * as React from "react"
import { Edit, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ApiClient, TableMetadata } from "@/lib/api"

interface EditItemDrawerProps {
  table: TableMetadata
  item: any
  apiClient: ApiClient
  open: boolean
  onClose: () => void
  onItemUpdate: (item: any) => void
}

export function EditItemDrawer({ table, item, apiClient, open, onClose, onItemUpdate }: EditItemDrawerProps) {
  const [formData, setFormData] = React.useState<any>({})
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && item) {
      setFormData({ ...item })
    }
  }, [open, item])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const updatedItem = await apiClient.call<any>(`/api/v1/tables/${table.name}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      })
      onItemUpdate(updatedItem)
      onClose()
    } catch (error) {
      console.error("Failed to update item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const isSystemField = (fieldName: string) => {
    return ["id", "created", "updated"].includes(fieldName)
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent side="right" className="w-[700px] max-w-[90vw]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <DrawerTitle>Edit Record</DrawerTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription>Edit record in {table.name} table</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {table.fields?.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium capitalize">
                  {field.name}
                  {!field.nullable && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.name === "password" ? "password" : field.type === "datetime" ? "datetime-local" : "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  disabled={isSystemField(field.name)}
                  className={`w-full ${isSystemField(field.name) ? "bg-muted" : ""}`}
                  placeholder={`Enter ${field.name}`}
                />
                {isSystemField(field.name) && (
                  <p className="text-xs text-muted-foreground">System field - cannot be modified</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t mt-6">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
