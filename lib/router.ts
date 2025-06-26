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
    try {
      const searchParams = new URLSearchParams(queryPart)
      for (const [key, value] of searchParams.entries()) {
        params[key] = value
      }
    } catch (error) {
      console.warn("Failed to parse query parameters:", error)
    }
  }

  return {
    path: pathPart || "/tables",
    params,
  }
}

export function buildRoute(path: string, params?: RouteParams): string {
  let route = path.startsWith("/") ? path : `/${path}`

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

  return `#${route}`
}

export function useRouter() {
  const [route, setRoute] = React.useState<ParsedRoute>(() => {
    if (typeof window !== "undefined") {
      return parseRoute(window.location.hash)
    }
    return { path: "/tables", params: {} }
  })

  const updateRoute = React.useCallback(() => {
    const newRoute = parseRoute(window.location.hash)
    setRoute(newRoute)
  }, [])

  React.useEffect(() => {
    // Set initial route
    updateRoute()

    // Listen for hash changes
    const handleHashChange = () => {
      updateRoute()
    }

    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      updateRoute()
    }

    window.addEventListener("hashchange", handleHashChange)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [updateRoute])

  const navigate = React.useCallback((path: string, params?: RouteParams) => {
    const newRoute = buildRoute(path, params)

    // Prevent the hash from being used as a CSS selector by updating location properly
    if (window.location.hash !== newRoute) {
      window.location.hash = newRoute
    }
  }, [])

  return { route, navigate }
}
