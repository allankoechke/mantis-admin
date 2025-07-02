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
import { useToast } from "@/hooks/use-toast"

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
  const [isViewType, setIsViewIsViewType] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (open && item) {
      setFormData({ ...item })
      setHasUnsavedChanges(false)
      setIsViewIsViewType(table?.type === "view")
    }
  }, [open, item])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const updatedItem = await apiClient.call<any>(`/api/v1/${table.name}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      })

      // If the request failed, throw the error here 
      if (updatedItem?.error?.length > 0) throw updatedItem.error

      onItemUpdate(updatedItem)
      onClose()

      toast({
        title: "Table Updated",
        description: "Table data has been updated successfully.",
      })
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
    setHasUnsavedChanges(true)
  }

  const isSystemGeneratedField = (field: any) => {
    return field.system && ["id", "created", "updated"].includes(field.name)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setHasUnsavedChanges(false)
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent side="right" className="w-[700px] max-w-[95vw]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <DrawerTitle>Edit Record</DrawerTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription>Edit record in {table.name} table</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {table.schema.fields?.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium capitalize">
                    {field.name}
                    {!field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={
                      field.name === "password"
                        ? "password"
                        : field.type === "datetime" || field.type === "timestamp"
                          ? "datetime-local"
                          : "text"
                    }
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={isSystemGeneratedField(field)}
                    className={`w-full ${isSystemGeneratedField(field) ? "bg-muted" : ""}`}
                    placeholder={`Enter ${field.name}`}
                  />
                  {isSystemGeneratedField(field) && (
                    <p className="text-xs text-muted-foreground">System generated field - cannot be modified</p>
                  )}
                  {(table.type === "auth" && field.name === "password") && (
                    <p className="text-xs text-muted-foreground">Password fields are redacted in API responses.</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter>
          {/* Do not allow editing view types */}
          {isViewType && (
            <p className="text-xs text-muted-foreground">View tables cannot be modified from here!</p>
          )}

          {/* For non view types, allow making data changes */}
          {!isViewType && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || isViewType} className="flex-1">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )
          }
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
