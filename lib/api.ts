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

// const mockSettings = {
//   appName: "Mantis Admin",
//   baseUrl: "https://api.example.com",
//   version: "1.2.3",
//   maintenanceMode: false,
//   maxFileSize: "10MB",
//   allowRegistration: true,
//   emailVerificationRequired: false,
//   sessionTimeout: 3600,
//   mode: "TEST" as AppMode,
// }

// API Response interface
interface ApiResponse<T> {
  data: T
  error?: string
  status: number
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
    mode: AppMode = "PROD",
    baseUrl = "http://127.0.0.1:7070",
    onError?: (error: string, type?: "error" | "warning") => void,
  ) {
    this.token = token
    this.onUnauthorized = onUnauthorized
    this.onError = onError
    this.mode = mode
    this.baseUrl = baseUrl
  }

  private async realApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      }

      console.log(headers, this.baseUrl)

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
      console.log(endpoint)
      let response: ApiResponse<T> = await this.realApiCall<T>(endpoint, options)
      console.log(response)

      // Handle error responses
      if (response.error || response.status >= 400) {
        const error = new Error(response.error || "Request failed")
          ; (error as any).status = response.status

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
  mode: AppMode = "PROD",
  baseUrl = "http://127.0.0.1:7070",
) {
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
