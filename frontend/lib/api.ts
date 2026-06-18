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
  // #region agent log
  fetch('http://127.0.0.1:7901/ingest/bb9cf196-d57d-436b-8df5-c292791dec1b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'df382b'},body:JSON.stringify({sessionId:'df382b',runId:'pre-fix',hypothesisId:'A-B-C',location:'lib/api.ts:request:pre-fetch',message:'API request starting',data:{method,path,url,apiBase:API_BASE,hasToken:!!token,pageOrigin:typeof window!=='undefined'?window.location.origin:null,pageHref:typeof window!=='undefined'?window.location.href:null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7901/ingest/bb9cf196-d57d-436b-8df5-c292791dec1b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'df382b'},body:JSON.stringify({sessionId:'df382b',runId:'pre-fix',hypothesisId:'A-B-C-D',location:'lib/api.ts:request:fetch-error',message:'Fetch failed before response',data:{method,path,url,apiBase:API_BASE,errorName:err instanceof Error?err.name:'unknown',errorMessage:err instanceof Error?err.message:String(err),pageOrigin:typeof window!=='undefined'?window.location.origin:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw err
  }

  // #region agent log
  fetch('http://127.0.0.1:7901/ingest/bb9cf196-d57d-436b-8df5-c292791dec1b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'df382b'},body:JSON.stringify({sessionId:'df382b',runId:'pre-fix',hypothesisId:'D',location:'lib/api.ts:request:post-fetch',message:'Fetch returned response',data:{method,path,url,status:res.status,ok:res.ok},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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
