"use client"

import * as React from "react"

export type AppMode = "TEST" | "PROD"

interface AppState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const AppStateContext = React.createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<AppMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMode = localStorage.getItem("app_mode")
        return (savedMode as AppMode) || "TEST"
      } catch {
        return "TEST"
      }
    }
    return "TEST"
  })

  const updateMode = React.useCallback((newMode: AppMode) => {
    setMode(newMode)
    try {
      localStorage.setItem("app_mode", newMode)
    } catch (error) {
      console.warn("Failed to save app mode:", error)
    }
  }, [])

  const value = React.useMemo(
    () => ({
      mode,
      setMode: updateMode,
    }),
    [mode, updateMode],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}
