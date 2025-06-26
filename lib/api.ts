"use client"

import type { AppMode } from "./app-state"

// Mock data for testing
const mockTables = [
  {
    id: "1",
    name: "users",
    type: "auth" as const,
    created: "2024-01-15T10:00:00Z",
    updated: "2024-01-15T10:00:00Z",
    rules: {
      list: "auth.id != None",
      get: "auth.id == record.id",
      add: "True",
      update: "auth.id == record.id",
      delete: "auth.role == 'admin'",
    },
    fields: [
      { name: "id", type: "string", primaryKey: true, nullable: false },
      { name: "email", type: "string", primaryKey: false, nullable: false },
      { name: "password", type: "string", primaryKey: false, nullable: false },
      { name: "created", type: "datetime", primaryKey: false, nullable: false },
      { name: "updated", type: "datetime", primaryKey: false, nullable: false },
    ],
  },
  {
    id: "2",
    name: "products",
    type: "base" as const,
    created: "2024-01-20T10:00:00Z",
    updated: "2024-01-20T10:00:00Z",
    rules: {
      list: "True",
      get: "True",
      add: "auth.id != None",
      update: "auth.id != None",
      delete: "auth.role == 'admin'",
    },
    fields: [
      { name: "id", type: "string", primaryKey: true, nullable: false },
      { name: "name", type: "string", primaryKey: false, nullable: false },
      { name: "price", type: "double", primaryKey: false, nullable: false },
      { name: "category", type: "string", primaryKey: false, nullable: true },
      { name: "created", type: "datetime", primaryKey: false, nullable: false },
      { name: "updated", type: "datetime", primaryKey: false, nullable: false },
    ],
  },
  {
    id: "3",
    name: "active_users_view",
    type: "view" as const,
    created: "2024-02-01T10:00:00Z",
    updated: "2024-02-01T10:00:00Z",
    rules: {
      list: "auth.role == 'admin'",
      get: "auth.role == 'admin'",
      add: "",
      update: "",
      delete: "",
    },
    sql: "SELECT id, email, created FROM users WHERE updated > NOW() - INTERVAL 30 DAY",
  },
]

const mockAdmins = [
  {
    id: "1",
    email: "admin@example.com",
    created: "2024-01-01T10:00:00Z",
    updated: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    email: "john.admin@example.com",
    created: "2024-01-15T10:00:00Z",
    updated: "2024-01-15T10:00:00Z",
  },
]

const mockSettings = {
  appName: "Mantis Admin",
  baseUrl: "https://api.example.com",
  version: "1.2.3",
  maintenanceMode: false,
  maxFileSize: "10MB",
  allowRegistration: true,
  emailVerificationRequired: false,
  sessionTimeout: 3600,
  mode: "TEST" as AppMode,
}

// API Response interface
interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface TableMetadata {
  id: string
  name: string
  type: "base" | "auth" | "view"
  created: string
  updated: string
  rules: {
    list: string
    get: string
    add: string
    update: string
    delete: string
  }
  fields?: Array<{
    name: string
    type: string
    primaryKey: boolean
    nullable: boolean
    unique?: boolean
    isFile?: boolean
  }>
  sql?: string
}

export interface Admin {
  id: string
  email: string
  created: string
  updated: string
}

export interface AppSettings {
  appName: string
  baseUrl: string
  version: string
  maintenanceMode: boolean
  maxFileSize: string
  allowRegistration: boolean
  emailVerificationRequired: boolean
  sessionTimeout: number
  mode: AppMode
}

export class ApiClient {
  private token: string
  private onUnauthorized: () => void
  private onError?: (error: string, type?: "error" | "warning") => void
  private requestCount = 0
  private maxRequests = 100
  private mode: AppMode
  private baseUrl: string

  constructor(
    token: string,
    onUnauthorized: () => void,
    mode: AppMode = "TEST",
    baseUrl = "https://api.example.com",
    onError?: (error: string, type?: "error" | "warning") => void,
  ) {
    this.token = token
    this.onUnauthorized = onUnauthorized
    this.onError = onError
    this.mode = mode
    this.baseUrl = baseUrl
  }

  private async mockApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Prevent infinite loops
    this.requestCount++
    if (this.requestCount > this.maxRequests) {
      return {
        data: null as T,
        error: "Too many API requests - possible infinite loop detected",
        status: 500,
      }
    }

    // Reset counter after a delay
    setTimeout(() => {
      this.requestCount = Math.max(0, this.requestCount - 1)
    }, 1000)

    // Simulate network delay
    await delay(300 + Math.random() * 200)

    // Simulate occasional errors for testing (reduced frequency)
    if (Math.random() < 0.02) {
      return {
        data: null as T,
        error: "Network error occurred",
        status: 500,
      }
    }

    // Simulate 401 for invalid tokens (uncomment to test)
    if (Math.random() < 0.01) {
      return {
        data: null as T,
        error: "Unauthorized - Session expired",
        status: 403,
      }
    }

    const method = options.method || "GET"
    const url = new URL(endpoint, "http://localhost")

    // Mock API responses
    if (url.pathname === "/api/v1/tables") {
      if (method === "GET") {
        return { data: mockTables as T, status: 200 }
      }
      if (method === "POST") {
        const body = JSON.parse(options.body as string)
        const newTable: TableMetadata = {
          id: String(mockTables.length + 1),
          ...body,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }
        mockTables.push(newTable)
        return { data: newTable as T, status: 201 }
      }
    }

    if (url.pathname.startsWith("/api/v1/tables/")) {
      const tableId = url.pathname.split("/").pop()
      const tableIndex = mockTables.findIndex((t) => t.id === tableId)

      if (method === "PATCH" && tableIndex !== -1) {
        const body = JSON.parse(options.body as string)
        mockTables[tableIndex] = {
          ...mockTables[tableIndex],
          ...body,
          updated: new Date().toISOString(),
        }
        return { data: mockTables[tableIndex] as T, status: 200 }
      }

      if (method === "DELETE" && tableIndex !== -1) {
        mockTables.splice(tableIndex, 1)
        return { data: null as T, status: 204 }
      }
    }

    if (url.pathname === "/api/v1/admins") {
      if (method === "GET") {
        return { data: mockAdmins as T, status: 200 }
      }
    }

    if (url.pathname.startsWith("/api/v1/admins/")) {
      const adminId = url.pathname.split("/").pop()
      const adminIndex = mockAdmins.findIndex((a) => a.id === adminId)

      if (method === "PATCH" && adminIndex !== -1) {
        const body = JSON.parse(options.body as string)
        mockAdmins[adminIndex] = {
          ...mockAdmins[adminIndex],
          updated: new Date().toISOString(),
        }
        return { data: mockAdmins[adminIndex] as T, status: 200 }
      }

      if (method === "DELETE" && adminIndex !== -1) {
        mockAdmins.splice(adminIndex, 1)
        return { data: null as T, status: 204 }
      }
    }

    if (url.pathname === "/api/v1/settings") {
      if (method === "GET") {
        console.log("Returning mock settings:", mockSettings)
        return { data: mockSettings as T, status: 200 }
      }
      if (method === "PATCH") {
        const body = JSON.parse(options.body as string)
        Object.assign(mockSettings, body)
        console.log("Updated mock settings:", mockSettings)
        return { data: mockSettings as T, status: 200 }
      }
    }

    if (url.pathname === "/api/v1/admins/auth-with-password") {
      if (method === "POST") {
        const body = JSON.parse(options.body as string)
        if (body.email === "admin@example.com" && body.password === "password") {
          return {
            data: {
              token: "mock-jwt-token-" + Date.now(),
              user: mockAdmins[0],
            } as T,
            status: 200,
          }
        }
        return {
          data: null as T,
          error: "Invalid credentials",
          status: 403,
        }
      }
    }

    return {
      data: null as T,
      error: `Mock API: Unhandled ${method} ${endpoint}`,
      status: 404,
    }
  }

  private async realApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle different status codes
      if (response.status === 204) {
        return { data: null as T, status: 204 }
      }

      const responseData = await response.json()

      // Check if response follows our API structure
      if (responseData.hasOwnProperty("data") && responseData.hasOwnProperty("status")) {
        return responseData as ApiResponse<T>
      }

      // If response doesn't follow our structure, wrap it
      if (response.ok) {
        return {
          data: responseData as T,
          status: response.status,
        }
      } else {
        return {
          data: null as T,
          error: responseData.message || responseData.error || "Request failed",
          status: response.status,
        }
      }
    } catch (error: any) {
      return {
        data: null as T,
        error: error.message || "Network error occurred",
        status: 500,
      }
    }
  }

  async call<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      let response: ApiResponse<T>

      if (this.mode === "TEST") {
        response = await this.mockApiCall<T>(endpoint, options)
      } else {
        response = await this.realApiCall<T>(endpoint, options)
      }

      // Handle error responses
      if (response.error || response.status >= 400) {
        const error = new Error(response.error || "Request failed")
        ;(error as any).status = response.status

        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          this.onUnauthorized()
          throw error
        }

        // Only call onError for non-auth errors to prevent loops
        if (this.onError && response.status !== 401 && response.status !== 403) {
          this.onError(response.error || "Request failed", "error")
        }

        throw error
      }

      return response.data
    } catch (error: any) {
      console.error("API call failed:", error)

      // Handle auth errors specifically
      if (error.status === 401 || error.status === 403 || error.message.includes("Unauthorized")) {
        this.onUnauthorized()
        throw error
      }

      // Only call onError for non-auth errors to prevent loops
      if (this.onError && !error.message.includes("Unauthorized")) {
        this.onError(error.message, "error")
      }

      throw error
    }
  }

  // Method to update mode
  updateMode(mode: AppMode, baseUrl?: string) {
    this.mode = mode
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }
}

export async function loginWithPassword(
  email: string,
  password: string,
  mode: AppMode = "TEST",
  baseUrl = "https://api.example.com",
) {
  if (mode === "TEST") {
    // Simulate network delay
    await delay(500)

    // Mock login - in production this would be a real API call
    if (email === "admin@example.com" && password === "password") {
      return {
        token: "mock-jwt-token-" + Date.now(),
        user: mockAdmins[0],
      }
    }

    throw new Error("Invalid credentials")
  } else {
    // Real API call
    try {
      const response = await fetch(`${baseUrl}/api/v1/admins/auth-with-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const responseData = await response.json()

      if (response.ok) {
        // Check if response follows our API structure
        if (responseData.data) {
          return responseData.data
        }
        return responseData
      } else {
        throw new Error(responseData.error || responseData.message || "Login failed")
      }
    } catch (error: any) {
      throw new Error(error.message || "Network error occurred")
    }
  }
}
