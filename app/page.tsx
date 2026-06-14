"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MainApp } from "@/components/main-app"
import { apiFetch, setToken, clearToken, getToken, ApiError } from "@/lib/api"

// ─── Auth response shape (POST /api/login & /api/register) ──────────────────
type AuthResponse = {
  id: string
  email: string
  username: string
  token: string
  message: string
}

// ─── Shared background wrapper ──────────────────────────────────────────────
function PixelBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pixelated relative flex min-h-screen w-full items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(/desk-bg.gif)" }}
    >
      <div className="absolute inset-0 bg-background/55" aria-hidden />
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  )
}

// ─── Shared input ────────────────────────────────────────────────────────────
function PixelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`
        w-full rounded-none border border-panel-border bg-panel px-4 py-3
        font-mono text-base text-foreground placeholder:text-foreground/40
        outline-none backdrop-blur-sm transition-colors
        focus:border-cyan focus:ring-0
        ${props.className ?? ""}
      `}
    />
  )
}

// ─── Shared primary button ───────────────────────────────────────────────────
function PixelButton({
  children,
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode
  type?: "button" | "submit"
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="
        w-full border border-panel-border bg-panel px-6 py-3
        font-sans text-base tracking-widest text-foreground
        backdrop-blur-sm transition-colors hover:border-cyan hover:text-cyan
        disabled:cursor-not-allowed disabled:opacity-50
      "
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH VIEW — Login / Register toggle, both backed by the real API
// ─────────────────────────────────────────────────────────────────────────────
function AuthView({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim() || (mode === "register" && !username.trim())) {
      setError("Please fill in all fields.")
      return
    }

    setSubmitting(true)
    try {
      const path = mode === "login" ? "/api/login" : "/api/register"
      const body =
        mode === "login"
          ? { email: email.trim(), password }
          : { email: email.trim(), username: username.trim(), password }

      const res = await apiFetch<AuthResponse>(path, { method: "POST", body })

      // Persist session
      setToken(res.token)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("pixelquest_id", res.id)
        window.localStorage.setItem("pixelquest_email", res.email)
        window.localStorage.setItem("pixelquest_username", res.username)
      }
      onAuthed()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: "login" | "register") {
    setMode(next)
    setError(null)
    setPassword("")
  }

  return (
    <PixelBackground>
      <form onSubmit={handleSubmit} className="game-panel flex flex-col gap-5 p-8">
        <h1 className="text-center font-sans text-2xl tracking-widest text-foreground">
          {mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
        </h1>

        {/* Mode toggle */}
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`border-b-2 py-2 font-sans text-sm tracking-wide transition-colors ${
              mode === "login"
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-panel-border text-foreground/70"
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`border-b-2 py-2 font-sans text-sm tracking-wide transition-colors ${
              mode === "register"
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-panel-border text-foreground/70"
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="auth-email">
            Email
          </label>
          <PixelInput
            id="auth-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Username (register only) */}
        {mode === "register" && (
          <div className="flex flex-col gap-2">
            <label className="font-mono text-base text-foreground" htmlFor="auth-username">
              Username
            </label>
            <PixelInput
              id="auth-username"
              type="text"
              placeholder="player1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
        )}

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="auth-password">
            Password
          </label>
          <PixelInput
            id="auth-password"
            type="password"
            placeholder="*******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "register" && (
            <p className="font-mono text-xs text-foreground/50">At least 6 characters.</p>
          )}
        </div>

        {error && (
          <p className="border border-urgent/50 bg-urgent/10 px-3 py-2 text-center font-mono text-xs text-urgent">
            {error}
          </p>
        )}

        <PixelButton type="submit" disabled={submitting}>
          {submitting
            ? mode === "login"
              ? "LOGGING IN..."
              : "CREATING..."
            : mode === "login"
              ? "Login"
              : "Sign Up"}
        </PixelButton>
      </form>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN (while validating an existing token)
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <PixelBackground>
      <div className="game-panel flex flex-col items-center gap-4 p-8">
        <p className="font-sans text-lg tracking-widest text-cyan">LOADING...</p>
        <p className="font-mono text-sm text-foreground/60">Restoring your quest</p>
      </div>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE — orchestrates auth + session restore
// ─────────────────────────────────────────────────────────────────────────────
type Phase = "checking" | "unauthed" | "authed"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("checking")

  // On mount: if a token exists, validate it against /api/user/profile.
  useEffect(() => {
    let active = true
    async function restore() {
      const token = getToken()
      if (!token) {
        if (active) setPhase("unauthed")
        return
      }
      try {
        await apiFetch("/api/user/profile")
        if (active) setPhase("authed")
      } catch {
        // Token invalid/expired — clear it and show login.
        clearToken()
        if (active) setPhase("unauthed")
      }
    }
    void restore()
    return () => {
      active = false
    }
  }, [])

  function handleLogout() {
    clearToken()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("pixelquest_id")
      window.localStorage.removeItem("pixelquest_email")
      window.localStorage.removeItem("pixelquest_username")
    }
    setPhase("unauthed")
  }

  if (phase === "checking") return <LoadingScreen />
  if (phase === "authed") return <MainApp onLogout={handleLogout} />
  return <AuthView onAuthed={() => setPhase("authed")} />
}
