"use client"

import * as React from "react"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function Page() {
  const [token, setToken] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedToken = localStorage.getItem("admin_token")
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const handleLogin = (newToken: string) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    setToken(null)
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />
}
