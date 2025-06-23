"use client"

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

export class ApiClient {
  private token: string
  private onUnauthorized: () => void

  constructor(token: string, onUnauthorized: () => void) {
    this.token = token
    this.onUnauthorized = onUnauthorized
  }

  private async mockApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate network delay
    await delay(300 + Math.random() * 200)

    // Simulate 401 for invalid tokens (uncomment to test)
    // if (Math.random() < 0.1) {
    //   this.onUnauthorized()
    //   throw new Error('Unauthorized')
    // }

    const method = options.method || "GET"
    const url = new URL(endpoint, "http://localhost")

    // Mock API responses
    if (url.pathname === "/api/v1/tables") {
      if (method === "GET") {
        return mockTables as T
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
        return newTable as T
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
        return mockTables[tableIndex] as T
      }

      if (method === "DELETE" && tableIndex !== -1) {
        mockTables.splice(tableIndex, 1)
        return { success: true } as T
      }
    }

    if (url.pathname === "/api/v1/admins") {
      if (method === "GET") {
        return mockAdmins as T
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
        return mockAdmins[adminIndex] as T
      }

      if (method === "DELETE" && adminIndex !== -1) {
        mockAdmins.splice(adminIndex, 1)
        return { success: true } as T
      }
    }

    if (url.pathname === "/api/v1/admins/auth-with-password") {
      if (method === "POST") {
        const body = JSON.parse(options.body as string)
        if (body.email === "admin@example.com" && body.password === "password") {
          return {
            token: "mock-jwt-token-" + Date.now(),
            user: mockAdmins[0],
          } as T
        }
        throw new Error("Invalid credentials")
      }
    }

    throw new Error(`Mock API: Unhandled ${method} ${endpoint}`)
  }

  async call<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // In production, this would be a real fetch call:
      // const response = await fetch(endpoint, {
      //   ...options,
      //   headers: {
      //     ...options.headers,
      //     Authorization: `Bearer ${this.token}`,
      //     'Content-Type': 'application/json',
      //   },
      // })
      //
      // if (response.status === 401) {
      //   this.onUnauthorized()
      //   throw new Error('Unauthorized')
      // }
      //
      // if (!response.ok) {
      //   throw new Error(`API call failed: ${response.statusText}`)
      // }
      //
      // return response.json()

      // For now, use mock API
      return this.mockApiCall<T>(endpoint, options)
    } catch (error) {
      console.error("API call failed:", error)
      throw error
    }
  }
}

export async function loginWithPassword(email: string, password: string) {
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
}
