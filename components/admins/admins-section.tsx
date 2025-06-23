"use client"

import * as React from "react"
import { MoreHorizontal, Key, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog } from "@/components/ui/dialog"
import type { ApiClient, Admin } from "@/lib/api"
import { ChangePasswordDialog } from "./change-password-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface AdminsSectionProps {
  admins: Admin[]
  apiClient: ApiClient
  onAdminsUpdate: (admins: Admin[]) => void
}

export function AdminsSection({ admins, apiClient, onAdminsUpdate }: AdminsSectionProps) {
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null)

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await apiClient.call(`/api/v1/admins/${adminId}`, { method: "DELETE" })
      const updatedAdmins = await apiClient.call<Admin[]>("/api/v1/admins")
      onAdminsUpdate(updatedAdmins)
    } catch (error) {
      console.error("Failed to delete admin:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h2 className="text-2xl font-bold">Admin Management</h2>
            <p className="text-muted-foreground">Manage administrator accounts</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>{admins.length} administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        {selectedAdmin && (
          <ChangePasswordDialog admin={selectedAdmin} apiClient={apiClient} onClose={() => setSelectedAdmin(null)} />
        )}
      </Dialog>
    </div>
  )
}
