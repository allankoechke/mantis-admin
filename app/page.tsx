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

    // Get saved token safely
    try {
      const savedToken = localStorage.getItem("admin_token")
      if (savedToken) {
        setToken(savedToken)
      }
    } catch (error) {
      console.warn("Failed to get saved token:", error)
    }
  }, [])

  React.useEffect(() => {
    if (mounted) {
      try {
        const currentPath = route.path

        if (!token && currentPath !== "/login") {
          navigate("/login")
        } else if (token && currentPath === "/login") {
          navigate("/tables")
        }
      } catch (error) {
        console.warn("Failed to handle route change:", error)
      }
    }
  }, [token, route.path, mounted, navigate])

  const handleLogin = (newToken: string) => {
    try {
      setToken(newToken)
      navigate("/tables")
    } catch (error) {
      console.warn("Failed to handle login:", error)
    }
  }

  const handleLogout = () => {
    try {
      setToken(null)
      localStorage.removeItem("admin_token")
      navigate("/login")
    } catch (error) {
      console.warn("Failed to handle logout:", error)
    }
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
