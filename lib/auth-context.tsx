"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api"

export type AuthUser = {
  id: string
  email: string
  username: string
  token: string
}

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  clearError: () => void
  sendForgotPasswordOtp: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")
      if (token && savedUser) {
        const parsed = JSON.parse(savedUser) as AuthUser
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const data = await api.post("/api/login", { email, password })
      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        username: data.username,
        token: data.token,
      }
      localStorage.setItem("token", authUser.token)
      localStorage.setItem("user", JSON.stringify(authUser))
      setUser(authUser)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed. Please try again."
      setError(message)
      throw err
    }
  }, [])

  const register = useCallback(async (email: string, username: string, password: string) => {
    setError(null)
    try {
      const data = await api.post("/api/register", { email, username, password })
      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        username: data.username,
        token: data.token,
      }
      localStorage.setItem("token", authUser.token)
      localStorage.setItem("user", JSON.stringify(authUser))
      setUser(authUser)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed. Please try again."
      setError(message)
      throw err
    }
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    setError(null)
    try {
      const data = await api.post("/api/auth/google", { credential })
      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        username: data.username,
        token: data.token,
      }
      localStorage.setItem("token", authUser.token)
      localStorage.setItem("user", JSON.stringify(authUser))
      setUser(authUser)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Google Sign-In failed. Please try again."
      setError(message)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const sendForgotPasswordOtp = useCallback(async (email: string) => {
    setError(null)
    try {
      await api.post("/api/auth/forgot-password", { email })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to send OTP. Please try again."
      setError(message)
      throw err
    }
  }, [])

  const resetPassword = useCallback(async (email: string, otp: string, new_password: string) => {
    setError(null)
    try {
      await api.post("/api/auth/reset-password", { email, otp, new_password })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Password reset failed. Please try again."
      setError(message)
      throw err
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
        sendForgotPasswordOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
