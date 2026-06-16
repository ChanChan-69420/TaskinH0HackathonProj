/**
 * lib/api.ts
 * ----------
 * Centralized API client for communicating with the FastAPI backend.
 * Attaches JWT token from localStorage to every request.
 */

// Default to same-origin requests; Next.js rewrites proxy /api/* to the FastAPI backend.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_BASE}${path}`

  // Create a timeout promise that rejects after 5 seconds
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 5000)
  })

  let res: Response
  try {
    res = await Promise.race([
      fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      }),
      timeoutPromise
    ]) as Response
  } catch (err) {
    throw err
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail || detail
    } catch {
      // Response body wasn't JSON
    }

    if (res.status === 401 && !path.endsWith("/login") && !path.endsWith("/register")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.reload()
      }
    }

    throw new ApiError(detail, res.status)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T = any>(path: string) => request<T>("GET", path),
  post: <T = any>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T = any>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T = any>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T = any>(path: string) => request<T>("DELETE", path),
}
