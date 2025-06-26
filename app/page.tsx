"use client"

import * as React from "react"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { useRouter } from "@/lib/router"

export default function Page() {
  const [token, setToken] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const { route, navigate } = useRouter()

  React.useEffect(() => {
    setMounted(true)
    const savedToken = localStorage.getItem("admin_token")
    if (savedToken) {
      setToken(savedToken)
      // If we have a token but we're on login route, redirect to tables
      if (route.path === "/login") {
        navigate("/tables")
      }
    } else {
      // No token, redirect to login
      navigate("/login")
    }
  }, [])

  React.useEffect(() => {
    if (mounted) {
      if (!token && route.path !== "/login") {
        navigate("/login")
      } else if (token && route.path === "/login") {
        navigate("/tables")
      }
    }
  }, [token, route.path, mounted, navigate])

  const handleLogin = (newToken: string) => {
    setToken(newToken)
    navigate("/tables")
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem("admin_token")
    navigate("/login")
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

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {route.path === "/login" || !token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <AdminDashboard token={token} onLogout={handleLogout} />
      )}
      <Toaster />
    </ThemeProvider>
  )
}
