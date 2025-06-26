"use client"

import type { AppMode } from "./app-state"

// Updated interfaces to match the API response format
export interface TableField {
  autoGeneratePattern: string | null
  defaultValue: string | null
  maxValue: number | null
  minValue: number | null
  name: string
  primaryKey: boolean
  required: boolean
  system: boolean
  type: string
  unique: boolean
  validator: string | null
}

export interface TableSchema {
  addRule: string
  deleteRule: string
  fields: TableField[]
  getRule: string
  has_api: boolean
  id: string
  listRule: string
  name: string
  system: boolean
  type: "base" | "auth" | "view"
  updateRule: string
  sql?: string
}

export interface TableMetadata {
  created: string
  has_api: boolean
  id: string
  name: string
  schema: TableSchema
  type: "base" | "auth" | "view"
  updated: string
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

// Mock data updated to match new format
const mockTables: TableMetadata[] = [
  {
    created: "2025-06-21 22:04:15",
    has_api: true,
    id: "mt_11699830787864871553",
    name: "users",
    schema: {
      addRule: "",
      deleteRule: "",
      fields: [
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "id",
          primaryKey: true,
          required: true,
          system: true,
          type: "string",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "created",
          primaryKey: false,
          required: true,
          system: true,
          type: "date",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "updated",
          primaryKey: false,
          required: true,
          system: true,
          type: "date",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: 5.0,
          name: "email",
          primaryKey: false,
          required: true,
          system: true,
          type: "string",
          unique: true,
          validator: "email",
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: 8.0,
          name: "password",
          primaryKey: false,
          required: true,
          system: true,
          type: "string",
          unique: false,
          validator: "password",
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: 2.0,
          name: "name",
          primaryKey: false,
          required: true,
          system: true,
          type: "string",
          unique: false,
          validator: null,
        },
      ],
      getRule: "",
      has_api: true,
      id: "mt_11699830787864871553",
      listRule: "",
      name: "users",
      system: false,
      type: "auth",
      updateRule: "",
    },
    type: "auth",
    updated: "2025-06-21 22:04:15",
  },
  {
    created: "2025-06-20 10:00:00",
    has_api: true,
    id: "mt_22699830787864871554",
    name: "products",
    schema: {
      addRule: "auth.id != None",
      deleteRule: "auth.role == 'admin'",
      fields: [
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "id",
          primaryKey: true,
          required: true,
          system: true,
          type: "string",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "created",
          primaryKey: false,
          required: true,
          system: true,
          type: "date",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "updated",
          primaryKey: false,
          required: true,
          system: true,
          type: "date",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: 1.0,
          name: "name",
          primaryKey: false,
          required: true,
          system: false,
          type: "string",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: 999999.0,
          minValue: 0.0,
          name: "price",
          primaryKey: false,
          required: true,
          system: false,
          type: "float64",
          unique: false,
          validator: null,
        },
        {
          autoGeneratePattern: null,
          defaultValue: null,
          maxValue: null,
          minValue: null,
          name: "category",
          primaryKey: false,
          required: false,
          system: false,
          type: "string",
          unique: false,
          validator: null,
        },
      ],
      getRule: "True",
      has_api: true,
      id: "mt_22699830787864871554",
      listRule: "True",
      name: "products",
      system: false,
      type: "base",
      updateRule: "auth.id != None",
    },
    type: "base",
    updated: "2025-06-20 10:00:00",
  },
  {
    created: "2025-06-19 15:30:00",
    has_api: true,
    id: "mt_33699830787864871555",
    name: "active_users_view",
    schema: {
      addRule: "",
      deleteRule: "",
      fields: [],
      getRule: "auth.role == 'admin'",
      has_api: true,
      id: "mt_33699830787864871555",
      listRule: "auth.role == 'admin'",
      name: "active_users_view",
      system: false,
      type: "view",
      updateRule: "",
      sql: "SELECT id, email, created FROM users WHERE updated > NOW() - INTERVAL 30 DAY",
    },
    type: "view",
    updated: "2025-06-19 15:30:00",
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
          id: `mt_${Date.now()}${Math.floor(Math.random() * 1000)}`,
          name: body.name,
          type: body.type,
          has_api: true,
          created: new Date().toISOString().replace("T", " ").slice(0, 19),
          updated: new Date().toISOString().replace("T", " ").slice(0, 19),
          schema: {
            id: `mt_${Date.now()}${Math.floor(Math.random() * 1000)}`,
            name: body.name,
            type: body.type,
            system: false,
            has_api: true,
            fields: body.fields || [],
            addRule: body.addRule || "",
            deleteRule: body.deleteRule || "",
            getRule: body.getRule || "",
            listRule: body.listRule || "",
            updateRule: body.updateRule || "",
            sql: body.sql,
          },
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
          updated: new Date().toISOString().replace("T", " ").slice(0, 19),
          schema: {
            ...mockTables[tableIndex].schema,
            ...body,
            fields: body.fields || mockTables[tableIndex].schema.fields,
          },
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
