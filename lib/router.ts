"use client"

import * as React from "react"

export interface RouteParams {
  [key: string]: string
}

export interface ParsedRoute {
  path: string
  params: RouteParams
}

export function parseRoute(hash: string): ParsedRoute {
  // Remove the # if present
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash

  // If empty, default to /tables
  if (!cleanHash) {
    return { path: "/tables", params: {} }
  }

  // Split path and query string
  const [pathPart, queryPart] = cleanHash.split("?")

  // Parse query parameters
  const params: RouteParams = {}
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart)
    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }
  }

  return {
    path: pathPart || "/tables",
    params,
  }
}

export function buildRoute(path: string, params?: RouteParams): string {
  let route = `#${path}`

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        searchParams.set(key, value)
      }
    }
    const queryString = searchParams.toString()
    if (queryString) {
      route += `?${queryString}`
    }
  }

  return route
}

export function useRouter() {
  const [route, setRoute] = React.useState<ParsedRoute>(() => {
    if (typeof window !== "undefined") {
      return parseRoute(window.location.hash)
    }
    return { path: "/tables", params: {} }
  })

  React.useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseRoute(window.location.hash)
      setRoute(newRoute)
    }

    // Set initial route
    handleHashChange()

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const navigate = React.useCallback((path: string, params?: RouteParams) => {
    const newRoute = buildRoute(path, params)
    // Use history.pushState to avoid triggering hashchange event twice
    window.history.pushState(null, "", newRoute)
    // Manually trigger route update
    setRoute(parseRoute(newRoute))
  }, [])

  return { route, navigate }
}
