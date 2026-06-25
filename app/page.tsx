"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { MainApp } from "@/components/main-app"
import Script from "next/script"

// ─── Google "G" pixel-style SVG ────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

// ─── Shared background wrapper ──────────────────────────────────────────────
function PixelBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pixelated relative flex min-h-screen w-full items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(/desk-bg.gif)" }}
    >
      <div className="absolute inset-0 bg-background/55" aria-hidden />
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
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
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
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
        disabled:opacity-50
      "
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN VIEW
// ─────────────────────────────────────────────────────────────────────────────
function LoginView({
  onSwitch,
  onForgot,
}: {
  onSwitch: () => void
  onForgot: () => void
}) {
  const { login, loginWithGoogle, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const initializeGoogleSignIn = () => {
      const g = (window as any).google
      if (typeof window !== "undefined" && g && googleBtnRef.current) {
        g.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "774225900282-1nmsjbiqplgl186t03rmoo1clev9f2fb.apps.googleusercontent.com",
          callback: async (response: any) => {
            if (!active) return
            setLoading(true)
            try {
              await loginWithGoogle(response.credential)
            } catch (err) {
              console.error("Google sign in failed:", err)
            } finally {
              if (active) setLoading(false)
            }
          },
        })

        g.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_blue",
          size: "large",
          width: 320,
          text: "signin_with",
          shape: "square",
        })
      }
    }

    const interval = setInterval(() => {
      const g = (window as any).google
      if (typeof window !== "undefined" && g && googleBtnRef.current) {
        initializeGoogleSignIn()
        clearInterval(interval)
      }
    }, 100)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [loginWithGoogle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    try {
      await login(email.trim(), password.trim())
    } catch {
      // Error is set in auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <PixelBackground>
      <form onSubmit={handleSubmit} className="game-panel flex flex-col gap-5 p-8">
        <h1 className="text-center font-sans text-2xl tracking-widest text-foreground">
          SIGN IN
        </h1>

        {/* Google Sign-In Button */}
        <div className="flex w-full justify-center" ref={googleBtnRef} id="google-signin-btn" />


        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-dashed border-panel-border" />
          <span className="font-sans text-sm tracking-widest text-foreground/60">OR</span>
          <div className="flex-1 border-t border-dashed border-panel-border" />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-center font-mono text-xs text-urgent">{error}</p>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="login-email">
            Email
          </label>
          <PixelInput
            id="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError() }}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="login-password">
            Password
          </label>
          <PixelInput
            id="login-password"
            type="password"
            placeholder="*******"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError() }}
            autoComplete="current-password"
          />
        </div>

        {/* Login button */}
        <PixelButton type="submit" disabled={loading}>
          {loading ? "LOGGING IN..." : "LOGIN"}
        </PixelButton>

        {/* Register link */}
        <button
          type="button"
          onClick={onSwitch}
          className="font-mono text-sm text-cyan underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Don&apos;t have an account? Register
        </button>

        {/* Forgot password */}
        <button
          type="button"
          onClick={onForgot}
          className="font-mono text-sm text-foreground/50 underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Forgot Password?
        </button>
      </form>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER VIEW
// ─────────────────────────────────────────────────────────────────────────────
function RegisterView({ onSwitch }: { onSwitch: () => void }) {
  const { register, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError("")

    if (!email.trim() || !username.trim() || !password.trim()) {
      setLocalError("All fields are required.")
      return
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await register(email.trim(), username.trim(), password)
    } catch {
      // Error is set in auth context
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

  return (
    <PixelBackground>
      <form onSubmit={handleSubmit} className="game-panel flex flex-col gap-5 p-8">
        <h1 className="text-center font-sans text-2xl tracking-widest text-foreground">
          REGISTER
        </h1>

        {/* Error message */}
        {displayError && (
          <p className="text-center font-mono text-xs text-urgent">{displayError}</p>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reg-email">
            Email
          </label>
          <PixelInput
            id="reg-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError("") }}
            autoComplete="email"
          />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reg-username">
            Username
          </label>
          <PixelInput
            id="reg-username"
            type="text"
            placeholder="player1"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError(); setLocalError("") }}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reg-password">
            Password
          </label>
          <PixelInput
            id="reg-password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError("") }}
            autoComplete="new-password"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reg-confirm">
            Confirm Password
          </label>
          <PixelInput
            id="reg-confirm"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setLocalError("") }}
            autoComplete="new-password"
          />
        </div>

        {/* Register button */}
        <PixelButton type="submit" disabled={loading}>
          {loading ? "CREATING ACCOUNT..." : "REGISTER"}
        </PixelButton>

        {/* Switch to Login */}
        <button
          type="button"
          onClick={onSwitch}
          className="font-mono text-sm text-cyan underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Already have an account? Sign In
        </button>
      </form>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD VIEW  (enter email → send OTP)
// ─────────────────────────────────────────────────────────────────────────────
function ForgotView({
  onSend,
  onBack,
}: {
  onSend: (email: string) => Promise<void>
  onBack: () => void
}) {
  const { error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    try {
      await onSend(email.trim())
    } catch {
      // Error is stored in auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <PixelBackground>
      <form onSubmit={handleSubmit} className="game-panel flex flex-col gap-6 p-8">
        <h1 className="text-center font-sans text-2xl tracking-widest text-foreground">
          FORGOT PASSWORD
        </h1>
        <p className="text-center font-mono text-sm text-foreground/70">
          Enter your registered email to receive an OTP
        </p>

        {error && (
          <p className="text-center font-mono text-xs text-urgent">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="forgot-email">
            Email
          </label>
          <PixelInput
            id="forgot-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError() }}
            autoComplete="email"
          />
        </div>

        <PixelButton type="submit" disabled={loading}>
          {loading ? "SENDING..." : "SEND OTP"}
        </PixelButton>

        <button
          type="button"
          onClick={onBack}
          className="font-mono text-sm text-cyan underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Back to Login
        </button>
      </form>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP VIEW  (4-box entry + verify)
// ─────────────────────────────────────────────────────────────────────────────
function OtpView({
  email,
  onSuccess,
  onResend,
}: {
  email: string
  onSuccess: () => void
  onResend: () => Promise<void>
}) {
  const { resetPassword, error: apiError, clearError } = useAuth()
  const [digits, setDigits] = useState(["", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  function handleChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[idx] = char
    setDigits(next)
    setLocalError("")
    clearError()
    if (char && idx < 3) refs[idx + 1].current?.focus()
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    const next = ["", "", "", ""]
    pasted.split("").forEach((c, i) => { next[i] = c })
    setDigits(next)
    setLocalError("")
    clearError()
    refs[Math.min(pasted.length, 3)].current?.focus()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLocalError("")
    clearError()

    const code = digits.join("")
    if (code.length < 4) {
      setLocalError("Please enter all 4 digits.")
      return
    }

    if (!password) {
      setLocalError("Please enter a new password.")
      return
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, code, password)
      onSuccess()
    } catch {
      // Error is set in auth context
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setLocalError("")
    clearError()
    try {
      await onResend()
    } catch {
      // Error is set in auth context
    } finally {
      setResending(false)
    }
  }

  return (
    <PixelBackground>
      <form onSubmit={handleVerify} className="game-panel flex flex-col gap-6 p-8">
        <h1 className="text-center font-sans text-2xl tracking-widest text-foreground">
          RESET PASSWORD
        </h1>
        <p className="text-center font-mono text-sm text-foreground/70">
          Enter the OTP sent to your email
        </p>
        <p className="text-center font-mono text-xs text-cyan">{email}</p>

        {/* 4 OTP boxes */}
        <div className="flex justify-center gap-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`OTP digit ${i + 1}`}
              className="
                h-16 w-14 border border-panel-border bg-panel text-center
                font-mono text-2xl text-foreground backdrop-blur-sm outline-none
                transition-colors focus:border-cyan
              "
            />
          ))}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reset-new-password">
            New Password
          </label>
          <PixelInput
            id="reset-new-password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLocalError(""); clearError() }}
            autoComplete="new-password"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-base text-foreground" htmlFor="reset-confirm-password">
            Confirm Password
          </label>
          <PixelInput
            id="reset-confirm-password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(""); clearError() }}
            autoComplete="new-password"
          />
        </div>

        {(localError || apiError) && (
          <p className="text-center font-mono text-xs text-urgent">{localError || apiError}</p>
        )}

        <PixelButton type="submit" disabled={loading}>
          {loading ? "RESETTING..." : "RESET PASSWORD"}
        </PixelButton>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-mono text-sm text-cyan underline underline-offset-4 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {resending ? "RESENDING..." : "Resend Code"}
        </button>
      </form>
    </PixelBackground>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GATE — orchestrates login / register / forgot / OTP views
// ─────────────────────────────────────────────────────────────────────────────

type AuthView = "login" | "register" | "forgot" | "otp"

function AuthGate() {
  const { isAuthenticated, isLoading, sendForgotPasswordOtp, clearError } = useAuth()
  const [view, setView] = useState<AuthView>("login")
  const [forgotEmail, setForgotEmail] = useState("")

  // Show loading while checking localStorage for existing session
  if (isLoading) {
    return (
      <PixelBackground>
        <div className="game-panel flex flex-col items-center gap-4 p-8">
          <p className="font-sans text-lg tracking-widest text-cyan">LOADING...</p>
        </div>
      </PixelBackground>
    )
  }

  // Authenticated → show the app
  if (isAuthenticated) return <MainApp />

  // Register view
  if (view === "register") {
    return <RegisterView onSwitch={() => setView("login")} />
  }

  // Forgot password view
  if (view === "forgot") {
    return (
      <ForgotView
        onSend={async (email) => {
          await sendForgotPasswordOtp(email)
          setForgotEmail(email)
          setView("otp")
        }}
        onBack={() => {
          clearError()
          setView("login")
        }}
      />
    )
  }

  // OTP view
  if (view === "otp") {
    return (
      <OtpView
        email={forgotEmail}
        onSuccess={() => {
          clearError()
          setView("login")
        }}
        onResend={async () => {
          await sendForgotPasswordOtp(forgotEmail)
        }}
      />
    )
  }

  // Default: Login view
  return (
    <LoginView
      onSwitch={() => setView("register")}
      onForgot={() => setView("forgot")}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE — wraps everything in AuthProvider
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <AuthProvider>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <AuthGate />
    </AuthProvider>
  )
}
