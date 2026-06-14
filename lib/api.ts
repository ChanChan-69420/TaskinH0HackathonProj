// lib/api.ts
// ----------------------------------------------------------------------------
// Centralized API layer for talking to the FastAPI backend.
// - Reads the base URL from NEXT_PUBLIC_API_BASE_URL
// - Stores / restores the JWT in localStorage
// - Adds Content-Type + Authorization headers automatically
// - Normalizes backend JSON errors into a thrown ApiError
// ----------------------------------------------------------------------------

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000"

const TOKEN_KEY = "pixelquest_token"

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}

// ── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  // Allow passing a plain object that will be JSON-stringified, or a raw string.
  body?: unknown
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  }

  const token = getToken()
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      "Could not reach the server. Make sure the backend is running.",
      0,
    )
  }

  // 204 No Content / empty body
  const text = await response.text()
  const data = text ? safeJsonParse(text) : null

  if (!response.ok) {
    const message = extractErrorMessage(data) || `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }

  return data as T
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * FastAPI returns errors as { detail: "message" } or
 * { detail: [{ msg, loc, ... }] } for validation errors.
 */
function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return typeof data === "string" ? data : null
  }
  const detail = (data as { detail?: unknown }).detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (d && typeof d === "object" ? (d as { msg?: string }).msg : null))
      .filter(Boolean)
    if (msgs.length) return msgs.join(", ")
  }
  const message = (data as { message?: unknown }).message
  if (typeof message === "string") return message
  return null
}
